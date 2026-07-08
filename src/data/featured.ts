export interface FeaturedCollection {
  id: string;
  title: string;
  heading: string;
  description: string;
  ctaText: string;
  link: string;
  imageUrl: string;
}

export const featuredData: FeaturedCollection[] = [
  {
    id: "wedding",
    title: "The Bridal Atelier",
    heading: "Wedding Collection",
    description: "Crafted for unforgettable celebrations. Discover pure banarasi silks, heavy hand-embroidered lehengas, and heritage sarees woven with pure zari threads.",
    ctaText: "Explore Collection",
    link: "/catalog?occasion=wedding",
    imageUrl: "/images/featured_wedding.jpg"
  },
  {
    id: "festive",
    title: "Royal Revelry",
    heading: "Festive Collection",
    description: "Vibrant hues, delicate gotapatti accents, and modern drapes designed to light up your festival nights.",
    ctaText: "Explore Collection",
    link: "/catalog?occasion=festival",
    imageUrl: "/images/featured_festive.jpg"
  },
  {
    id: "everyday",
    title: "Timeless Comfort",
    heading: "Everyday Elegance",
    description: "Breathable handloom cottons, soft linens, and flowy georgettes curated for effortless daily comfort.",
    ctaText: "Explore Collection",
    link: "/catalog?occasion=casual",
    imageUrl: "/images/featured_everyday.jpg"
  }
];
