export const CURRENCY_LABEL = "RM";

export type ProjectType = {
  id: string;
  label: string;
  description: string;
  minPrice: number;
  maxPrice: number;
};

export const projectTypes: ProjectType[] = [
  {
    id: "landing",
    label: "Landing Page",
    description: "Single-page site, responsive layout, simple contact/lead form",
    minPrice: 500,
    maxPrice: 1000,
  },
  {
    id: "multi-page",
    label: "Multi-Page Website",
    description: "~3–6 simple structured pages (Home, About, Services, Contact)",
    minPrice: 1000,
    maxPrice: 2500,
  },
  {
    id: "web-app",
    label: "Full-Stack Web App",
    description: "Custom app logic, database modeling, and simple dynamic workflows",
    minPrice: 2500,
    maxPrice: 5000,
  },
  {
    id: "marketplace",
    label: "E-commerce / Marketplace",
    description: "Basic store setup, product listings, cart, and standard checkout",
    minPrice: 3000,
    maxPrice: 6000,
  },
];

export type QuoteFeature = {
  id: string;
  label: string;
  description: string;
  minPrice: number;
  maxPrice: number;
};

export const features: QuoteFeature[] = [
  {
    id: "auth",
    label: "User Authentication",
    description: "Basic signup/login, sessions, OAuth, simple RBAC",
    minPrice: 200,
    maxPrice: 400,
  },
  {
    id: "database",
    label: "Database Integration",
    description: "PostgreSQL, Supabase, or MongoDB database schema & CRUD",
    minPrice: 300,
    maxPrice: 600,
  },
  {
    id: "cms",
    label: "Content Management",
    description: "Basic headless CMS (Sanity, Strapi) or light admin edit setup",
    minPrice: 300,
    maxPrice: 700,
  },
  {
    id: "payments",
    label: "Payment Integration",
    description: "Local gateway (ToyyibPay, FPX, Billplz) or basic Stripe Checkout",
    minPrice: 300,
    maxPrice: 600,
  },
  {
    id: "admin",
    label: "Admin Dashboard",
    description: "Basic management table, user view, and simple stats",
    minPrice: 500,
    maxPrice: 1000,
  },
  {
    id: "ai",
    label: "AI / LLM Integration",
    description: "Simple OpenAI/Gemini API integration, basic prompt/chat UI",
    minPrice: 500,
    maxPrice: 1200,
  },
  {
    id: "api",
    label: "3rd-Party API Integration",
    description: "REST API connection (WhatsApp webhooks, external service)",
    minPrice: 200,
    maxPrice: 500,
  },
  {
    id: "seo",
    label: "SEO Optimization",
    description: "Meta tags, basic sitemap, OpenGraph tags, page speed setup",
    minPrice: 150,
    maxPrice: 350,
  },
];

export type TimelineOption = {
  id: string;
  label: string;
  description: string;
  minSurcharge: number;
  maxSurcharge: number;
};

export const timelineOptions: TimelineOption[] = [
  {
    id: "standard",
    label: "Standard delivery",
    description: "No surcharge — usually 2–4 weeks",
    minSurcharge: 0,
    maxSurcharge: 0,
  },
  {
    id: "rush",
    label: "Rush delivery",
    description: "+15% to +30% for priority turnaround",
    minSurcharge: 0.15,
    maxSurcharge: 0.3,
  },
];

export type QuoteBundle = {
  id: string;
  label: string;
  description: string;
  projectTypeId: string;
  featureIds: string[];
};

export const bundles: QuoteBundle[] = [
  {
    id: "lead-gen",
    label: "Basic Marketing / Lead Gen Site",
    description: "Landing Page + SEO Optimization",
    projectTypeId: "landing",
    featureIds: ["seo"],
  },
  {
    id: "business-site",
    label: "Standard Business Website",
    description: "Multi-Page Website + Content Management + SEO Optimization",
    projectTypeId: "multi-page",
    featureIds: ["cms", "seo"],
  },
  {
    id: "saas-mvp",
    label: "Full-Stack SaaS MVP",
    description: "Full-Stack Web App + Auth + Database + Payments + Admin Dashboard",
    projectTypeId: "web-app",
    featureIds: ["auth", "database", "payments", "admin"],
  },
  {
    id: "ai-app",
    label: "AI-Powered Web Application",
    description: "Full-Stack Web App + Auth + Database + AI/LLM + Payments",
    projectTypeId: "web-app",
    featureIds: ["auth", "database", "ai", "payments"],
  },
  {
    id: "marketplace-bundle",
    label: "Simple Marketplace / E-commerce Platform",
    description: "Marketplace + Auth + Database + Payments + Admin Dashboard",
    projectTypeId: "marketplace",
    featureIds: ["auth", "database", "payments", "admin"],
  },
];

export type QuoteEstimate = {
  min: number;
  max: number;
};

const roundToNearest = (value: number, step: number) => Math.round(value / step) * step;

export function calculateEstimate(
  projectTypeId: string,
  featureIds: string[],
  timelineId: string
): QuoteEstimate | null {
  const type = projectTypes.find((t) => t.id === projectTypeId);
  if (!type) return null;

  const timeline = timelineOptions.find((t) => t.id === timelineId) ?? timelineOptions[0];

  const { minTotal, maxTotal } = featureIds.reduce(
    (totals, id) => {
      const feature = features.find((f) => f.id === id);
      if (!feature) return totals;
      return {
        minTotal: totals.minTotal + feature.minPrice,
        maxTotal: totals.maxTotal + feature.maxPrice,
      };
    },
    { minTotal: type.minPrice, maxTotal: type.maxPrice }
  );

  const min = minTotal * (1 + timeline.minSurcharge);
  const max = maxTotal * (1 + timeline.maxSurcharge);

  return {
    min: roundToNearest(min, 50),
    max: roundToNearest(max, 50),
  };
}
