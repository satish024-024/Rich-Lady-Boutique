export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  sideProfile1Url?: string;
  sideProfile2Url?: string;
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
  dimensions?: string;
  garmentCut?: string;
  artisanOrigin?: string;
  weavingStyle?: string;
  craftTime?: string;
  threadCount?: string;
  washingStandard?: string;
}
