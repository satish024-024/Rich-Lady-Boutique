export interface FabricItem {
  id: string;
  title: string;
  link: string;
  imageUrl: string;
  description: string;
}

export const fabricData: FabricItem[] = [
  {
    id: "cotton",
    title: "Cotton",
    link: "/catalog?fabric=cotton",
    imageUrl: "/images/fab_cotton.jpg",
    description: "Pure combed cottons ensuring absolute comfort in tropical heat."
  },
  {
    id: "rayon",
    title: "Rayon",
    link: "/catalog?fabric=rayon",
    imageUrl: "/images/fab_rayon.jpg",
    description: "Silky texture with a beautiful fluid drape."
  },
  {
    id: "silk",
    title: "Silk",
    link: "/catalog?fabric=silk",
    imageUrl: "/images/fab_silk.jpg",
    description: "Pure Mulberry and Tussar handloom silks with rich luster."
  },
  {
    id: "linen",
    title: "Linen",
    link: "/catalog?fabric=linen",
    imageUrl: "/images/fab_linen.jpg",
    description: "Breathable organic flax linen offering premium structure."
  },
  {
    id: "chiffon",
    title: "Chiffon",
    link: "/catalog?fabric=chiffon",
    imageUrl: "/images/fab_chiffon.jpg",
    description: "Feather-light sheer drapes for graceful movements."
  },
  {
    id: "georgette",
    title: "Georgette",
    link: "/catalog?fabric=georgette",
    imageUrl: "/images/fab_georgette.jpg",
    description: "Bouncy crêpe textures suited for heavily embroidered ensembles."
  },
  {
    id: "organza",
    title: "Organza",
    link: "/catalog?fabric=organza",
    imageUrl: "/images/fab_organza.jpg",
    description: "Stiff sheer luxury fabrics embroidered with premium threadwork."
  },
  {
    id: "banarasi",
    title: "Banarasi",
    link: "/catalog?fabric=banarasi",
    imageUrl: "/images/fab_banarasi.jpg",
    description: "Traditional Varanasi weaves featuring metallic gold threads."
  }
];
