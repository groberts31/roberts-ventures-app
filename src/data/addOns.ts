import type { Service } from "./services";

export type AddOn = Service & {
  parentServiceIds: string[]; // which services this add-on belongs to
  isAddOn: true;
};

export const ADD_ONS: AddOn[] = [
  // TV Mounting add-ons
  {
    id: "addon-cable-concealment",
    parentServiceIds: ["tv-mount"],
    isAddOn: true,
    category: "Add-Ons",
    name: "Cable Concealment (Surface Raceway)",
    shortDesc: "Hide cables using paintable surface raceway (in-wall not included).",
    priceType: "starting_at",
    price: 65,
    unitLabel: "starting at",
    durationMins: 30,
  },
  {
    id: "addon-soundbar-mount",
    parentServiceIds: ["tv-mount"],
    isAddOn: true,
    category: "Add-Ons",
    name: "Soundbar Mount",
    shortDesc: "Mount soundbar beneath TV (bracket required).",
    priceType: "fixed",
    price: 55,
    unitLabel: "flat rate",
    durationMins: 25,
  },

  // Ceiling fan add-ons
  {
    id: "addon-remove-old-fan",
    parentServiceIds: ["ceiling-fan"],
    isAddOn: true,
    category: "Add-Ons",
    name: "Haul Away Old Fixture",
    shortDesc: "Remove and dispose of old fan/light fixture.",
    priceType: "fixed",
    price: 25,
    unitLabel: "flat rate",
    durationMins: 10,
  },
  {
    id: "addon-high-ceiling",
    parentServiceIds: ["ceiling-fan"],
    isAddOn: true,
    category: "Add-Ons",
    name: "High Ceiling / Tall Ladder Setup",
    shortDesc: "For ceilings above standard height (quote may apply).",
    priceType: "quote",
    durationMins: 20,
  },

  // Custom shelves add-ons
  {
    id: "addon-finish-stain",
    parentServiceIds: ["custom-shelves"],
    isAddOn: true,
    category: "Add-Ons",
    name: "Stain + Seal Finish",
    shortDesc: "Finish shelves with stain + protective sealant.",
    priceType: "quote",
    durationMins: 30,
  },

  // Deck repair add-ons
  {
    id: "addon-deck-clean",
    parentServiceIds: ["deck-repair"],
    isAddOn: true,
    category: "Add-Ons",
    name: "Deck Wash Prep",
    shortDesc: "Light cleaning to prep for repair/inspection.",
    priceType: "starting_at",
    price: 45,
    unitLabel: "starting at",
    durationMins: 30,
  },

  // Junk removal add-ons
  {
    id: "addon-stairs-heavy",
    parentServiceIds: ["junk-removal"],
    isAddOn: true,
    category: "Add-Ons",
    name: "Stairs / Heavy Item Handling",
    shortDesc: "For stairs, tight hallways, or very heavy items (quote).",
    priceType: "quote",
    durationMins: 20,
  },

  // Consultation add-ons
  {
    id: "addon-written-summary",
    parentServiceIds: ["project-consult"],
    isAddOn: true,
    category: "Add-Ons",
    name: "Written Plan Summary",
    shortDesc: "Written next-step summary with materials & timeline outline.",
    priceType: "starting_at",
    price: 40,
    unitLabel: "starting at",
    durationMins: 20,
  },
];

export function addOnsFor(serviceId: string) {
  return ADD_ONS.filter((a) => a.parentServiceIds.includes(serviceId));
}
