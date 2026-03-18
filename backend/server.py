#!/usr/bin/env python3
import json
import os
import sqlite3
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = Path(__file__).resolve().parent / "data"
MAX_BODY_BYTES = 128_000
DEFAULT_ALLOWED_ORIGINS = ",".join([
    "https://dimitrichrysafis.github.io",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
])


def utc_now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def env(name, default=""):
    return os.environ.get(name, default).strip()


class AnalyticsStore:
    def __init__(self, data_dir):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.db_path = self.data_dir / "analytics.sqlite3"
        self.log_path = self.data_dir / "events.ndjson"
        self.lock = threading.Lock()
        self._init_db()

    def _connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS events (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  received_at TEXT NOT NULL,
                  occurred_at TEXT,
                  event_type TEXT NOT NULL,
                  site_id TEXT,
                  visitor_id TEXT,
                  session_id TEXT,
                  page_id TEXT,
                  page_title TEXT,
                  page_path TEXT,
                  route TEXT,
                  page_type TEXT,
                  project_id TEXT,
                  project_title TEXT,
                  visit_count INTEGER,
                  ip_address TEXT,
                  forwarded_for TEXT,
                  origin TEXT,
                  referer TEXT,
                  user_agent TEXT,
                  browser_name TEXT,
                  os_name TEXT,
                  device_type TEXT,
                  country TEXT,
                  region TEXT,
                  city TEXT,
                  payload_json TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_events_received_at ON events(received_at DESC);
                CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
                CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);
                """
            )

    def persist(self, record):
        serialized = json.dumps(record, separators=(",", ":"), ensure_ascii=True)
        with self.lock:
            with self.log_path.open("a", encoding="utf-8") as handle:
                handle.write(serialized + "\n")
            with self._connect() as conn:
                conn.execute(
                    """
                    INSERT INTO events (
                      received_at, occurred_at, event_type, site_id, visitor_id, session_id,
                      page_id, page_title, page_path, route, page_type, project_id,
                      project_title, visit_count, ip_address, forwarded_for, origin,
                      referer, user_agent, browser_name, os_name, device_type, country,
                      region, city, payload_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record["receivedAt"],
                        record["event"].get("occurredAt"),
                        record["event"].get("eventType"),
                        record["event"].get("siteId"),
                        ((record["event"].get("visitor") or {}).get("id")),
                        ((record["event"].get("session") or {}).get("id")),
                        ((record["event"].get("page") or {}).get("id")),
                        ((record["event"].get("page") or {}).get("title")),
                        ((record["event"].get("page") or {}).get("path")),
                        ((record["event"].get("page") or {}).get("route")),
                        ((record["event"].get("page") or {}).get("type")),
                        ((record["event"].get("page") or {}).get("projectId")),
                        ((record["event"].get("page") or {}).get("projectTitle")),
                        ((record["event"].get("visitor") or {}).get("visitCount")),
                        record.get("ipAddress"),
                        record.get("forwardedFor"),
                        record.get("origin"),
                        record.get("referer"),
                        record.get("userAgent"),
                        ((record["event"].get("technical") or {}).get("browserName")),
                        ((record["event"].get("technical") or {}).get("osName")),
                        ((record["event"].get("technical") or {}).get("deviceType")),
                        record.get("country"),
                        record.get("region"),
                        record.get("city"),
                        serialized,
                    ),
                )


