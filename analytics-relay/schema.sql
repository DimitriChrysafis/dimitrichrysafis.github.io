CREATE TABLE IF NOT EXISTS visitors (
  visitor_key TEXT PRIMARY KEY,
  visitor_id TEXT,
  fingerprint_hash TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 0,
  session_count INTEGER NOT NULL DEFAULT 0,
  last_session_id TEXT,
  last_path TEXT,
  last_title TEXT,
  last_referrer TEXT,
  last_country TEXT,
  last_region TEXT,
  last_city TEXT,
  timezone TEXT,
  locale TEXT,
  device_type TEXT,
  browser_name TEXT,
  os_name TEXT,
  metadata_json TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  visitor_key TEXT NOT NULL,
  started_at TEXT NOT NULL,
  last_event_at TEXT NOT NULL,
  last_path TEXT,
  last_title TEXT,
  page_views INTEGER NOT NULL DEFAULT 0,
  total_active_ms INTEGER NOT NULL DEFAULT 0,
  embedded INTEGER NOT NULL DEFAULT 0,
  first_referrer TEXT,
  last_referrer TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  user_agent TEXT,
  FOREIGN KEY (visitor_key) REFERENCES visitors(visitor_key)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at TEXT NOT NULL,
  event_type TEXT NOT NULL,
  site_id TEXT NOT NULL,
  visitor_key TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_id TEXT,
  page_path TEXT,
  page_title TEXT,
  route TEXT,
  page_type TEXT,
  project_id TEXT,
  project_title TEXT,
  page_duration_ms INTEGER,
  page_active_ms INTEGER,
  session_active_ms INTEGER,
  visit_number INTEGER,
  referrer TEXT,
  ip_hash TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  locale TEXT,
  device_type TEXT,
  browser_name TEXT,
  os_name TEXT,
  embedded INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL,
  FOREIGN KEY (visitor_key) REFERENCES visitors(visitor_key)
);

CREATE INDEX IF NOT EXISTS idx_events_received_at ON events(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_visitor_key ON events(visitor_key);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_key ON sessions(visitor_key);
