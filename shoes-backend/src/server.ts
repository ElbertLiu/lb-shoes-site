import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { readDatabase, updateDatabase } from './store.js';
import type { Category, Product } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 4000);
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.resolve(__dirname, '../data/uploads'));
const uploadPublicPath = process.env.UPLOAD_PUBLIC_PATH || '/uploads';
const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 * 1024);
const r2Bucket = process.env.R2_BUCKET?.trim();
const r2Endpoint = process.env.R2_ENDPOINT?.trim();
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
const r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '');
const r2Client = r2Bucket && r2Endpoint && r2AccessKeyId && r2SecretAccessKey
  ? new S3Client({
    region: 'auto',
    endpoint: r2Endpoint,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
    },
  })
  : null;
const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
const authSecret = process.env.AUTH_SECRET || randomUUID();
const authTokenTtlSeconds = Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 12);
const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const imageMimeExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadBytes, files: 12 },
  fileFilter: (_req, file, callback) => {
    if (!imageMimeExtensions[file.mimetype]) {
      callback(new Error('仅支持 JPG、PNG、WebP、GIF 图片'));
      return;
    }
    callback(null, true);
  },
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes('*') || origins.includes(origin)) {
      callback(null, true);
      return;
    }

    try {
      const hostname = new URL(origin).hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
      const isLan = /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
        || /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)
        || /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);
      callback(null, isLocal || isLan);
    } catch {
      callback(null, false);
    }
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(uploadPublicPath, express.static(uploadDir, {
  immutable: true,
  maxAge: '30d',
}));

function badRequest(message: string) {
  return { error: message };
}

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url');
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function signToken(payload: Record<string, unknown>) {
  const body = base64url(JSON.stringify(payload));
  const signature = createHmac('sha256', authSecret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyToken(token: string) {
  const [body, signature] = token.split('.');
  if (!body || !signature) {
    return null;
  }

  const expectedSignature = createHmac('sha256', authSecret).update(body).digest('base64url');
  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as { exp?: number; sub?: string };
    if (!payload.exp || payload.exp * 1000 < Date.now() || payload.sub !== adminUsername) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function getBearerToken(req: express.Request) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : '';
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = getBearerToken(req);
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: '请先登录后台' });
    return;
  }
  next();
}

function normalizeImages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((image): image is string => typeof image === 'string' && Boolean(image.trim())).map((image) => image.trim());
}

function parseProduct(body: unknown, fallback?: Product): Product | null {
  const value = body as Partial<Product>;
  const id = typeof value.id === 'string' ? value.id.trim() : fallback?.id || '';
  const name = typeof value.name === 'string' ? value.name.trim() : fallback?.name || '';
  const brief = typeof value.brief === 'string' ? value.brief.trim() : fallback?.brief || '';
  const price = typeof value.price === 'string' ? value.price.trim() : fallback?.price || '';
  const category = typeof value.category === 'string' ? value.category.trim() : fallback?.category || '';
  const images = value.images !== undefined ? normalizeImages(value.images) : fallback?.images || [];

  if (!id || !name || !category) {
    return null;
  }

  return {
    id,
    name,
    brief,
    price,
    category,
    inStock: typeof value.inStock === 'boolean' ? value.inStock : fallback?.inStock ?? true,
    featured: typeof value.featured === 'boolean' ? value.featured : fallback?.featured ?? false,
    images,
  };
}

function parseCategory(body: unknown, fallback?: Category): Category | null {
  const value = body as Partial<Category>;
  const id = typeof value.id === 'string' ? value.id.trim() : fallback?.id || '';
  const name = typeof value.name === 'string' ? value.name.trim() : fallback?.name || '';
  return id && name ? { id, name } : null;
}

