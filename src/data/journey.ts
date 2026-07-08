export interface JourneyNode {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
}

export const journeyData: JourneyNode[] = [
  {
    id: "step-1",
    stepNumber: "01",
    title: "Design Inspiration",
    description: "Sketching classical motifs, drawing upon rich Indian heritage textures and silhouettes."
  },
  {
    id: "step-2",
    stepNumber: "02",
    title: "Fabric Selection",
    description: "Sourcing premium organic cottons, pure mulberry silks, and handloom linens from local weavers."
  },
  {
    id: "step-3",
    stepNumber: "03",
    title: "Dyeing",
    description: "Employing natural and certified safe pigments to lock in deep, rich colors."
  },
  {
    id: "step-4",
    stepNumber: "04",
    title: "Embroidery",
    description: "Intricate hand-stitched detailing: Zardozi, Gotapatti, Chikankari, and mirror enhancements."
  },
  {
    id: "step-5",
    stepNumber: "05",
    title: "Tailoring",
    description: "Master tailors cutting and assembling panels for optimal drape, shape, and longevity."
  },
  {
    id: "step-6",
    stepNumber: "06",
    title: "Quality Check",
    description: "Thorough multi-point inspection checks on thread tension, stitch alignment, and structural integrity."
  },
  {
    id: "step-7",
    stepNumber: "07",
    title: "Photography",
    description: "Capturing product textures and color details under natural, warm light."
  },
  {
    id: "step-8",
    stepNumber: "08",
    title: "Rich Lady Boutique",
    description: "Carefully packing each bespoke garment in muslin bags ready for worldwide dispatch."
  },
  {
    id: "step-9",
    stepNumber: "09",
    title: "Your Style",
    description: "Draped elegantly in your wardrobe, a symbol of confidence, timeless craftsmanship, and heritage grace."
  }
];
