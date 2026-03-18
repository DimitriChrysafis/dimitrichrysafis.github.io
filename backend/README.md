# Python Analytics Backend

This backend replaces the old Cloudflare relay.

It accepts analytics events from the static site, records them locally, captures the request IP address, and can forward page views to Discord.

## Run

```bash
cd backend
python3 server.py
```

The default bind is `0.0.0.0:8788`.

## Environment variables

- `ANALYTICS_HOST`: bind host, default `0.0.0.0`
- `ANALYTICS_PORT`: bind port, default `8788`
- `ANALYTICS_ALLOWED_ORIGINS`: comma-separated allowed origins
- `ANALYTICS_DATA_DIR`: directory for SQLite + NDJSON output
- `DISCORD_WEBHOOK_URL`: optional Discord webhook
- `DISCORD_WEBHOOK_USERNAME`: optional webhook display name

Default allowed origins include:

- `https://dimitrichrysafis.github.io`
- `http://localhost:8000`
- `http://127.0.0.1:8000`

## Endpoints

- `GET /health`
- `POST /v1/analytics`

## Data

The backend writes:

- `backend/data/analytics.sqlite3`
- `backend/data/events.ndjson`