function buildPublicUrl(req: express.Request, pathname: string) {
  const configuredBase = process.env.PUBLIC_BASE_URL?.replace(/\/$/, '');
  const baseUrl = configuredBase || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${pathname}`;
}

function buildR2ObjectKey(extension: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `products/${year}/${month}/${Date.now()}-${randomUUID()}.${extension}`;
}

async function saveUploadedImage(req: express.Request, file: Express.Multer.File) {
  const extension = imageMimeExtensions[file.mimetype];
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;

  if (r2Client && r2Bucket && r2PublicBaseUrl) {
    const key = buildR2ObjectKey(extension);
    await r2Client.send(new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    const url = `${r2PublicBaseUrl}/${key}`;
    return {
      originalName: file.originalname,
      filename: path.basename(key),
      path: url,
      url,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  const publicPath = `${uploadPublicPath}/${filename}`;
  await writeFile(filePath, file.buffer);
  return {
    originalName: file.originalname,
    filename,
    path: publicPath,
    url: buildPublicUrl(req, publicPath),
    size: file.size,
    mimeType: file.mimetype,
  };
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'shoes-backend' });
});

app.post('/api/auth/login', (req, res) => {
  const body = req.body as { username?: unknown; password?: unknown };
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!safeCompare(username, adminUsername) || !safeCompare(password, adminPassword)) {
    res.status(401).json({ error: '账号或密码错误' });
    return;
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + authTokenTtlSeconds;
  res.json({
    token: signToken({ sub: adminUsername, iat: issuedAt, exp: expiresAt }),
    user: { username: adminUsername },
    expiresAt,
  });
});

app.get('/api/auth/me', requireAuth, (_req, res) => {
  res.json({ user: { username: adminUsername } });
});

app.post('/api/uploads/images', requireAuth, upload.array('images', 12), async (req, res, next) => {
  try {
    const files = (req.files || []) as Express.Multer.File[];
    if (!files.length) {
      res.status(400).json(badRequest('请选择要上传的图片'));
      return;
    }

    const savedFiles = await Promise.all(files.map((file) => saveUploadedImage(req, file)));

    res.status(201).json({ files: savedFiles });
  } catch (error) {
    next(error);
  }
});

app.get('/api/categories', async (_req, res, next) => {
  try {
    const database = await readDatabase();
    res.json(database.categories);
  } catch (error) {
    next(error);
  }
});

app.put('/api/categories', requireAuth, async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json(badRequest('分类数据必须是数组'));
      return;
    }

    const seen = new Set<string>();
    const categories = req.body
      .map((item) => parseCategory(item))
      .filter((item): item is Category => Boolean(item && !seen.has(item.id) && seen.add(item.id)));

    const database = await updateDatabase((current) => ({ ...current, categories }));
    res.json(database.categories);
  } catch (error) {
    next(error);
  }
});

app.post('/api/categories', requireAuth, async (req, res, next) => {
  try {
    const category = parseCategory(req.body);
    if (!category) {
      res.status(400).json(badRequest('分类 ID 和名称不能为空'));
      return;
    }

    const database = await updateDatabase((current) => {
      if (current.categories.some((item) => item.id === category.id)) {
        throw Object.assign(new Error('分类 ID 已存在'), { status: 409 });
      }
      return { ...current, categories: [...current.categories, category] };
    });
    res.status(201).json(database.categories.find((item) => item.id === category.id));
  } catch (error) {
    next(error);
  }
});

app.put('/api/categories/:id', requireAuth, async (req, res, next) => {
  try {
    const database = await readDatabase();
    const existing = database.categories.find((item) => item.id === req.params.id);
    const category = parseCategory(req.body, existing);
    if (!existing || !category) {
      res.status(existing ? 400 : 404).json(badRequest(existing ? '分类名称不能为空' : '分类不存在'));
      return;
    }

    const nextDatabase = await updateDatabase((current) => ({
      ...current,
      categories: current.categories.map((item) => item.id === req.params.id ? { ...category, id: req.params.id } : item),
    }));
    res.json(nextDatabase.categories.find((item) => item.id === req.params.id));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/categories/:id', requireAuth, async (req, res, next) => {
  try {
    const database = await readDatabase();
    if (database.products.some((product) => product.category === req.params.id)) {
      res.status(409).json(badRequest('该分类下仍有产品，不能删除'));
      return;
    }

    const nextDatabase = await updateDatabase((current) => ({
      ...current,
      categories: current.categories.filter((item) => item.id !== req.params.id),
    }));
    res.json(nextDatabase.categories);
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', async (req, res, next) => {
  try {
    const { category, search, featured, inStock } = req.query;
    const database = await readDatabase();
    const q = typeof search === 'string' ? search.trim().toLowerCase() : '';
    const products = database.products.filter((product) => {
      const matchesSearch = !q
        || product.id.toLowerCase().includes(q)
        || product.name.toLowerCase().includes(q)
        || product.brief.toLowerCase().includes(q);
      const matchesCategory = typeof category !== 'string' || !category || product.category === category;
      const matchesFeatured = typeof featured !== 'string' || featured === '' || product.featured === (featured === 'true');
      const matchesStock = typeof inStock !== 'string' || inStock === '' || product.inStock === (inStock === 'true');
      return matchesSearch && matchesCategory && matchesFeatured && matchesStock;
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.put('/api/products', requireAuth, async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json(badRequest('产品数据必须是数组'));
      return;
    }

    const seen = new Set<string>();
    const products = req.body
      .map((item) => parseProduct(item))
      .filter((item): item is Product => Boolean(item && !seen.has(item.id) && seen.add(item.id)));

    const database = await updateDatabase((current) => ({ ...current, products }));
    res.json(database.products);
  } catch (error) {
    next(error);
  }
});

app.get('/api/products/:id', async (req, res, next) => {
  try {
    const database = await readDatabase();
    const product = database.products.find((item) => item.id === req.params.id);
    if (!product) {
      res.status(404).json(badRequest('产品不存在'));
      return;
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.post('/api/products', requireAuth, async (req, res, next) => {
  try {
    const product = parseProduct(req.body);
    if (!product) {
      res.status(400).json(badRequest('货号、名称和分类不能为空'));
      return;
    }

    const database = await updateDatabase((current) => {
      if (current.products.some((item) => item.id === product.id)) {
        throw Object.assign(new Error('产品货号已存在'), { status: 409 });
      }
      return { ...current, products: [product, ...current.products] };
    });
    res.status(201).json(database.products.find((item) => item.id === product.id));
  } catch (error) {
    next(error);
  }
});

app.put('/api/products/:id', requireAuth, async (req, res, next) => {
  try {
    const database = await readDatabase();
    const existing = database.products.find((item) => item.id === req.params.id);
    const product = parseProduct(req.body, existing);
    if (!existing || !product) {
      res.status(existing ? 400 : 404).json(badRequest(existing ? '货号、名称和分类不能为空' : '产品不存在'));
      return;
    }

    const nextDatabase = await updateDatabase((current) => ({
      ...current,
      products: current.products.map((item) => item.id === req.params.id ? { ...product, id: req.params.id } : item),
    }));
    res.json(nextDatabase.products.find((item) => item.id === req.params.id));
  } catch (error) {
    next(error);
  }
});

app.patch('/api/products/:id', requireAuth, async (req, res, next) => {
  try {
    const database = await readDatabase();
    const existing = database.products.find((item) => item.id === req.params.id);
    if (!existing) {
      res.status(404).json(badRequest('产品不存在'));
      return;
    }

    const patch = req.body as Partial<Product>;
    const nextProduct = parseProduct({ ...existing, ...patch, id: existing.id }, existing);
    if (!nextProduct) {
      res.status(400).json(badRequest('产品数据不完整'));
      return;
    }

    const nextDatabase = await updateDatabase((current) => ({
      ...current,
      products: current.products.map((item) => item.id === req.params.id ? nextProduct : item),
    }));
    res.json(nextDatabase.products.find((item) => item.id === req.params.id));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/:id', requireAuth, async (req, res, next) => {
  try {
    const nextDatabase = await updateDatabase((current) => ({
      ...current,
      products: current.products.filter((item) => item.id !== req.params.id),
    }));
    res.json(nextDatabase.products);
  } catch (error) {
    next(error);
  }
});

app.use((error: Error & { status?: number; code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = error.status || (error.code?.startsWith('LIMIT_') ? 400 : 500);
  res.status(status).json({ error: status === 500 ? '服务器错误' : error.message });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Shoes backend running on http://localhost:${port}`);
});
