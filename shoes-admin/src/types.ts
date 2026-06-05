export interface Product {
  id: string;
  name: string;
  brief: string;
  briefTranslations?: Partial<Record<string, string>>;
  price: string;
  inStock: boolean;
  featured: boolean;
  category: string;
  images: string[];
  colorOptions: ProductColorOption[];
}

export interface Category {
  id: string;
  name: string;
  translations?: Partial<Record<string, string>>;
}

export interface ProductColorOption {
  name: string;
  thumbnail: string;
}
