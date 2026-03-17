# Analytics Relay

This worker is the server-side relay for the GitHub Pages site analytics client.

It exists for one reason: GitHub Pages is static, so a Discord webhook cannot be
kept secret in the browser. The browser sends structured analytics events to this
worker, and the worker validates, rate-limits, stores, and forwards them.

## What It Does

- Accepts structured analytics events from the static site.
- Rejects requests from origins outside `ALLOWED_ORIGINS`.
- Applies a lightweight per-minute rate limit with KV.
- Stores visitor, session, and event history in D1.
- Forwards admin-facing summaries to a Discord webhook.
- Uses Cloudflare geolocation metadata for approximate location signals.

## Required Secrets

Set these with `wrangler secret put`:

- `DISCORD_WEBHOOK_URL`
- `ANALYTICS_HASH_SALT`

## Required Bindings

Edit `wrangler.toml` and replace:

- `REPLACE_D1_DATABASE_ID`
- `REPLACE_KV_NAMESPACE_ID`
- `REPLACE_KV_PREVIEW_ID`

## Setup

1. Create the D1 database and KV namespace.
2. Update `wrangler.toml` with the real binding IDs.
3. Apply the schema:

```bash
cd analytics-relay
npx wrangler d1 execute site_analytics --file=./schema.sql --remote
```

4. Add secrets:

```bash
cd analytics-relay
npx wrangler secret put DISCORD_WEBHOOK_URL
npx wrangler secret put ANALYTICS_HASH_SALT
```

5. Deploy:

```bash
cd analytics-relay
npm install
npx wrangler deploy
```

6. Put the deployed worker URL plus `/v1/analytics` into `/analytics-config.js` as `endpoint`.

## Event Model

The client sends `page_view`.

The worker stores accepted events in D1 and forwards page views to Discord in a
clean admin-oriented format.
