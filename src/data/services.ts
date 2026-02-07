export type PriceType = "fixed" | "starting_at" | "quote";

export type Service = {
  id: string;
  category: string;
  name: string;
  shortDesc: string;
  priceType: PriceType;
  price?: number;        // used for fixed or starting_at
  unitLabel?: string;    // e.g. "per visit", "per hour", "starting at"
  durationMins?: number; // for scheduling defaults
};

export const CATEGORIES = [
  "Home Services",
  "Woodworking",
  "Outdoor",
  "Hauling & Cleanup",
  "Consulting / Other",
] as const;

export const SERVICES: Service[] = [
  {
    id: "tv-mount",
    category: "Home Services",
    name: "TV Mounting",
    shortDesc: "Mount TV on drywall/wood studs with basic setup.",
    priceType: "fixed",
    price: 150,
    unitLabel: "flat rate",
    durationMins: 90,
  },
  {
    id: "ceiling-fan",
    category: "Home Services",
    name: "Ceiling Fan Install",
    shortDesc: "Replace existing fan/light fixture (standard ceiling height).",
    priceType: "starting_at",
    price: 175,
    unitLabel: "starting at",
    durationMins: 120,
  },
  {
    id: "custom-shelves",
    category: "Woodworking",
    name: "Custom Shelving (Built-In / Floating)",
    shortDesc: "Design + build shelving to fit your space.",
    priceType: "quote",
    durationMins: 60,
  },
  {
    id: "deck-repair",
    category: "Outdoor",
    name: "Deck Repair",
    shortDesc: "Replace boards, tighten structure, improve safety.",
    priceType: "quote",
    durationMins: 60,
  },
  {
    id: "junk-removal",
    category: "Hauling & Cleanup",
    name: "Junk Removal / Haul Away",
    shortDesc: "Pickup + disposal (pricing depends on volume and materials).",
    priceType: "starting_at",
    price: 125,
    unitLabel: "starting at",
    durationMins: 60,
  },
  {
    id: "project-consult",
    category: "Consulting / Other",
    name: "Project Consultation",
    shortDesc: "On-site or virtual planning, measurements, and recommendations.",
    priceType: "fixed",
    price: 75,
    unitLabel: "per 30 min",
    durationMins: 30,
  },
];
