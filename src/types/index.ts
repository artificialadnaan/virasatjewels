import type { Product, ProductImage, Category, Collection } from "@prisma/client";

export type ProductWithImages = Product & {
  images: ProductImage[];
  category: Category | null;
  collection: Collection | null;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxQuantity: number;
};

export type CartState = {
  items: CartItem[];
  lastValidated: string;
};

export type CartValidationResult = {
  validItems: CartItem[];
  removedItems: { productId: string; name: string; reason: string }[];
  priceChanges: { productId: string; name: string; oldPrice: number; newPrice: number }[];
  quantityAdjustments: { productId: string; name: string; oldQty: number; newQty: number }[];
};
