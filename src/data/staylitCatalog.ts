export type CandleProduct = {
  id: string;
  name: string;
  scent: string;
  price: number;
  size: string;
  burnTime: string;
  image?: string;
  description: string;
};

export type CandleOption = {
  id: string;
  name: string;
  priceDelta?: number; // add-on price adjustment
  note?: string;
};

export const STAY_LIT_PRODUCTS: CandleProduct[] = [
  {
    id: "lavender-calm",
    name: "Lavender Calm",
    scent: "Lavender + Vanilla",
    price: 18,
    size: "8 oz",
    burnTime: "40+ hrs",
    description: "Relaxing blend for stress relief and sleep.",
  },
  {
    id: "midnight-woods",
    name: "Midnight Woods",
    scent: "Cedarwood + Musk",
    price: 22,
    size: "10 oz",
    burnTime: "55+ hrs",
    description: "Deep, bold scent inspired by nighttime forests.",
  },
  {
    id: "vanilla-luxe",
    name: "Vanilla Luxe",
    scent: "French Vanilla",
    price: 16,
    size: "7 oz",
    burnTime: "35+ hrs",
    description: "Smooth luxury vanilla for everyday comfort.",
  },
];

// ---- Build Your Own Options ----
export const STAY_LIT_SCENTS: CandleOption[] = [
  { id: "lavender-vanilla", name: "Lavender + Vanilla", priceDelta: 0 },
  { id: "mahogany-teakwood", name: "Mahogany + Teakwood", priceDelta: 2 },
  { id: "clean-linen", name: "Clean Linen", priceDelta: 0 },
  { id: "island-citrus", name: "Island Citrus", priceDelta: 1 },
  { id: "midnight-musk", name: "Midnight Musk", priceDelta: 2 },
];

export const STAY_LIT_JARS: CandleOption[] = [
  { id: "classic-amber", name: "Classic Amber Jar (8 oz)", priceDelta: 0, note: "Best seller" },
  { id: "matte-black", name: "Matte Black Jar (10 oz)", priceDelta: 4, note: "Premium look" },
  { id: "clear-glass", name: "Clear Glass Jar (7 oz)", priceDelta: -1, note: "Light + clean" },
  { id: "tin-travel", name: "Travel Tin (6 oz)", priceDelta: -2, note: "Great for gifts" },
];

export const STAY_LIT_WICKS: CandleOption[] = [
  { id: "cotton", name: "Cotton Wick", priceDelta: 0, note: "Classic clean burn" },
  { id: "wood", name: "Wood Wick", priceDelta: 3, note: "Soft crackle sound" },
  { id: "hemp", name: "Hemp Wick", priceDelta: 1, note: "Even burn" },
];

// Base price for a custom candle BEFORE option deltas
export const STAY_LIT_CUSTOM_BASE_PRICE = 18;
