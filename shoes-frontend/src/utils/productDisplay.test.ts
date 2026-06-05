import assert from 'node:assert/strict';
import { formatProductPrice, getLocalizedCategoryName, getProductCardGalleryImages, getProductCardImage, getProductDescription, getProductTitle } from './productDisplay';
import type { Product } from '../types';

const product = (partial: Partial<Product>): Product => ({
  id: 'SHOE-111',
  name: '',
  brief: '',
  price: '23',
  inStock: true,
  featured: false,
  category: 'c1',
  images: [],
  colorOptions: [],
  ...partial,
});

assert.equal(getLocalizedCategoryName('c1', '运动鞋', 'en'), 'Sneakers');
assert.equal(getLocalizedCategoryName('custom', '雨靴', 'en'), '雨靴');
assert.equal(getLocalizedCategoryName('loafers', '乐福鞋', 'en', { en: 'Loafers' }), 'Loafers');
assert.equal(getLocalizedCategoryName('loafers', '乐福鞋', 'fr', { en: 'Loafers' }), '乐福鞋');

assert.equal(
  getProductTitle(product({ name: '2026新款 c2 防滑耐磨', category: 'c2', brief: '这是一段产品简介' }), 'Outdoor', 'en'),
  '2026 New Outdoor 防滑耐磨',
);

assert.equal(
  getProductTitle(product({ name: 'Air Flex Runner', category: 'c1', brief: 'This is the product description' }), 'Sneakers', 'en'),
  'Air Flex Runner',
);

assert.equal(getProductDescription(product({ brief: '我是产品简介' })), '我是产品简介');
assert.equal(getProductDescription(product({ brief: '我是产品简介', briefTranslations: { en: 'Product description' } }), 'en'), 'Product description');
assert.equal(getProductDescription(product({ brief: '我是产品简介', briefTranslations: { en: 'Product description' } }), 'fr'), '我是产品简介');
assert.equal(getProductDescription(product({ brief: '' })), '');
assert.equal(getProductCardImage(product({ images: ['main.jpg'] })), 'main.jpg');
assert.deepEqual(getProductCardGalleryImages(product({ images: ['main.jpg'], colorOptions: [{ name: 'c1', thumbnail: 'ecru.jpg' }] })), ['main.jpg', 'ecru.jpg']);
assert.equal(getProductCardImage(product({ images: ['main.jpg'], colorOptions: [{ name: 'c1', thumbnail: 'ecru.jpg' }] }), 1), 'ecru.jpg');
assert.equal(formatProductPrice('23'), '$23');
assert.equal(formatProductPrice('$23'), '$23');