class AnalyticsBackend:
    def __init__(self):
        self.allowed_origins = self._parse_allowed_origins(
            env("ANALYTICS_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS)
        )
        self.discord_webhook_url = env("DISCORD_WEBHOOK_URL")
        self.discord_username = env("DISCORD_WEBHOOK_USERNAME", "Site Analytics")
        self.store = AnalyticsStore(env("ANALYTICS_DATA_DIR", str(DEFAULT_DATA_DIR)))

    def _parse_allowed_origins(self, raw):
        return [part.strip() for part in raw.split(",") if part.strip()]

    def origin_allowed(self, headers):
        origin = (headers.get("Origin") or "").strip()
        referer = (headers.get("Referer") or "").strip()
        if origin and origin in self.allowed_origins:
            return True
        if referer:
            try:
                referer_origin = "{uri.scheme}://{uri.netloc}".format(uri=urlparse(referer))
            except ValueError:
                referer_origin = ""
            if referer_origin in self.allowed_origins:
                return True
        return False

    def cors_origin(self, headers):
        origin = (headers.get("Origin") or "").strip()
        if origin in self.allowed_origins:
            return origin
        return self.allowed_origins[0] if self.allowed_origins else "*"

    def extract_ip(self, handler):
        forwarded_for = (handler.headers.get("X-Forwarded-For") or "").strip()
        if forwarded_for:
            return forwarded_for.split(",")[0].strip(), forwarded_for
        real_ip = (handler.headers.get("X-Real-IP") or "").strip()
        if real_ip:
            return real_ip, forwarded_for
        client_ip = handler.client_address[0] if handler.client_address else ""
        return client_ip, forwarded_for

    def make_record(self, handler, event):
        ip_address, forwarded_for = self.extract_ip(handler)
        return {
            "receivedAt": utc_now_iso(),
            "ipAddress": ip_address,
            "forwardedFor": forwarded_for,
            "origin": handler.headers.get("Origin", ""),
            "referer": handler.headers.get("Referer", ""),
            "userAgent": handler.headers.get("User-Agent", ""),
            "country": handler.headers.get("X-Country", ""),
            "region": handler.headers.get("X-Region", ""),
            "city": handler.headers.get("X-City", ""),
            "event": event,
        }

    def summarize_event(self, record):
        event = record.get("event") or {}
        page = event.get("page") or {}
        visitor = event.get("visitor") or {}
        title = page.get("projectTitle") or page.get("title") or page.get("id") or "-"
        route = page.get("route") or page.get("path") or "-"
        visit_count = visitor.get("visitCount", "?")
        visitor_id = str(visitor.get("id") or "anon")[:8]
        return (
            f"[{record['receivedAt']}] {event.get('eventType', 'unknown')} "
            f"visitor={visitor_id} visit={visit_count} ip={record.get('ipAddress') or '-'} "
            f"page=\"{title}\" route=\"{route}\""
        )

    def forward_to_discord(self, record):
        if not self.discord_webhook_url:
            return
        event = record.get("event") or {}
        if event.get("eventType") != "page_view":
            return

        page = event.get("page") or {}
        visitor = event.get("visitor") or {}
        session = event.get("session") or {}
        technical = event.get("technical") or {}
        fingerprint = str(visitor.get("fingerprintHash") or "-")[:16]

        fields = [
            {"name": "Time", "value": str(event.get("occurredAt") or record["receivedAt"])[:1024], "inline": True},
            {"name": "Post", "value": str(page.get("projectTitle") or page.get("projectId") or page.get("title") or page.get("id") or "-")[:1024], "inline": True},
            {"name": "Visit", "value": f"#{visitor.get('visitCount', '?')} | {str(session.get('id') or '-')[:8]}"[:1024], "inline": True},
            {"name": "Route", "value": str(page.get("route") or page.get("path") or "-")[:1024], "inline": False},
            {"name": "IP", "value": str(record.get("ipAddress") or "-")[:1024], "inline": True},
            {"name": "Referrer", "value": str(record.get("referer") or "(direct)")[:1024], "inline": True},
            {"name": "Screen", "value": self._format_resolution(technical.get("screen"), include_ratio=True), "inline": True},
            {"name": "Viewport", "value": self._format_resolution(technical.get("viewport"), include_ratio=False), "inline": True},
            {"name": "Browser", "value": f"{technical.get('browserName') or '-'} on {technical.get('osName') or '-'}"[:1024], "inline": True},
            {"name": "Device", "value": str(technical.get("deviceType") or "-")[:1024], "inline": True},
            {"name": "Fingerprint", "value": fingerprint[:1024], "inline": True},
        ]
        payload = {
            "username": self.discord_username or "Site Analytics",
            "embeds": [
                {
                    "title": f"Page View: {str(page.get('projectTitle') or page.get('title') or page.get('id') or 'Unknown')[:200]}",
                    "description": str(page.get("path") or page.get("route") or "-")[:400],
                    "timestamp": event.get("occurredAt") or record["receivedAt"],
                    "color": 0x3498DB,
                    "fields": fields,
                }
            ],
        }

        request = Request(
            self.discord_webhook_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"content-type": "application/json"},
            method="POST",
        )
        try:
            with urlopen(request, timeout=10) as response:
                if response.status >= 400:
                    raise RuntimeError(f"Discord webhook failed ({response.status})")
        except (HTTPError, URLError, RuntimeError) as exc:
            print(f"[analytics-backend] discord forward failed: {exc}")

    def _format_resolution(self, value, include_ratio):
        if not isinstance(value, dict):
            return "-"
        width = value.get("width") or 0
        height = value.get("height") or 0
        if not width and not height:
            return "-"
        suffix = ""
        if include_ratio and value.get("pixelRatio"):
            suffix = f" @{value.get('pixelRatio')}x"
        return f"{width}x{height}{suffix}"


