export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon mapping
}

export const servicesData: ServiceItem[] = [
  {
    id: "since-2011",
    title: "Since 2011",
    description: "Serving Indian fashion for over a decade with trust and style.",
    iconName: "Calendar"
  },
  {
    id: "premium-quality",
    title: "Premium Quality",
    description: "Every weave undergoes a meticulous 7-step quality control inspect.",
    iconName: "Award"
  },
  {
    id: "affordable-prices",
    title: "Affordable Prices",
    description: "Luxury within reach, direct from weavers with no middleman markup.",
    iconName: "Scale"
  },
  {
    id: "worldwide-shipping",
    title: "Worldwide Shipping",
    description: "Delivered securely to your doorstep across the globe.",
    iconName: "Globe"
  },
  {
    id: "wholesale-retail",
    title: "Wholesale & Retail",
    description: "Single custom purchases or bulk wedding orders catered seamlessly.",
    iconName: "Layers"
  }
];
