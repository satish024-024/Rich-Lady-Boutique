export interface InstagramPost {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  title: string;
  collectionLink: string;
}

export const instagramData: InstagramPost[] = [
  {
    id: "reel-1",
    imageUrl: "/images/reels/reels_1.jpg",
    videoUrl: "/videos/reel_1.mp4",
    title: "The Banarasi Edit",
    collectionLink: "/catalog?fabric=banarasi"
  },
  {
    id: "reel-2",
    imageUrl: "/images/reels/reels_2.jpg",
    videoUrl: "/videos/reel_2.mp4",
    title: "Handloom Khadi Cottons",
    collectionLink: "/catalog?fabric=cotton"
  },
  {
    id: "reel-3",
    imageUrl: "/images/reels/reels_3.jpg",
    videoUrl: "/videos/reel_3.mp4",
    title: "Elegant Georgette Drape",
    collectionLink: "/catalog?fabric=georgette"
  },
  {
    id: "reel-4",
    imageUrl: "/images/reels/reels_4.jpg",
    videoUrl: "/videos/reel_4.mp4",
    title: "Pure Mulberry Silks",
    collectionLink: "/catalog?fabric=silk"
  }
];