BACKEND = AnalyticsBackend()


class AnalyticsHandler(BaseHTTPRequestHandler):
    server_version = "AnalyticsBackend/1.0"

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", BACKEND.cors_origin(self.headers))
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "content-type")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path != "/health":
            self._json(404, {"ok": False, "error": "not_found"})
            return
        self._json(
            200,
            {
                "ok": True,
                "service": "python-analytics-backend",
                "at": utc_now_iso(),
                "dataDir": str(BACKEND.store.data_dir),
            },
        )

    def do_POST(self):
        if self.path != "/v1/analytics":
            self._json(404, {"ok": False, "error": "not_found"})
            return
        if not BACKEND.origin_allowed(self.headers):
            self._json(403, {"ok": False, "error": "forbidden_origin"})
            return

        body = self._read_body()
        if body is None:
            return

        try:
            event = json.loads(body.decode("utf-8") or "{}")
        except json.JSONDecodeError as exc:
            self._json(400, {"ok": False, "error": "invalid_json", "message": str(exc)})
            return

        record = BACKEND.make_record(self, event)
        BACKEND.store.persist(record)
        BACKEND.forward_to_discord(record)
        print(BACKEND.summarize_event(record))
        self._json(
            202,
            {
                "ok": True,
                "stored": True,
                "eventType": event.get("eventType"),
                "ipAddress": record.get("ipAddress"),
            },
        )

    def log_message(self, fmt, *args):
        return

    def _read_body(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._json(400, {"ok": False, "error": "invalid_content_length"})
            return None

        if content_length <= 0 or content_length > MAX_BODY_BYTES:
            self._json(400, {"ok": False, "error": "invalid_payload_size"})
            return None

        body = self.rfile.read(content_length)
        if len(body) > MAX_BODY_BYTES:
            self._json(400, {"ok": False, "error": "invalid_payload_size"})
            return None
        return body

    def _json(self, status, payload):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def main():
    host = env("ANALYTICS_HOST", "0.0.0.0")
    port = int(env("ANALYTICS_PORT", "8788") or "8788")
    server = ThreadingHTTPServer((host, port), AnalyticsHandler)
    print(f"[analytics-backend] listening on http://{host}:{port}")
    print(f"[analytics-backend] data dir: {BACKEND.store.data_dir}")
    print(f"[analytics-backend] allowed origins: {', '.join(BACKEND.allowed_origins)}")
    print(
        "[analytics-backend] discord forwarding: "
        + ("enabled" if BACKEND.discord_webhook_url else "disabled")
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
