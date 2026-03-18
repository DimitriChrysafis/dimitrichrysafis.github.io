(function analyticsBootstrap() {
  const config = Object.assign({
    enabled: true,
    endpoint: "",
    siteId: window.location.hostname || "local-site",
    sessionInactivityMinutes: 30,
    debug: false
  }, window.__SITE_ANALYTICS_CONFIG__ || {});

  const endpoint = typeof config.endpoint === "string" ? config.endpoint.trim() : "";
  const enabled = Boolean(config.enabled && endpoint);
  const storage = getStorage();
  const state = {
    enabled,
    visitor: null,
    session: null,
    technical: null
  };

  const STORAGE_KEYS = {
    visitorId: "site_analytics_visitor_id",
    firstSeenAt: "site_analytics_first_seen_at",
    visitCount: "site_analytics_visit_count",
    lastVisitAt: "site_analytics_last_visit_at",
    session: "site_analytics_session"
  };

  function debugLog() {
    if (!config.debug || !window.console) return;
    console.log("[analytics]", ...arguments);
  }

  function getStorage() {
    const memory = new Map();
    try {
      const key = "__analytics_probe__";
      window.localStorage.setItem(key, "1");
      window.localStorage.removeItem(key);
      return window.localStorage;
    } catch (error) {
      return {
        getItem(key) {
          return memory.has(key) ? memory.get(key) : null;
        },
        setItem(key, value) {
          memory.set(key, String(value));
        }
      };
    }
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function nowMs() {
    return Date.now();
  }

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "id-" + Math.random().toString(36).slice(2) + "-" + nowMs().toString(36);
  }

  function safeJsonParse(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function clampNumber(value, fallback = null) {
    return Number.isFinite(value) ? value : fallback;
  }

  function detectBrowser(userAgent) {
    const ua = String(userAgent || "").toLowerCase();
    if (ua.includes("edg/")) return "Edge";
    if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
    if (ua.includes("chrome/")) return "Chrome";
    if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
    if (ua.includes("firefox/")) return "Firefox";
    return "Unknown";
  }

  function detectOs(userAgent) {
    const ua = String(userAgent || "").toLowerCase();
    if (ua.includes("windows")) return "Windows";
    if (ua.includes("mac os x") || ua.includes("macintosh")) return "macOS";
    if (ua.includes("android")) return "Android";
    if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
    if (ua.includes("linux")) return "Linux";
    return "Unknown";
  }

  function detectDeviceType(userAgent) {
    const ua = String(userAgent || "").toLowerCase();
    if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
    if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) return "mobile";
    return "desktop";
  }

  function collectTechnicalMetadata() {
    const userAgent = navigator.userAgent || "";
    return {
      userAgent,
      browserName: detectBrowser(userAgent),
      osName: detectOs(userAgent),
      deviceType: detectDeviceType(userAgent),
      language: navigator.language || "",
      languages: Array.isArray(navigator.languages) ? navigator.languages.slice(0, 5) : [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      locale: Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || "",
      platform: navigator.platform || "",
      hardwareConcurrency: clampNumber(navigator.hardwareConcurrency),
      deviceMemory: clampNumber(navigator.deviceMemory),
      maxTouchPoints: clampNumber(navigator.maxTouchPoints, 0),
      viewport: {
        width: clampNumber(window.innerWidth, 0),
        height: clampNumber(window.innerHeight, 0)
      },
      screen: {
        width: clampNumber(window.screen && window.screen.width, 0),
        height: clampNumber(window.screen && window.screen.height, 0),
        colorDepth: clampNumber(window.screen && window.screen.colorDepth, 0),
        pixelRatio: clampNumber(window.devicePixelRatio, 1)
      }
    };
  }

  async function sha256Hex(input) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return String(input || "");
    }
    const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(input || "")));
    return Array.from(new Uint8Array(digest)).map((item) => item.toString(16).padStart(2, "0")).join("");
  }

  async function buildVisitorState(technical) {
    let visitorId = storage.getItem(STORAGE_KEYS.visitorId);
    if (!visitorId) {
      visitorId = randomId();
      storage.setItem(STORAGE_KEYS.visitorId, visitorId);
    }

    let firstSeenAt = storage.getItem(STORAGE_KEYS.firstSeenAt);
    if (!firstSeenAt) {
      firstSeenAt = nowIso();
      storage.setItem(STORAGE_KEYS.firstSeenAt, firstSeenAt);
    }

    let visitCount = Number.parseInt(storage.getItem(STORAGE_KEYS.visitCount) || "0", 10) || 0;
    visitCount += 1;
    storage.setItem(STORAGE_KEYS.visitCount, String(visitCount));
    storage.setItem(STORAGE_KEYS.lastVisitAt, nowIso());

    const fingerprintHash = await sha256Hex([
      technical.userAgent,
      technical.language,
      technical.timezone,
      technical.platform,
      technical.screen.width,
      technical.screen.height,
      technical.screen.pixelRatio
    ].join("|"));

    return {
      id: visitorId,
      firstSeenAt,
      visitCount,
      previousVisitCount: Math.max(0, visitCount - 1),
      fingerprintHash
    };
  }

  function buildSessionState() {
    const inactivityMs = Math.max(1, Number(config.sessionInactivityMinutes) || 30) * 60 * 1000;
    const current = safeJsonParse(storage.getItem(STORAGE_KEYS.session), null);
    const now = nowMs();
    const reusable = current && current.expiresAt > now;
    const session = reusable ? current : { id: randomId(), startedAt: nowIso() };
    session.lastSeenAt = nowIso();
    session.expiresAt = now + inactivityMs;
    storage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    return session;
  }

  function derivePageContext(overrides) {
    const dataset = document.body ? document.body.dataset || {} : {};
    const pathname = window.location.pathname || "/";
    return {
      id: overrides && overrides.pageId ? overrides.pageId : (dataset.analyticsPage || pathname),
      type: overrides && overrides.pageType ? overrides.pageType : (dataset.analyticsPageType || "page"),
      title: overrides && overrides.title ? overrides.title : (dataset.analyticsTitle || document.title || pathname),
      path: pathname + (window.location.search || ""),
      route: overrides && overrides.route ? overrides.route : (window.location.hash ? window.location.hash.slice(1) : pathname),
      projectId: overrides && Object.prototype.hasOwnProperty.call(overrides, "projectId")
        ? overrides.projectId
        : (dataset.analyticsProject || null),
      projectTitle: overrides && Object.prototype.hasOwnProperty.call(overrides, "projectTitle")
        ? overrides.projectTitle
        : (dataset.analyticsProjectTitle || null),
      referrer: document.referrer || ""
    };
  }

  function postPageView(page) {
    if (!state.enabled) return Promise.resolve(false);
    const envelope = {
      schemaVersion: "2026-03-17",
      siteId: config.siteId,
      eventType: "page_view",
      occurredAt: nowIso(),
      visitor: state.visitor,
      session: {
        id: state.session.id,
        startedAt: state.session.startedAt,
        lastSeenAt: state.session.lastSeenAt
      },
      page,
      technical: state.technical,
      payload: {}
    };

    return fetch(endpoint, {
      method: "POST",
      keepalive: true,
      cache: "no-store",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(envelope)
    }).catch((error) => {
      debugLog("page_view failed", error);
      return false;
    });
  }

  async function initialize() {
    if (!state.enabled) {
      window.siteAnalytics = {
        enabled: false,
        virtualPage() { return Promise.resolve(false); }
      };
      return;
    }

    state.technical = collectTechnicalMetadata();
    state.visitor = await buildVisitorState(state.technical);
    state.session = buildSessionState();

    window.siteAnalytics = {
      enabled: true,
      virtualPage(page) {
        return postPageView(derivePageContext(page));
      }
    };

    const dataset = document.body ? document.body.dataset || {} : {};
    if (dataset.analyticsAutoPageview !== "false") {
      await postPageView(derivePageContext());
    }

    debugLog("initialized", {
      visitorId: state.visitor.id,
      sessionId: state.session.id,
      visitCount: state.visitor.visitCount
    });
  }

  initialize().catch((error) => {
    debugLog("initialization failed", error);
    window.siteAnalytics = {
      enabled: false,
      virtualPage() { return Promise.resolve(false); }
    };
  });
})();
