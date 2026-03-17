const analyticsHost = window.location.hostname || "";
const analyticsEndpoint = analyticsHost === "localhost" || analyticsHost === "127.0.0.1"
  ? "/v1/analytics"
  : "";

window.__SITE_ANALYTICS_CONFIG__ = {
  enabled: true,
  endpoint: analyticsEndpoint,
  siteId: "dimitrichrysafis.github.io",
  sessionInactivityMinutes: 30,
  heartbeatIntervalSeconds: 60,
  debug: analyticsEndpoint === "/v1/analytics"
};
