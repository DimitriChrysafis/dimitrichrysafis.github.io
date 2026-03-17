const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const MAX_PAYLOAD_BYTES = 32_000;
const MAX_JSON_TEXT = 12_000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return handleOptions(request, env);
    }

    if (url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "analytics-relay", at: new Date().toISOString() }, 200, request, env);
    }

    if (url.pathname !== "/v1/analytics" || request.method !== "POST") {
      return jsonResponse({ ok: false, error: "not_found" }, 404, request, env);
    }

    try {
      const result = await handleAnalytics(request, env, ctx);
      return jsonResponse(result.body, result.status, request, env);
    } catch (error) {
      return jsonResponse({
        ok: false,
        error: "internal_error",
        message: error instanceof Error ? error.message : String(error)
      }, 500, request, env);
    }
  }
};

async function handleAnalytics(request, env, ctx) {
  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";

  if (!isOriginAllowed(origin, referer, env)) {
    return {
      status: 403,
      body: { ok: false, error: "forbidden_origin" }
    };
  }

  const bodyText = await request.text();
  if (!bodyText || bodyText.length > MAX_PAYLOAD_BYTES) {
    return {
      status: 400,
      body: { ok: false, error: "invalid_payload_size" }
    };
  }

  let incoming;
  try {
    incoming = JSON.parse(bodyText);
  } catch (error) {
    return {
      status: 400,
      body: { ok: false, error: "invalid_json" }
    };
  }

  const normalized = await normalizeEvent(request, env, incoming);

  const rateLimitResult = await enforceRateLimit(env, normalized.rateLimitKey);
  if (!rateLimitResult.ok) {
    return {
      status: 429,
      body: { ok: false, error: "rate_limited", retryAfterSeconds: rateLimitResult.retryAfterSeconds }
    };
  }

  const persistence = await persistEvent(env, normalized);
  if (!persistence.ok) {
    return {
      status: 500,
      body: { ok: false, error: "persistence_failed", message: persistence.message }
    };
  }

  if (shouldForwardToDiscord(normalized.eventType) && env.DISCORD_WEBHOOK_URL) {
    ctx.waitUntil(sendDiscordWebhook(env, normalized));
  }

  return {
    status: 202,
    body: {
      ok: true,
      eventType: normalized.eventType,
      visitorKey: normalized.visitorKey,
      visitNumber: normalized.visitNumber,
      previousVisitCount: Math.max(0, normalized.visitNumber - 1)
    }
  };
}

function parseAllowedOrigins(env) {
  const raw = String(env.ALLOWED_ORIGINS || "").trim();
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, referer, env) {
  const allowedOrigins = parseAllowedOrigins(env);
  if (!allowedOrigins.length) return false;
  if (origin && allowedOrigins.includes(origin)) return true;
  if (!referer) return false;
  try {
    const refererOrigin = new URL(referer).origin;
    return allowedOrigins.includes(refererOrigin);
  } catch (error) {
    return false;
  }
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = parseAllowedOrigins(env);
  const responseOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*";
  return {
    "access-control-allow-origin": responseOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin"
  };
}

function jsonResponse(body, status, request, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: Object.assign({}, JSON_HEADERS, corsHeaders(request, env))
  });
}

function handleOptions(request, env) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, env)
  });
}

function limitString(value, maxLength = 255) {
  if (value === null || value === undefined) return null;
  return String(value).slice(0, maxLength);
}

function limitJson(value) {
  try {
    return JSON.stringify(value).slice(0, MAX_JSON_TEXT);
  } catch (error) {
    return JSON.stringify({ error: "json_serialization_failed" });
  }
}

function parseUserAgent(userAgent) {
  const ua = String(userAgent || "").toLowerCase();
  let browserName = "Unknown";
  let osName = "Unknown";

  if (ua.includes("edg/")) browserName = "Edge";
  else if (ua.includes("opr/") || ua.includes("opera")) browserName = "Opera";
  else if (ua.includes("chrome/")) browserName = "Chrome";
  else if (ua.includes("safari/") && !ua.includes("chrome/")) browserName = "Safari";
  else if (ua.includes("firefox/")) browserName = "Firefox";
  else if (ua.includes("zen")) browserName = "Zen";

  if (ua.includes("windows")) osName = "Windows";
  else if (ua.includes("mac os x") || ua.includes("macintosh")) osName = "macOS";
  else if (ua.includes("android")) osName = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) osName = "iOS";
  else if (ua.includes("linux")) osName = "Linux";

  return { browserName, osName };
}

