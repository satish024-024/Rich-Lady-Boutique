export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  rating?: number;
  reviewsCount?: number;
  description?: string;
  isNewArrival?: boolean;
  isSale?: boolean;
  originalPrice?: number;
  fabric?: string;
  sizes?: string[];
  collectionTag?: string;
  hoverImageUrl?: string;
  stock?: number;
}
