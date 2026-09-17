# Contact form setup (DreamHost + Gmail OAuth2)

The site posts to `api/contact.php` on DreamHost. That script validates the submission and sends mail through **Gmail SMTP** using **OAuth2**, authenticated as an **agency Google Workspace** address. The new32 office inbox receives the message; **Reply-To** is the visitor’s email.

This is DreamHost + Google only (no Resend, Formspree, or Apps Script).

## Architecture

1. Visitor submits the React form (`ContactForm`)
2. Browser `POST`s JSON to `/api/contact.php` (same origin on DreamHost)
3. PHP validates fields, honeypot, length caps, and per-IP rate limit
4. PHPMailer authenticates to `smtp.gmail.com:587` with XOAUTH2
5. Email lands in the configured `TO` inbox

## Frontend

- Component: [`src/app/components/ContactForm.tsx`](src/app/components/ContactForm.tsx)
- Wired into the site: V5 Contact page and V3.1 contact section (`#contact`)

### Endpoint URL

By default the form posts to `{BASE_URL}api/contact.php`.

Override with an env var when building:

```bash
VITE_FORM_ENDPOINT=https://new32dental.com/api/contact.php
```

Copy [`.env.example`](.env.example) to `.env.local` for local overrides (`.env.local` is gitignored if you add it).

**Note:** Staging and production must serve the built site **and** `api/` on DreamHost. CI uses `npm run build:production` (`base` `/`). GitHub Pages is not used.

## One-time Google Cloud / OAuth setup (agency)

Do this while logged into the **agency Google Workspace** account that will own the Cloud project and send mail.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a project (or pick an existing one).
2. **APIs & Services → Library** → enable **Gmail API**.
3. **APIs & Services → OAuth consent screen**
   - User type: **Internal** (agency Workspace only — avoids external verification)
   - App name / support email: your agency details
   - Scopes: later the auth URL requests `https://mail.google.com/` (required for SMTP)
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Desktop app**
   - Download / copy **Client ID** and **Client secret**
5. On your laptop (not on DreamHost), run:

```bash
php scripts/get-gmail-refresh-token.php \
  --client-id='YOUR_CLIENT_ID.apps.googleusercontent.com' \
  --client-secret='YOUR_CLIENT_SECRET'
```

6. Open the printed URL while logged in as the **agency Workspace sender** address (this becomes `FROM`).
7. Click Allow. The browser will try to load `http://localhost/?code=...` (connection may fail — that is expected).
8. Copy the `code` from the address bar (or paste the whole URL into the script).
9. The script prints `GMAIL_REFRESH_TOKEN` — keep it secret.

## DreamHost configuration

1. Deploy via GitHub Actions (push to `main` → staging; promote artifact → production) so `https://your-domain/api/contact.php` is reachable (PHP enabled).
2. On **each** host (staging and production), copy `api/config.sample.php` → `api/config.php` and fill in:

| Key | Meaning |
| --- | --- |
| `FROM` | Agency Workspace address used in the OAuth step |
| `FROM_NAME` | Display name (e.g. `New32 Website`) |
| `TO` | Office inbox on production; your own inbox on staging |
| `GMAIL_CLIENT_ID` | From Cloud Console |
| `GMAIL_CLIENT_SECRET` | From Cloud Console |
| `GMAIL_REFRESH_TOKEN` | From the one-time script |
| `ALLOWED_ORIGINS` | Optional CORS allowlist (usually empty for same-origin) |
| `RATE_LIMIT_MAX` | Max submissions per IP per window (default 5) |
| `RATE_LIMIT_WINDOW_SECONDS` | Window length (default 3600) |

3. Ensure `api/storage/` is writable by PHP (rate-limit file).
4. Confirm `.htaccess` rules block web access to `config.php` and `storage/`.

**Never commit `config.php` or refresh tokens.**

## End-to-end test checklist

On **staging** first (`TO` = you), then on production:

1. Open the contact section and submit a test message with your own email.
2. Confirm the configured `TO` inbox receives it (your address on staging; the office on production).
3. Confirm **Reply** goes to your test address (Reply-To).
4. Confirm honeypot: if you manually POST with `"website": "http://spam"`, the API returns `{ ok: true }` but no email is sent.
5. Confirm rate limit: submit repeatedly from the same IP until you see the “please wait” message.

## Fields (parity with the old WordPress form)

- First name *, Last name *
- Email *
- Phone *
- Prefer contact by: Email / Phone *
- Questions / Comments
- How did you hear about us? (Direct Mail Invitation, Internet, Print Ad, Family/Friend Referral, new32 Team, Email)
- Hidden honeypot (`website`)

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `Contact form is not configured yet` | Missing `api/config.php` on the server |
| `Unable to send…` + server log “Token refresh rejected” | Wrong client secret / refresh token, or OAuth app not Internal |
| Mail never arrives | Check spam; confirm `TO`; check DreamHost error log |
| 404 on `/api/contact.php` | `api/` not uploaded, or wrong document root / base path |
| Works locally in browser UI but send fails | Expected until PHP + config are on DreamHost |

## Security notes

- Visitor email is only used via PHPMailer’s `addReplyTo()` — never concatenated into raw headers.
- Honeypot + length limits + IP rate limiting reduce abuse.
- OAuth refresh token is as sensitive as a password — store only in `config.php` on the server.
