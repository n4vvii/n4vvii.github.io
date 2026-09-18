# n4vvii contact Worker

This is the API and local-only inbox for the portfolio contact form.

## What is stored

`target`, `body`, optional `reply_to`, `created_at`, and `read_at`. The Worker does not write IP addresses, user-agent strings, cookies, device information, Turnstile tokens, or rate-limit keys to D1 or logs.

## Deploy and configure

Run from this directory after `wrangler login`:

    wrangler d1 execute n4vvii-contact --remote --file schema/0001_initial.sql
    openssl rand -hex 32 | wrangler secret put RATE_LIMIT_SALT
    wrangler secret put TURNSTILE_SECRET
    wrangler deploy

Enter the Turnstile secret only at the prompt. Never add it to a file or commit it. The public Turnstile site key and deployed API URL belong in `../content/site.json` under `contact.form`.

## Local-only inbox

The inbox is intentionally not deployed. It binds only to `127.0.0.1` and uses the existing Wrangler OAuth login to query D1:

    node admin/admin-server.mjs

Open http://127.0.0.1:8788. It lists messages and can mark them read or delete them. Stop it with `Ctrl+C` when finished.

## Privacy and rate limiting

Turnstile is verified server-side. The Worker hashes `CF-Connecting-IP` with a secret salt only in isolate memory for ten minutes (up to three requests); the key is never sent to D1, logged, or otherwise persisted. This is a best-effort per-isolate limit, with Turnstile providing the primary bot protection.
