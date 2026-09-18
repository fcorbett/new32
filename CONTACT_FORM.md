# Contact form setup (DreamHost + Gmail SMTP)

The site posts to `api/contact.php` on DreamHost. That script validates the submission and sends mail through **Gmail SMTP** using a **Google App Password** on an **agency Google Workspace** address. Recipients are configured per host; **Reply-To** is the visitor’s email.

This is DreamHost + Google only (no Resend, Formspree, or Apps Script). Do not use PHP `mail()` — DreamHost’s own docs say contact-form mail should go over SMTP.

## Architecture

1. Visitor submits the React form (`ContactForm`)
2. Browser `POST`s JSON to `/api/contact.php` (same origin on DreamHost)
3. PHP validates fields, honeypot, length caps, and per-IP rate limit
4. PHPMailer authenticates to `smtp.gmail.com:587` with the App Password
5. Email lands in the configured `TO` inbox (plus optional `BCC`)

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

## One-time Google App Password (agency Workspace)

Do this while logged into the **giraffedesign.com** Workspace account that will send mail (`FROM`).

1. Turn on [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification) if it is not already on.
2. Open [App passwords](https://myaccount.google.com/apppasswords).
3. Create a password (Mail / Other). Copy the 16-character value.
4. Keep it secret — it is as sensitive as a mailbox password.

Staging and production share this identity. You do not create a second App Password unless you change the sending mailbox.

`scripts/get-gmail-refresh-token.php` is unused leftover from an OAuth prototype. Do not run it.

## DreamHost configuration

1. Deploy via GitHub Actions (push to `main` → staging; promote artifact → production) so `https://your-domain/api/contact.php` is reachable (PHP enabled, HTTPS live).
2. On **each** host (staging and production), copy `api/config.sample.php` → `api/config.php` and fill in:

| Key | Meaning |
| --- | --- |
| `FROM` | Agency Workspace address that owns the App Password |
| `FROM_NAME` | Display name (e.g. `New32 Website`) |
| `TO` | Your inbox on staging; `appointments@new32dental.com` on production |
| `BCC` | Empty on staging. Production: `drshaw@new32dental.com,drjacobsen@new32dental.com,Elizabetheshaw@gmail.com,info@new32dental.com` |
| `SMTP_USER` | Leave empty to use `FROM` |
| `SMTP_PASSWORD` | 16-character Google App Password |
| `ALLOWED_ORIGINS` | Optional CORS allowlist (usually empty for same-origin) |
| `RATE_LIMIT_MAX` | Max submissions per IP per window (default 5) |
| `RATE_LIMIT_WINDOW_SECONDS` | Window length (default 3600) |

3. Ensure `api/storage/` is writable by PHP (rate-limit file).
4. Confirm `.htaccess` rules block web access to `config.php` and `storage/`.

Rsync never overwrites `api/config.php`. Create production `config.php` only after the first promote so `api/` exists on the live docroot.

**Never commit `config.php` or App Passwords.**

## End-to-end test checklist

On **staging** first (`TO` = you, `BCC` empty), then on production:

1. Open the contact section and submit a test message with your own email.
2. Confirm the configured `TO` inbox receives it (your address on staging; appointments on production).
3. Confirm **Reply** goes to your test address (Reply-To).
4. On production, confirm the BCC list also received the message.
5. Confirm honeypot: if you manually POST with `"website": "http://spam"`, the API returns `{ ok: true }` but no email is sent.
6. Confirm rate limit: submit repeatedly from the same IP until you see the “please wait” message.

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
| `Contact form is not fully configured` | Missing `FROM`, `TO`, or `SMTP_PASSWORD` |
| `Unable to send…` | Wrong App Password, 2FA off, or SMTP blocked |
| Mail never arrives | Check spam; confirm `TO`; check DreamHost error log |
| 404 on `/api/contact.php` | `api/` not uploaded, HTTPS not live for the host, or wrong document root |
| HTTPS shows DreamHost “Site not found” | Enable Let’s Encrypt for that domain in the panel |
| Works locally in browser UI but send fails | Expected until PHP + config are on DreamHost |

## Security notes

- Visitor email is only used via PHPMailer’s `addReplyTo()` — never concatenated into raw headers.
- Honeypot + length limits + IP rate limiting reduce abuse.
- The App Password is as sensitive as a mailbox password — store only in `config.php` on the server.
