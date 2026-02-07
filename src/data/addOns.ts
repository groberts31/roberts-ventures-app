import type { Service } from "./services";

import soundbarImg from "../assets/addons/soundbar-mount.png";
import haulImg from "../assets/addons/haul-away.png";
import deckWashImg from "../assets/addons/deck-wash.png";
import summaryImg from "../assets/addons/written-summary.png";
import highCeilingImg from "../assets/addons/high-ceiling.png";
import cableImg from "../assets/addons/cable-concealment.png";
import stainImg from "../assets/addons/stain-finish.png";
import heavyImg from "../assets/addons/heavy-items.png";

export type AddOn = Service & {
  parentServiceIds: string[];
  isAddOn: true;
  image?: string;
};

export const ADD_ONS: AddOn[] = [
  // TV Mounting add-ons
  {
    id: "addon-cable-concealment",
    parentServiceIds: ["tv-mount"],
    isAddOn: true,
    image: cableImg,
    category: "Add-Ons",
    name: "Cable Concealment (Surface Raceway)",
    shortDesc: "Hide TV cables using paintable surface raceway (in-wall not included).",
    priceType: "starting_at",
    price: 65,
    unitLabel: "starting at",
    durationMins: 30,
  },
  {
    id: "addon-soundbar-mount",
    parentServiceIds: ["tv-mount"],
    isAddOn: true,
    image: soundbarImg,
    category: "Add-Ons",
    name: "Soundbar Mount",
    shortDesc: "Mount soundbar beneath TV (bracket required).",
    priceType: "fixed",
    price: 55,
    unitLabel: "flat rate",
    durationMins: 25,
  },

  // Ceiling Fan add-ons
  {
    id: "addon-high-ceiling",
    parentServiceIds: ["ceiling-fan"],
    isAddOn: true,
    image: highCeilingImg,
    category: "Add-Ons",
    name: "High Ceiling / Tall Ladder Setup",
    shortDesc: "For ceilings above standard height (quote may apply).",
    priceType: "quote",
    durationMins: 20,
  },

  // Custom Shelving add-ons
  {
    id: "addon-stain-finish",
    parentServiceIds: ["custom-shelves"],
    isAddOn: true,
    image: stainImg,
    category: "Add-Ons",
    name: "Stain + Seal Finish",
    shortDesc: "Finish shelves with stain and protective sealant (pricing varies).",
    priceType: "quote",
    durationMins: 30,
  },

  // Junk Removal add-ons
  {
    id: "addon-haul-away",
    parentServiceIds: ["junk-removal"],
    isAddOn: true,
    image: haulImg,
    category: "Add-Ons",
    name: "Haul Away Old Furniture",
    shortDesc: "Remove and dispose of old furniture or bulky items.",
    priceType: "starting_at",
    price: 25,
    unitLabel: "starting at",
    durationMins: 15,
  },
  {
    id: "addon-heavy-items",
    parentServiceIds: ["junk-removal"],
    isAddOn: true,
    image: heavyImg,
    category: "Add-Ons",
    name: "Heavy Items / Stairs Handling",
    shortDesc: "For safes, appliances, pianos, or multi-floor carry-outs.",
    priceType: "quote",
    durationMins: 25,
  },

  // Deck Repair add-ons
  {
    id: "addon-deck-wash",
    parentServiceIds: ["deck-repair"],
    isAddOn: true,
    image: deckWashImg,
    category: "Add-Ons",
    name: "Deck Wash Prep",
    shortDesc: "Light cleaning to prep deck before repairs.",
    priceType: "starting_at",
    price: 45,
    unitLabel: "starting at",
    durationMins: 30,
  },

  // Consultation add-ons
  {
    id: "addon-written-summary",
    parentServiceIds: ["project-consult"],
    isAddOn: true,
    image: summaryImg,
    category: "Add-Ons",
    name: "Written Summary",
    shortDesc: "Written project plan with materials and timeline outline.",
    priceType: "starting_at",
    price: 40,
    unitLabel: "starting at",
    durationMins: 20,
  },
];

export function addOnsFor(serviceId: string) {
  return ADD_ONS.filter((a) => a.parentServiceIds.includes(serviceId));
}
