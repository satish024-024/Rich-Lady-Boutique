export interface BudgetCollection {
  id: string;
  title: string;
  tagline: string;
  priceLabel: string;
  link: string;
  imageUrl: string;
}

export const budgetData: BudgetCollection[] = [
  {
    id: "under-999",
    title: "Affordable Elegance",
    tagline: "Everyday luxury essentials handcrafted for comfort.",
    priceLabel: "Under ₹999",
    link: "/catalog?maxPrice=999",
    imageUrl: "/images/budget_999.jpg"
  },
  {
    id: "under-1499",
    title: "Daily Luxury",
    tagline: "Elegant designs crafted with fine cotton and georgette.",
    priceLabel: "Under ₹1499",
    link: "/catalog?maxPrice=1499",
    imageUrl: "/images/budget_1499.jpg"
  },
  {
    id: "under-1999",
    title: "Festive Chic",
    tagline: "Delicate embroidery and zari highlights for celebrations.",
    priceLabel: "Under ₹1999",
    link: "/catalog?maxPrice=1999",
    imageUrl: "/images/budget_1999.jpg"
  },
  {
    id: "under-2999",
    title: "Bespoke Couture",
    tagline: "Exquisite handwoven details and designer patterns.",
    priceLabel: "Under ₹2999",
    link: "/catalog?maxPrice=2999",
    imageUrl: "/images/budget_2999.jpg"
  },
  {
    id: "premium-collection",
    title: "Heritage Couture",
    tagline: "Exclusive pure silks and bridal lehengas.",
    priceLabel: "Premium Collection",
    link: "/catalog?category=premium",
    imageUrl: "/images/budget_premium.jpg"
  }
];
