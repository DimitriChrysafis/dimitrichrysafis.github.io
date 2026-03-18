# Dimitri's Site

Frontend is static and can stay on GitHub Pages.

Analytics now uses a separate Python backend in [`backend/`](/Users/dofa/Documents/GitHub/dimitrichrysafis.github.io/backend) instead of the old Cloudflare worker code.

## Local frontend

Serve the site root on port `8000`:

```bash
python3 -m http.server 8000
```

## Analytics backend

Run the Python backend on port `8788`:

```bash
cd backend
python3 server.py
```

## GitHub Pages + ngrok

1. Run the backend locally or on a machine you control.
2. Expose port `8788` with ngrok.
3. Put the resulting `https://...ngrok...` base URL into [`analytics-config.js`](/Users/dofa/Documents/GitHub/dimitrichrysafis.github.io/analytics-config.js).
4. Push the frontend changes to GitHub Pages.

The browser will then send analytics directly to your ngrok-backed Python service.
