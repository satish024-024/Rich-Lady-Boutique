export interface OccasionItem {
  id: string;
  title: string;
  link: string;
  imageUrl: string;
}

export const occasionData: OccasionItem[] = [
  {
    id: "wedding",
    title: "Wedding",
    link: "/catalog?occasion=wedding",
    imageUrl: "/images/occ_wedding.jpg"
  },
  {
    id: "festival",
    title: "Festival",
    link: "/catalog?occasion=festival",
    imageUrl: "/images/occ_festival.jpg"
  },
  {
    id: "office-wear",
    title: "Office Wear",
    link: "/catalog?occasion=office-wear",
    imageUrl: "/images/occ_office.jpg"
  },
  {
    id: "daily-wear",
    title: "Daily Wear",
    link: "/catalog?occasion=daily-wear",
    imageUrl: "/images/occ_daily.jpg"
  },
  {
    id: "party-wear",
    title: "Party Wear",
    link: "/catalog?occasion=party-wear",
    imageUrl: "/images/occ_party.jpg"
  },
  {
    id: "traditional",
    title: "Traditional",
    link: "/catalog?occasion=traditional",
    imageUrl: "/images/occ_traditional.jpg"
  },
  {
    id: "designer",
    title: "Designer",
    link: "/catalog?occasion=designer",
    imageUrl: "/images/occ_designer.jpg"
  },
  {
    id: "casual",
    title: "Casual",
    link: "/catalog?occasion=casual",
    imageUrl: "/images/occ_casual.jpg"
  }
];
