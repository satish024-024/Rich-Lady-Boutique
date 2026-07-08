import { NavigationItem } from "@/types/navigation";

export const navigationItems: NavigationItem[] = [
  {
    label: "Home",
    href: "/"
  },
  {
    label: "Collection",
    href: "/catalog",
    dropdownItems: [
      { label: "Sarees", href: "/catalog?category=Sarees" },
      { label: "Kurtis", href: "/catalog?category=Kurtis" },
      { label: "Dress Materials", href: "/catalog?category=Dress Materials" },
      { label: "Lehengas", href: "/catalog?category=Lehengas" },
      { label: "Gowns", href: "/catalog?category=Gowns" },
      { label: "Western Wear", href: "/catalog?category=Western Wear" },
      { label: "Accessories", href: "/catalog?category=Accessories" }
    ]
  },
  {
    label: "Sarees",
    href: "/catalog?category=Sarees"
  },
  {
    label: "Kurtis",
    href: "/catalog?category=Kurtis"
  },
  {
    label: "Dress Materials",
    href: "/catalog?category=Dress Materials"
  },
  {
    label: "Lehengas",
    href: "/catalog?category=Lehengas"
  },
  {
    label: "Accessories",
    href: "/catalog?category=Accessories"
  },
  {
    label: "Sale",
    href: "/catalog?category=Sale"
  }
];
