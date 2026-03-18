const analyticsHost = window.location.hostname || "";
const localhostBackendBaseUrl = "http://127.0.0.1:8788";
const productionBackendBaseUrl = "https://replace-this-with-your-ngrok-url.ngrok-free.app";

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function resolveAnalyticsBaseUrl() {
  if (analyticsHost === "localhost" || analyticsHost === "127.0.0.1") {
    return normalizeBaseUrl(localhostBackendBaseUrl);
  }

  const configured = normalizeBaseUrl(productionBackendBaseUrl);
  if (!configured || configured.includes("replace-this-with-your-ngrok-url")) {
    return "";
  }
  return configured;
}

const analyticsBaseUrl = resolveAnalyticsBaseUrl();
const analyticsEndpoint = analyticsBaseUrl ? `${analyticsBaseUrl}/v1/analytics` : "";

window.__SITE_ANALYTICS_CONFIG__ = {
  enabled: true,
  endpoint: analyticsEndpoint,
  siteId: "dimitrichrysafis.github.io",
  sessionInactivityMinutes: 30,
  heartbeatIntervalSeconds: 60,
  debug: analyticsHost === "localhost" || analyticsHost === "127.0.0.1"
};
