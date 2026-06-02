export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  brief: string;
  price: string;
  inStock: boolean;
  featured: boolean;
  category: string;
  images: string[];
}

export interface Database {
  categories: Category[];
  products: Product[];
}
