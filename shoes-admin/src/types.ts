export interface Product {
  id: string;
  name: string;
  brief: string;
  price: string;
  inStock: boolean;
  category: string;
  images: string[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link: string;
}
