
# new32 Cosmetic and Family Dentistry

Production site for [new32dental.com](https://new32dental.com/) — multi-page v5 app at domain-root URLs.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

Open the app at `http://localhost:5173/`.

`npm run build` / `npm run build:production` writes a domain-root site into `docs/` (gitignored). CI uses that same command.

## Deploy

Push to `main` builds once and rsyncs a **staging** copy to `staging.new32dental.com` (with a `Disallow: /` robots.txt). The unmodified production build is stored as a GitHub Actions artifact for 14 days.

When staging looks right: **Actions → Deploy production → Run workflow**. Paste the staging **run ID** (from the staging job summary, or the number in the run URL). That job downloads the same artifact — it does not rebuild — backs up the live docroot, then rsyncs to [new32dental.com](https://new32dental.com/).

First production run: check **dry_run** so rsync only prints the plan.

### GitHub secrets

Repo **Settings → Secrets and variables → Actions**:

| Secret | Example |
| --- | --- |
| `DREAMHOST_SSH_KEY` | Full private key (`-----BEGIN OPENSSH PRIVATE KEY-----` …) |
| `DREAMHOST_USER` | `new32hosting` |
| `DREAMHOST_HOST` | `iad1-shared-b8-25.dreamhost.com` |
| `DREAMHOST_STAGING_PATH` | `~/staging.new32dental.com/` |
| `DREAMHOST_PRODUCTION_PATH` | `~/new32dental.com/` |

Rsync never overwrites `api/config.php` or `api/storage/*.json` on the server. Put a copy of `public/api/config.sample.php` on **each** host (`TO` = you on staging, office on production).

Apache `.htaccess` in the build handles SPA deep links and legacy WordPress redirects. The contact form is PHP and only runs on DreamHost.

## Contact form

The contact form posts to a DreamHost PHP endpoint and emails the office inbox via Gmail SMTP (OAuth2). Full setup (Google Cloud, refresh token, DreamHost `config.php`, testing): see [CONTACT_FORM.md](CONTACT_FORM.md).
