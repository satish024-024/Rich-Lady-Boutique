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
      { label: "Sarees", href: "/catalog" },
      { label: "Kurtis", href: "/catalog" },
      { label: "Dress Materials", href: "/catalog" },
      { label: "Lehengas", href: "/catalog" },
      { label: "Gowns", href: "/catalog" },
      { label: "Accessories", href: "/catalog" }
    ]
  },
  {
    label: "Sarees",
    href: "/catalog"
  },
  {
    label: "Kurtis",
    href: "/catalog"
  },
  {
    label: "Dress Materials",
    href: "/catalog"
  },
  {
    label: "Lehengas",
    href: "/catalog"
  },
  {
    label: "Accessories",
    href: "/catalog"
  },
  {
    label: "Sale",
    href: "/catalog"
  }
];
