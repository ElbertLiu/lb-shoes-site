# Shoes Backend

Backend service for `shoes-frontend` and `shoes-admin`.

## Scripts

```bash
npm install
npm run dev
```

The API defaults to `http://localhost:4000`.

## Endpoints

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `PUT /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/products`
- `PUT /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/uploads/images`

Data is stored in `data/db.json` and seeded automatically on first run.
Uploaded images are stored in `data/uploads` by default and served from `/uploads`.
For production, mount `UPLOAD_DIR` on persistent storage or replace the upload handler with object storage. Product records should keep the returned `path` value, for example `/uploads/xxx.webp`.

Write endpoints and image uploads require `Authorization: Bearer <token>` from `POST /api/auth/login`.
Change `ADMIN_PASSWORD` and `AUTH_SECRET` before exposing the backend publicly.
