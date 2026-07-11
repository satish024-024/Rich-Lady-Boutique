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
    title: "Design & Curation",
    description: "Sketching timeless patterns and custom fits inspired by traditional art."
  },
  {
    id: "step-2",
    stepNumber: "02",
    title: "Heritage Weaving",
    description: "Weaving pure silks and fine organic cottons sourced from local master artisans."
  },
  {
    id: "step-3",
    stepNumber: "03",
    title: "Handcrafted Art",
    description: "Creating beautiful hand-stitched detailing and custom tailoring for a perfect drape."
  },
  {
    id: "step-4",
    stepNumber: "04",
    title: "Quality Delivery",
    description: "Carefully inspecting each piece, packing it in soft cotton bags, and shipping it worldwide."
  }
];
