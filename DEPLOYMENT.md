# ShoeFactory Deployment Checklist

## Current Production Server

This is the current live production environment. Keep this section updated whenever the server, domains, or paths change.

- Server IP: `206.189.88.80`
- SSH user: `root`
- SSH command: `ssh root@206.189.88.80`
- Hostname: `ubuntu-s-1vcpu-1gb-sgp1`
- Node.js: `v20.20.2`
- npm: `10.8.2`
- Web root: `/var/www/shoefactory`
- Frontend static directory: `/var/www/shoefactory/frontend`
- Admin static directory: `/var/www/shoefactory/admin`
- Backend directory: `/var/www/shoefactory/backend`
- Upload directory: `/var/www/shoefactory/uploads`
- Backend environment file: `/var/www/shoefactory/backend/.env`
- Backend systemd service: `shoes-backend.service`
- Backend service file: `/etc/systemd/system/shoes-backend.service`
- Nginx site config: `/etc/nginx/sites-enabled/odshoe.conf`

Do not copy production secrets into this repository. The production `.env` lives only on the server.

## Current Production Domains

- Website: `https://odshoe.com`
- Website alias: `https://www.odshoe.com`
- Admin: `https://admin.odshoe.com`
- API: `https://api.odshoe.com`
- Uploaded assets CDN/R2 public base: `https://assets.odshoe.com`

## Domains

Template domains for a new deployment:

- Website: `www.example.com`
- Admin: `admin.example.com`
- API: `api.example.com`

Point all three DNS records to the server IP before enabling HTTPS.

For the current production server, point `odshoe.com`, `www.odshoe.com`, `admin.odshoe.com`, and `api.odshoe.com` to `206.189.88.80`. The `assets.odshoe.com` hostname is served by the object storage/CDN setup, not by the app server.

## Standard Production Deployment

Run these commands from the repository root on the local machine.

Build and verify everything first:

```bash
npm run verify
```

Build the frontend with production API/contact settings:

```bash
cd shoes-frontend
VITE_API_BASE_URL=https://api.odshoe.com/api \
VITE_SITE_URL=https://www.odshoe.com \
VITE_WHATSAPP_CONTACT='+86 138-0000-0000' \
VITE_FACEBOOK_CONTACT=ShoeFactory123 \
npm run build
cd ..
```

Build the admin app:

```bash
cd shoes-admin
VITE_API_BASE_URL=https://api.odshoe.com/api \
VITE_FRONTEND_URL=https://www.odshoe.com \
npm run build
cd ..
```

Build the backend:

```bash
cd shoes-backend
npm run build
cd ..
```

Upload frontend and admin static files:

```bash
rsync -az --delete shoes-frontend/dist/ root@206.189.88.80:/var/www/shoefactory/frontend/
rsync -az --delete shoes-admin/dist/ root@206.189.88.80:/var/www/shoefactory/admin/
```

Upload backend build output and package metadata. This intentionally does not upload local `.env`, database files, or uploads:

```bash
rsync -az --delete shoes-backend/dist/ root@206.189.88.80:/var/www/shoefactory/backend/dist/
rsync -az shoes-backend/package.json shoes-backend/package-lock.json root@206.189.88.80:/var/www/shoefactory/backend/
```

Install production dependencies, fix ownership, and restart the backend:

```bash
ssh root@206.189.88.80 '
  set -e
  cd /var/www/shoefactory/backend
  npm ci --omit=dev
  chown -R www-data:www-data /var/www/shoefactory/backend /var/www/shoefactory/uploads
  systemctl restart shoes-backend.service
  systemctl is-active shoes-backend.service
'
```

Verify Nginx and production endpoints from the server:

```bash
ssh root@206.189.88.80 '
  nginx -t
  systemctl is-active nginx
  curl -k -I --resolve www.odshoe.com:443:127.0.0.1 https://www.odshoe.com
  curl -k -I --resolve admin.odshoe.com:443:127.0.0.1 https://admin.odshoe.com
  curl -k -sS --resolve api.odshoe.com:443:127.0.0.1 https://api.odshoe.com/api/products | head -c 500
'
```

Useful service commands:

```bash
ssh root@206.189.88.80 'systemctl status shoes-backend.service --no-pager'
ssh root@206.189.88.80 'journalctl -u shoes-backend.service -n 100 --no-pager'
ssh root@206.189.88.80 'nginx -T | sed -n "/sites-enabled\/odshoe.conf:/,/configuration file/p"'
```

## Required Environment Variables

Backend template:

```bash
PORT=4000
CORS_ORIGIN=https://www.example.com,https://admin.example.com
PUBLIC_BASE_URL=https://api.example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_TOKEN_TTL_SECONDS=43200
UPLOAD_DIR=/var/www/shoefactory/uploads
UPLOAD_PUBLIC_PATH=/uploads
MAX_UPLOAD_BYTES=8388608
```

Frontend:

```bash
VITE_API_BASE_URL=https://api.example.com/api
VITE_SITE_URL=https://www.example.com
```

Admin:

```bash
VITE_API_BASE_URL=https://api.example.com/api
VITE_FRONTEND_URL=https://www.example.com
```

Current production values are configured in `/var/www/shoefactory/backend/.env` on `206.189.88.80`. Do not overwrite that file during deployment.

## Security Before Public Launch

- Change `ADMIN_PASSWORD`.
- Set a long random `AUTH_SECRET`.
- Keep `admin.example.com` behind HTTPS.
- Do not expose backend port `4000` directly; use Nginx reverse proxy.
- Back up `shoes-backend/data/db.json` and the upload directory regularly.

## Global Access Notes

- Put the website and uploaded images behind CDN.
- For a first deployment, local disk uploads are acceptable if `UPLOAD_DIR` is on persistent storage.
- For long-term production, migrate uploads to object storage and database JSON to PostgreSQL/MySQL/SQLite.
- Add privacy policy, terms, and cookie notice before analytics or ad pixels.

## Cache And CDN Notes

- `index.html` for the website and admin app should use `Cache-Control: no-store` so new deployments become visible immediately.
- Hashed Vite assets under `/assets/` should use `Cache-Control: public, max-age=31536000, immutable`.
- Public API `GET` responses can use browser revalidation plus short shared-cache TTLs, for example `max-age=0, s-maxage=60`.
- Admin auth, uploads, and write endpoints should not be cached.
- R2/product upload objects are content-addressed by generated filenames and should use one-year immutable caching.
- In Cloudflare, keep `assets.example.com` cacheable with long edge TTL, but do not add broad cache rules for `api.example.com` unless they respect backend `Cache-Control`.
