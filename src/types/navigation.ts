export interface NavigationItem {
  label: string;
  href: string;
  dropdownItems?: { label: string; href: string }[];
}
