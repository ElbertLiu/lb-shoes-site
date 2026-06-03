# ShoeFactory Deployment Checklist

## Domains

Recommended production domains:

- Website: `www.example.com`
- Admin: `admin.example.com`
- API: `api.example.com`

Point all three DNS records to the server IP before enabling HTTPS.

## Required Environment Variables

Backend:

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

