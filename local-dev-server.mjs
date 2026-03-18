import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { appendFile, mkdir, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { cwd } from "node:process";

const rootDir = cwd();
const port = 8000;
const logDir = resolve(rootDir, "analytics-relay", "logs");
const logFile = resolve(logDir, "local-events.ndjson");
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || "";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".wgsl": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

async function ensureLogDir() {
  await mkdir(logDir, { recursive: true });
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function sanitizePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalizedPath = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return normalizedPath;
}

async function resolveFile(pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = sanitizePath(requestedPath);
  let filePath = resolve(rootDir, "." + safePath);
  if (!filePath.startsWith(rootDir)) {
    throw new Error("forbidden");
  }

  let info;
  try {
    info = await stat(filePath);
  } catch (error) {
    return null;
  }

  if (info.isDirectory()) {
    const indexPath = join(filePath, "index.html");
    try {
      await stat(indexPath);
      filePath = indexPath;
    } catch (error) {
      return null;
    }
  }

  return filePath;
}

function summarizeEvent(event) {
  const page = event.page || {};
  const payload = event.payload || {};
  const visitor = event.visitor || {};
  const occurredAt = event.occurredAt || new Date().toISOString();
  const visitorId = String(visitor.id || "anon").slice(0, 8);
  const visitCount = visitor.visitCount ?? "?";
  const title = page.title || page.id || payload.projectTitle || "-";
  const route = page.route || page.path || "-";
  const project = page.projectId || payload.projectId || payload.targetProjectId || "-";
  return `[${occurredAt}] ${event.eventType || "unknown"} visitor=${visitorId} visit=${visitCount} page="${title}" route="${route}" project=${project}`;
}

async function persistEvent(event, request) {
  await ensureLogDir();
  const record = {
    receivedAt: new Date().toISOString(),
    remoteAddress: request.socket.remoteAddress || "",
    userAgent: request.headers["user-agent"] || "",
    origin: request.headers.origin || "",
    referer: request.headers.referer || "",
    event
  };
  await appendFile(logFile, JSON.stringify(record) + "\n", "utf8");
}

function shouldForwardToDiscord(eventType) {
  return eventType === "page_view";
}

function trimText(value, maxLength = 1024) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).slice(0, maxLength);
}

function formatIp(value) {
  if (!value) return "-";
  return String(value).replace(/^::ffff:/, "");
}

function formatResolution(value, includePixelRatio = false) {
  if (!value || (!value.width && !value.height)) return "-";
  const ratio = includePixelRatio && value.pixelRatio ? ` @${value.pixelRatio}x` : "";
  return `${value.width || 0}x${value.height || 0}${ratio}`;
}

function buildDiscordFields(event, requestInfo) {
  const page = event.page || {};
  const visitor = event.visitor || {};
  const session = event.session || {};
  const technical = event.technical || {};
  const fingerprint = visitor.fingerprintHash ? String(visitor.fingerprintHash).slice(0, 16) : "-";

  return [
    { name: "Time", value: trimText(event.occurredAt || new Date().toISOString()), inline: true },
    { name: "Post", value: trimText(page.projectTitle || page.projectId || page.title || page.id || "-"), inline: true },
    { name: "Visit", value: trimText(`#${visitor.visitCount ?? "?"} | ${String(session.id || "-").slice(0, 8)}`), inline: true },
    { name: "Route", value: trimText(page.route || page.path || "-"), inline: false },
    { name: "IP", value: trimText(formatIp(requestInfo.remoteAddress)), inline: true },
    { name: "Screen", value: trimText(formatResolution(technical.screen, true)), inline: true },
    { name: "Viewport", value: trimText(formatResolution(technical.viewport, false)), inline: true },
    { name: "Browser", value: trimText(`${technical.browserName || "-"} on ${technical.osName || "-"}`), inline: true },
    { name: "Device", value: trimText(technical.deviceType || "-"), inline: true },
    { name: "Fingerprint", value: trimText(fingerprint), inline: true }
  ];
}

async function forwardToDiscord(event, requestInfo) {
  if (!discordWebhookUrl) return;
  if (!shouldForwardToDiscord(event.eventType)) return;
  const body = {
    username: "Local Analytics",
    embeds: [
      {
        title: `Page View: ${trimText((event.page && (event.page.projectTitle || event.page.title || event.page.id)) || "Unknown", 200)}`,
        description: trimText((event.page && (event.page.path || event.page.route)) || "-", 400),
        timestamp: event.occurredAt || new Date().toISOString(),
        color: 0x3498db,
        fields: buildDiscordFields(event, requestInfo)
      }
    ]
  };
  const response = await fetch(discordWebhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Discord webhook failed (${response.status}): ${text}`);
  }
}

async function handleAnalytics(request, response) {
  let body = "";

  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 128_000) {
      request.destroy(new Error("payload_too_large"));
    }
  });

  request.on("end", async () => {
    try {
      const parsed = JSON.parse(body || "{}");
      await persistEvent(parsed, request);
      await forwardToDiscord(parsed, {
        remoteAddress: request.socket.remoteAddress || ""
      });
      console.log(summarizeEvent(parsed));
      sendJson(response, 202, {
        ok: true,
        stored: true,
        logFile
      });
    } catch (error) {
      sendJson(response, 400, {
        ok: false,
        error: body ? "event_processing_failed" : "invalid_json",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

async function serveStatic(pathname, response) {
  const filePath = await resolveFile(pathname);
  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("File not found");
    return;
  }

  const extension = extname(filePath).toLowerCase();
  const contentType = contentTypes[extension] || "application/octet-stream";
  response.writeHead(200, { "content-type": contentType });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://localhost");

  if (request.method === "POST" && url.pathname === "/v1/analytics") {
    await handleAnalytics(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/__analytics/health") {
    await ensureLogDir();
    sendJson(response, 200, {
      ok: true,
      service: "local-dev-server",
      logFile
    });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  await serveStatic(url.pathname, response);
});

server.listen(port, "0.0.0.0", async () => {
  await ensureLogDir();
  console.log(`[local-dev] serving ${rootDir} at http://localhost:${port}`);
  console.log(`[local-dev] analytics log file: ${logFile}`);
  console.log(`[local-dev] discord forwarding: ${discordWebhookUrl ? "enabled" : "disabled"}`);
});
