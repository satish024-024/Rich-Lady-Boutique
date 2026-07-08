export interface HeroSlide {
  id: string;
  videoUrl: string;
  heading: string;
  subheading: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

export const heroData: HeroSlide = {
  id: "hero-1",
  videoUrl: "/videos/hero-placeholder.mp4",
  heading: "Timeless Indian Craftsmanship, Modern Grace",
  subheading: "Curated collections of premium sarees, bespoke kurtis, and wedding lehengas handcrafted by master artisans.",
  primaryCtaText: "Explore Collection",
  primaryCtaLink: "#collection",
  secondaryCtaText: "Contact Boutique",
  secondaryCtaLink: "https://wa.me/919030443306"
};
