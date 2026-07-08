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
    description: "Sketching classical motifs and drafting heritage silhouettes inspired by traditional Indian art."
  },
  {
    id: "step-2",
    stepNumber: "02",
    title: "Heritage Fabrics",
    description: "Sourcing pure mulberry silks, organic cottons, and handloom fabrics from local master weavers."
  },
  {
    id: "step-3",
    stepNumber: "03",
    title: "Artisanal Craft",
    description: "Intricate hand embroidery (Zardozi, Chikankari) and custom tailoring for the perfect drape."
  },
  {
    id: "step-4",
    stepNumber: "04",
    title: "Conscious Packaging",
    description: "Multi-point quality checks and packing in breathable, sustainable muslin bags for global delivery."
  }
];
