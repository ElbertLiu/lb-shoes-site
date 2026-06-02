import type { Category, Database, Product } from './types.js';

export const defaultCategories: Category[] = [
  { id: 'c1', name: '运动鞋' },
  { id: 'c2', name: '户外鞋' },
  { id: 'c3', name: '凉鞋' },
  { id: 'c4', name: '休闲鞋' },
  { id: 'c5', name: '皮鞋' },
];

const productImages = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTY0NTR8MHwxfHNlYXJjaHwxfHxzaG9lc3xlbnwwfHx8fDE3MTI0NTgwMzh8MA&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
];

export function generateProducts(count: number): Product[] {
  const styles = ['网面透气', '防滑耐磨', '轻便减震', '复古休闲', '百搭经典'];
  const englishStyles = ['Breathable Mesh', 'Anti-slip', 'Lightweight', 'Retro Casual', 'Classic'];

  return Array.from({ length: count }, (_, index) => {
    const i = index + 1;
    const category = defaultCategories[i % defaultCategories.length].id;
    const styleZh = styles[i % styles.length];
    const styleEn = englishStyles[i % englishStyles.length];

    return {
      id: `SHOE-${10000 + i}`,
      name: `2026新款 ${category} ${styleZh}`,
      brief: styleEn,
      price: `$${(12 + (i % 18)).toFixed(2)} - $${(32 + (i % 26)).toFixed(2)}`,
      inStock: i % 5 !== 0,
      featured: i <= 20,
      category,
      images: [...productImages],
    };
  });
}

export const seedDatabase: Database = {
  categories: defaultCategories,
  products: generateProducts(60),
};
