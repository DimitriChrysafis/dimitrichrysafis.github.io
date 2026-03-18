#!/bin/zsh
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(cd -- "$SCRIPT_DIR/.." && pwd)
BACKEND_PORT=${BACKEND_PORT:-8788}
FRONTEND_PORT=${FRONTEND_PORT:-8000}
NGROK_API_URL=${NGROK_API_URL:-http://127.0.0.1:4040/api/tunnels}
ENV_FILE="$SCRIPT_DIR/.env.local"
BACKEND_LOG="$SCRIPT_DIR/backend.log"
FRONTEND_LOG="$SCRIPT_DIR/frontend.log"
NGROK_LOG="$SCRIPT_DIR/ngrok.log"
BACKEND_PID_FILE="$SCRIPT_DIR/backend.pid"
FRONTEND_PID_FILE="$SCRIPT_DIR/frontend.pid"
NGROK_PID_FILE="$SCRIPT_DIR/ngrok.pid"

function cleanup() {
  for pid_file in "$NGROK_PID_FILE" "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"; do
    if [[ -f "$pid_file" ]]; then
      pid=$(<"$pid_file")
      if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
      fi
      rm -f "$pid_file"
    fi
  done
}

function require_command() {
  local cmd=$1
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
}

function wait_for_http() {
  local url=$1
  local name=$2
  local attempts=${3:-60}
  local delay=${4:-1}

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done

  echo "Timed out waiting for $name at $url" >&2
  exit 1
}

function read_ngrok_url() {
  python3 - "$NGROK_API_URL" <<'PY'
import json
import sys
from urllib.request import urlopen

api_url = sys.argv[1]
with urlopen(api_url, timeout=5) as response:
    payload = json.load(response)

for tunnel in payload.get("tunnels", []):
    public_url = str(tunnel.get("public_url") or "").strip()
    if public_url.startswith("https://"):
        print(public_url.rstrip("/"))
        raise SystemExit(0)

raise SystemExit(1)
PY
}

function wait_for_ngrok_url() {
  local attempts=${1:-60}
  local delay=${2:-1}
  local ngrok_url=""

  for _ in $(seq 1 "$attempts"); do
    if ngrok_url=$(read_ngrok_url 2>/dev/null); then
      echo "$ngrok_url"
      return 0
    fi
    sleep "$delay"
  done

  echo "Timed out waiting for an https ngrok tunnel URL." >&2
  exit 1
}

function write_analytics_config() {
  local base_url=$1
  python3 - "$REPO_ROOT/analytics-config.js" "$base_url" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
base_url = sys.argv[2]
text = path.read_text(encoding="utf-8")
updated = re.sub(
    r'const productionBackendBaseUrl = ".*?";',
    f'const productionBackendBaseUrl = "{base_url}";',
    text,
    count=1,
)
if updated == text:
    raise SystemExit("Could not update productionBackendBaseUrl in analytics-config.js")
path.write_text(updated, encoding="utf-8")
PY
}

function start_backend() {
  (
    cd "$SCRIPT_DIR"
    export ANALYTICS_HOST=0.0.0.0
    export ANALYTICS_PORT="$BACKEND_PORT"
    python3 server.py >>"$BACKEND_LOG" 2>&1
  ) &
  echo $! > "$BACKEND_PID_FILE"
}

function start_frontend() {
  (
    cd "$REPO_ROOT"
    python3 -m http.server "$FRONTEND_PORT" >>"$FRONTEND_LOG" 2>&1
  ) &
  echo $! > "$FRONTEND_PID_FILE"
}

function start_ngrok() {
  (
    cd "$SCRIPT_DIR"
    ngrok http "$BACKEND_PORT" >>"$NGROK_LOG" 2>&1
  ) &
  echo $! > "$NGROK_PID_FILE"
}

trap cleanup EXIT INT TERM

require_command python3
require_command curl
require_command ngrok

if [[ -f "$ENV_FILE" ]]; then
  source "$ENV_FILE"
fi

if [[ -z "${DISCORD_WEBHOOK_URL:-}" ]]; then
  echo "Set DISCORD_WEBHOOK_URL in $ENV_FILE or export it before running this script." >&2
  exit 1
fi

if [[ -f "$BACKEND_PID_FILE" ]] || [[ -f "$FRONTEND_PID_FILE" ]] || [[ -f "$NGROK_PID_FILE" ]]; then
  echo "Existing pid files found in backend/. Stop the old stack or remove stale *.pid files first." >&2
  exit 1
fi

: > "$BACKEND_LOG"
: > "$FRONTEND_LOG"
: > "$NGROK_LOG"

export DISCORD_WEBHOOK_URL

echo "Starting analytics backend on port $BACKEND_PORT..."
start_backend
wait_for_http "http://127.0.0.1:${BACKEND_PORT}/health" "analytics backend"

echo "Starting frontend on port $FRONTEND_PORT..."
start_frontend
wait_for_http "http://127.0.0.1:${FRONTEND_PORT}/" "frontend server"

echo "Starting ngrok tunnel for backend port $BACKEND_PORT..."
start_ngrok
wait_for_http "$NGROK_API_URL" "ngrok API"

NGROK_URL=$(wait_for_ngrok_url)
write_analytics_config "$NGROK_URL"

echo
echo "Stack is live."
echo "Frontend: http://localhost:${FRONTEND_PORT}"
echo "Backend:  http://127.0.0.1:${BACKEND_PORT}"
echo "Ngrok:    ${NGROK_URL}"
echo
echo "analytics-config.js was updated to point GitHub Pages traffic at:"
echo "  ${NGROK_URL}/v1/analytics"
echo
echo "If you want the live GitHub Pages site to use this tunnel, push analytics-config.js:"
echo "  git add analytics-config.js"
echo "  git commit -m \"Update analytics tunnel URL\""
echo "  git push origin main"
echo
echo "Logs:"
echo "  $BACKEND_LOG"
echo "  $FRONTEND_LOG"
echo "  $NGROK_LOG"
echo
echo "Press Ctrl+C to stop the backend, frontend server, and ngrok tunnel."

while true; do
  sleep 5

  for pid_file in "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE" "$NGROK_PID_FILE"; do
    pid=$(<"$pid_file")
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "A background process exited unexpectedly. Check the log files in backend/." >&2
      exit 1
    fi
  done
done
