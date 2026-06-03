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

Data is stored in `data/db.json` by default and seeded automatically on first run.
Set `DATABASE_URL` to use PostgreSQL for categories and products instead.
Uploaded images are stored in `data/uploads` by default and served from `/uploads`.
For production, configure Cloudflare R2 with `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_PUBLIC_BASE_URL`.
Product records should keep the returned `path` value, for example `/uploads/xxx.webp` for local storage or `https://assets.example.com/products/...webp` for R2.

Write endpoints and image uploads require `Authorization: Bearer <token>` from `POST /api/auth/login`.
Change `ADMIN_PASSWORD` and `AUTH_SECRET` before exposing the backend publicly.

To migrate existing JSON data into PostgreSQL:

```bash
npm run build
DATABASE_URL=postgres://user:password@localhost:5432/shoefactory npm run migrate:postgres
```
