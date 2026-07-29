export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  introductoryText: string;
  benefits: string[];
  howItWorks: HowItWorksStep[];
  suitableFor: string[];
  considerations: string[];
  frequentlyAskedQuestions: Array<{
    question: string;
    answer: string;
  }>;
  image: string;
  imageAlt: string;
  icon: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metadataTitle: string;
  metadataDescription: string;
  relatedSlugs: string[];
  featured: boolean;
  active: boolean;
}

export interface Review {
  author: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface OpeningHour {
  days: string;
  hours: string;
}

export interface TrackingIds {
  ga4?: string | null;
  googleAds?: string | null;
}

export interface BrandConfig {
  primaryColor: string;
  secondaryColor: string;
  darkSurfaceColor: string;
}

export interface ImagesConfig {
  logoPlaceholder: string;
  heroPlaceholder: string;
  salonPlaceholder: string;
}

export interface SiteConfig {
  businessName: string;
  alternateName: string;
  description: string;
  telephone: string;
  telephoneHref: string;
  whatsappNumber: string | null;
  whatsappHref: string | null;
  address: string;
  building: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  googleBusinessProfile: string;
  googleMapsUrl: string;
  instagramUrl: string | null;
  domain: string | null;
  email: string | null;
  openingHours: OpeningHour[] | null;
  services: Service[];
  reviews: Review[] | null;
  socialLinks: SocialLink[] | null;
  trackingIds: TrackingIds | null;
  brand: BrandConfig;
  images: ImagesConfig;
}