function isLikelyBot(userAgent) {
  return /bot|crawl|spider|preview|scanner|headless/i.test(String(userAgent || ""));
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

async function normalizeEvent(request, env, incoming) {
  const receivedAt = new Date().toISOString();
  const technical = incoming && typeof incoming.technical === "object" ? incoming.technical : {};
  const visitor = incoming && typeof incoming.visitor === "object" ? incoming.visitor : {};
  const session = incoming && typeof incoming.session === "object" ? incoming.session : {};
  const page = incoming && typeof incoming.page === "object" ? incoming.page : {};
  const payload = incoming && typeof incoming.payload === "object" ? incoming.payload : {};
  const requestCf = request.cf || {};
  const userAgent = request.headers.get("user-agent") || technical.userAgent || "";
  const parsedUa = parseUserAgent(userAgent);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const salt = String(env.ANALYTICS_HASH_SALT || "analytics-salt");

  const visitorSource = visitor.id || visitor.fingerprintHash || [
    userAgent,
    technical.language,
    technical.timezone,
    technical.platform
  ].join("|");

  const visitorKey = await sha256Hex("visitor|" + salt + "|" + visitorSource);
  const ipHash = ip ? await sha256Hex("ip|" + salt + "|" + ip) : null;
  const eventType = limitString(incoming.eventType || "unknown", 80);
  const isBot = isLikelyBot(userAgent);
  const deviceType = limitString(technical.deviceType || "unknown", 40);
  const browserName = limitString(technical.browserName || parsedUa.browserName, 80);
  const osName = limitString(technical.osName || parsedUa.osName, 80);
  const pageDurationMs = normalizeInteger(page.durationMs || payload.pageDurationMs);
  const pageActiveMs = normalizeInteger(page.activeDurationMs || payload.pageActiveMs);
  const sessionActiveMs = normalizeInteger(session.activeDurationMs || payload.sessionActiveMs);
  const sessionId = limitString(session.id || "anonymous-session", 120);

  return {
    raw: incoming,
    receivedAt,
    eventType,
    siteId: limitString(incoming.siteId || "unknown-site", 120),
    occurredAt: limitString(incoming.occurredAt || receivedAt, 80),
    visitorId: limitString(visitor.id, 120),
    fingerprintHash: limitString(visitor.fingerprintHash, 120),
    visitorKey,
    sessionId,
    sessionStartedAt: limitString(session.startedAt || receivedAt, 80),
    sessionIsNew: Boolean(session.isNewSession),
    visitNumber: Math.max(1, normalizeInteger(visitor.visitCount) || 1),
    previousVisitCount: Math.max(0, normalizeInteger(visitor.previousVisitCount)),
    pageId: limitString(page.id, 160),
    pagePath: limitString(page.path, 300),
    pageTitle: limitString(page.title, 200),
    route: limitString(page.route, 300),
    pageType: limitString(page.type, 80),
    projectId: limitString(page.projectId || payload.projectId || payload.targetProjectId, 120),
    projectTitle: limitString(page.projectTitle || payload.projectTitle, 200),
    pageDurationMs,
    pageActiveMs,
    sessionActiveMs,
    referrer: limitString(page.referrer || payload.referrer || request.headers.get("referer"), 300),
    ipHash,
    ipAddress: limitString(ip, 80),
    country: limitString(requestCf.country, 64),
    region: limitString(requestCf.region || requestCf.regionCode, 64),
    city: limitString(requestCf.city, 120),
    timezone: limitString(technical.timezone, 120),
    locale: limitString(technical.locale || technical.language, 120),
    language: limitString(technical.language, 80),
    deviceType,
    browserName,
    osName,
    embedded: page.embedded ? 1 : 0,
    userAgent: limitString(userAgent, 500),
    technical,
    payload,
    isBot,
    rateLimitKey: ipHash || visitorKey
  };
}

function normalizeInteger(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
}

async function enforceRateLimit(env, rateLimitKey) {
  if (!env.ANALYTICS_KV) {
    return { ok: true };
  }

  const limitPerMinute = Math.max(10, Number.parseInt(env.RATE_LIMIT_PER_MINUTE || "60", 10) || 60);
  const bucket = new Date().toISOString().slice(0, 16);
  const key = "ratelimit:" + rateLimitKey + ":" + bucket;
  const current = Number.parseInt((await env.ANALYTICS_KV.get(key)) || "0", 10) || 0;

  if (current >= limitPerMinute) {
    return { ok: false, retryAfterSeconds: 60 };
  }

  await env.ANALYTICS_KV.put(key, String(current + 1), { expirationTtl: 120 });
  return { ok: true };
}

async function persistEvent(env, event) {
  if (!env.DB) {
    return { ok: true, visitNumber: event.visitNumber };
  }

  try {
    const visitorRecord = await env.DB
      .prepare("SELECT visit_count, session_count, last_session_id FROM visitors WHERE visitor_key = ?1")
      .bind(event.visitorKey)
      .first();

    let visitNumber = visitorRecord ? Number(visitorRecord.visit_count || 0) : 0;
    let sessionCount = visitorRecord ? Number(visitorRecord.session_count || 0) : 0;
    const isNewSession = !visitorRecord || visitorRecord.last_session_id !== event.sessionId;

    if (isNewSession && event.sessionIsNew) {
      visitNumber += 1;
      sessionCount += 1;
    } else if (visitNumber === 0) {
      visitNumber = event.visitNumber || 1;
      sessionCount = Math.max(1, sessionCount);
    } else if (sessionCount === 0) {
      sessionCount = 1;
    }

    event.visitNumber = Math.max(1, visitNumber);

    const visitorMetadata = limitJson({
      technical: event.technical,
      isBot: event.isBot
    });

    await env.DB.prepare(`
      INSERT INTO visitors (
        visitor_key, visitor_id, fingerprint_hash, first_seen_at, last_seen_at,
        visit_count, session_count, last_session_id, last_path, last_title,
        last_referrer, last_country, last_region, last_city, timezone, locale,
        device_type, browser_name, os_name, metadata_json
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)
      ON CONFLICT(visitor_key) DO UPDATE SET
        visitor_id = excluded.visitor_id,
        fingerprint_hash = excluded.fingerprint_hash,
        last_seen_at = excluded.last_seen_at,
        visit_count = excluded.visit_count,
        session_count = excluded.session_count,
        last_session_id = excluded.last_session_id,
        last_path = excluded.last_path,
        last_title = excluded.last_title,
        last_referrer = excluded.last_referrer,
        last_country = excluded.last_country,
        last_region = excluded.last_region,
        last_city = excluded.last_city,
        timezone = excluded.timezone,
        locale = excluded.locale,
        device_type = excluded.device_type,
        browser_name = excluded.browser_name,
        os_name = excluded.os_name,
        metadata_json = excluded.metadata_json
    `).bind(
      event.visitorKey,
      event.visitorId,
      event.fingerprintHash,
      event.sessionStartedAt,
      event.receivedAt,
      event.visitNumber,
      sessionCount,
      event.sessionId,
      event.pagePath,
      event.pageTitle,
      event.referrer,
      event.country,
      event.region,
      event.city,
      event.timezone,
      event.locale,
      event.deviceType,
      event.browserName,
      event.osName,
      visitorMetadata
    ).run();

    const existingSession = await env.DB
      .prepare("SELECT page_views, total_active_ms FROM sessions WHERE session_id = ?1")
      .bind(event.sessionId)
      .first();

    const nextPageViews = existingSession
      ? Number(existingSession.page_views || 0) + (event.eventType === "page_view" ? 1 : 0)
      : (event.eventType === "page_view" ? 1 : 0);
    const nextActiveMs = Math.max(
      Number(existingSession ? existingSession.total_active_ms || 0 : 0),
      event.sessionActiveMs || 0
    );

    await env.DB.prepare(`
      INSERT INTO sessions (
        session_id, visitor_key, started_at, last_event_at, last_path, last_title,
        page_views, total_active_ms, embedded, first_referrer, last_referrer,
        country, region, city, timezone, user_agent
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)
      ON CONFLICT(session_id) DO UPDATE SET
        visitor_key = excluded.visitor_key,
        last_event_at = excluded.last_event_at,
        last_path = excluded.last_path,
        last_title = excluded.last_title,
        page_views = excluded.page_views,
        total_active_ms = excluded.total_active_ms,
        embedded = excluded.embedded,
        last_referrer = excluded.last_referrer,
        country = excluded.country,
        region = excluded.region,
        city = excluded.city,
        timezone = excluded.timezone,
        user_agent = excluded.user_agent
    `).bind(
      event.sessionId,
      event.visitorKey,
      event.sessionStartedAt,
      event.receivedAt,
      event.pagePath,
      event.pageTitle,
      nextPageViews,
      nextActiveMs,
      event.embedded,
      event.referrer,
      event.referrer,
      event.country,
      event.region,
      event.city,
      event.timezone,
      event.userAgent
    ).run();

    await env.DB.prepare(`
      INSERT INTO events (
        received_at, event_type, site_id, visitor_key, session_id, page_id, page_path,
        page_title, route, page_type, project_id, project_title, page_duration_ms,
        page_active_ms, session_active_ms, visit_number, referrer, ip_hash, country,
        region, city, timezone, locale, device_type, browser_name, os_name, embedded,
        payload_json
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28)
    `).bind(
      event.receivedAt,
      event.eventType,
      event.siteId,
      event.visitorKey,
      event.sessionId,
      event.pageId,
      event.pagePath,
      event.pageTitle,
      event.route,
      event.pageType,
      event.projectId,
      event.projectTitle,
      event.pageDurationMs,
      event.pageActiveMs,
      event.sessionActiveMs,
      event.visitNumber,
      event.referrer,
      event.ipHash,
      event.country,
      event.region,
      event.city,
      event.timezone,
      event.locale,
      event.deviceType,
      event.browserName,
      event.osName,
      event.embedded,
      limitJson({
        payload: event.payload,
        technical: event.technical,
        occurredAt: event.occurredAt
      })
    ).run();

    return { ok: true, visitNumber: event.visitNumber };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

function shouldForwardToDiscord(eventType) {
  return eventType === "page_view";
}

function formatDuration(ms) {
  const safeMs = Math.max(0, Number(ms) || 0);
  if (safeMs < 1000) return safeMs + " ms";
  const seconds = Math.floor(safeMs / 1000);
  if (seconds < 60) return seconds + " s";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes + "m " + remainingSeconds + "s";
}

function shortId(value) {
  const text = String(value || "");
  if (text.length <= 12) return text;
  return text.slice(0, 6) + "..." + text.slice(-4);
}

function trimText(value, maxLength = 1024) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).slice(0, maxLength);
}

function formatResolution(value, includePixelRatio = false) {
  if (!value || (!value.width && !value.height)) return "-";
  const ratio = includePixelRatio && value.pixelRatio ? ` @${value.pixelRatio}x` : "";
  return `${value.width || 0}x${value.height || 0}${ratio}`;
}

async function sendDiscordWebhook(env, event) {
  const technical = event.technical || {};
  const fingerprint = event.fingerprintHash ? String(event.fingerprintHash).slice(0, 16) : shortId(event.visitorKey);

  const payload = {
    username: env.DISCORD_WEBHOOK_USERNAME || "Site Analytics",
    avatar_url: env.DISCORD_WEBHOOK_AVATAR_URL || undefined,
    embeds: [
      {
        title: "Page View: " + trimText(event.projectTitle || event.pageTitle || event.pageId || "Unknown", 200),
        description: trimText(event.pagePath || event.route || "-", 400),
        color: colorForEvent(event.eventType),
        timestamp: event.receivedAt,
        fields: [
          {
            name: "Time",
            value: trimText(event.receivedAt),
            inline: true
          },
          {
            name: "Post",
            value: trimText(event.projectTitle || event.projectId || event.pageTitle || event.pageId || "-"),
            inline: true
          },
          {
            name: "Visit",
            value: trimText(`#${event.visitNumber} | ${shortId(event.sessionId)}`),
            inline: true
          },
          {
            name: "IP",
            value: trimText(event.ipAddress || "-"),
            inline: true
          },
          {
            name: "Location",
            value: trimText([event.city, event.region, event.country].filter(Boolean).join(", ") || "-"),
            inline: true
          },
          {
            name: "Referrer",
            value: trimText(event.referrer || "(direct)"),
            inline: true
          },
          {
            name: "Screen",
            value: trimText(formatResolution(technical.screen, true)),
            inline: true
          },
          {
            name: "Viewport",
            value: trimText(formatResolution(technical.viewport, false)),
            inline: true
          },
          {
            name: "Browser",
            value: trimText(`${event.browserName || "-"} on ${event.osName || "-"}`),
            inline: true
          },
          {
            name: "Device",
            value: trimText(event.deviceType || "-"),
            inline: true
          },
          {
            name: "Fingerprint",
            value: trimText(fingerprint),
            inline: true
          },
          {
            name: "Active Time",
            value: trimText(`page ${formatDuration(event.pageActiveMs)} | session ${formatDuration(event.sessionActiveMs)}`),
            inline: true
          }
        ]
      }
    ]
  };

  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

function colorForEvent(eventType) {
  return eventType === "page_view" ? 0x3498db : 0x95a5a6;
}
