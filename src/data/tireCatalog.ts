/**
 * Tire Specifications Catalog
 * Nested hierarchy: Manufacturer -> Models -> { casings, compounds }
 */

export interface TireModelSpec {
  casings?: string[];
  compounds?: string[];
}

export interface TireBrandSpec {
  name: string;
  defaultCasings: string[];
  defaultCompounds: string[];
  models: Record<string, TireModelSpec>;
}

export type TireCatalog = Record<string, TireBrandSpec>;

export const DEFAULT_TIRE_CASINGS: string[] = [
  "EXO",
  "EXO+",
  "DoubleDown (DD)",
  "Downhill (DH)",
  "Super Trail",
  "Super Gravity",
  "Super Downhill",
  "Super Ground",
  "Super Race",
  "Enduro Casing",
  "Trail Casing",
  "Downhill Casing",
  "Grid Trail",
  "Grid Gravity",
  "Gravity Shield",
  "Downhill Shield",
  "HardWALL",
  "ProWALL",
  "Standard (Single-Ply)",
  "Light (XC / Race)",
];

export const DEFAULT_TIRE_COMPOUNDS: string[] = [
  "MaxxGrip (3C)",
  "MaxxTerra (3C)",
  "MaxxSpeed (3C)",
  "Dual Compound",
  "Addix Ultra Soft",
  "Addix Soft",
  "Addix Speedgrip",
  "Addix Speed",
  "BlackChili Soft",
  "BlackChili SuperSoft",
  "BlackChili Endurance",
  "GripTon T9",
  "GripTon T7",
  "GripTon T5",
  "Magi-X",
  "Gum-X",
  "Graphene 2.0 4C",
  "SmartGRIP Gravity",
  "SmartGRIP",
  "TriTec",
  "Standard Compound",
];

export const TIRE_CATALOG: TireCatalog = {
  maxxis: {
    name: "Maxxis",
    defaultCasings: [
      "EXO",
      "EXO+",
      "DoubleDown (DD)",
      "Downhill (DH)",
    ],
    defaultCompounds: [
      "MaxxGrip (3C)",
      "MaxxTerra (3C)",
      "MaxxSpeed (3C)",
      "Dual Compound",
    ],
    models: {
      "Assegai": {
        casings: ["EXO", "EXO+", "DoubleDown (DD)", "Downhill (DH)"],
        compounds: ["MaxxGrip (3C)", "MaxxTerra (3C)"],
      },
      "Minion DHR II": {
        casings: ["EXO", "EXO+", "DoubleDown (DD)", "Downhill (DH)"],
        compounds: ["MaxxGrip (3C)", "MaxxTerra (3C)", "Dual Compound"],
      },
      "Minion DHF": {
        casings: ["EXO", "EXO+", "DoubleDown (DD)", "Downhill (DH)"],
        compounds: ["MaxxGrip (3C)", "MaxxTerra (3C)", "Dual Compound"],
      },
      "Dissector": {
        casings: ["EXO", "EXO+", "DoubleDown (DD)", "Downhill (DH)"],
        compounds: ["MaxxGrip (3C)", "MaxxTerra (3C)", "Dual Compound"],
      },
      "High Roller III": {
        casings: ["DoubleDown (DD)", "Downhill (DH)"],
        compounds: ["MaxxGrip (3C)"],
      },
      "Aggressor": {
        casings: ["EXO", "DoubleDown (DD)"],
        compounds: ["Dual Compound"],
      },
      "Shorty": {
        casings: ["DoubleDown (DD)", "Downhill (DH)"],
        compounds: ["MaxxGrip (3C)"],
      },
      "Rekon": {
        casings: ["EXO", "EXO+"],
        compounds: ["MaxxTerra (3C)", "Dual Compound", "MaxxSpeed (3C)"],
      },
      "Rekon Race": {
        casings: ["EXO"],
        compounds: ["MaxxSpeed (3C)", "Dual Compound"],
      },
      "Ardent": {
        casings: ["EXO", "Standard (Single-Ply)"],
        compounds: ["Dual Compound", "Single Compound"],
      },
      "Ardent Race": {
        casings: ["EXO"],
        compounds: ["MaxxSpeed (3C)", "Dual Compound"],
      },
      "Aspen": {
        casings: ["EXO"],
        compounds: ["MaxxSpeed (3C)", "Dual Compound"],
      },
      "Rambler": {
        casings: ["EXO", "SilkShield"],
        compounds: ["Dual Compound"],
      },
      "Re-Fuse": {
        casings: ["MaxxShield", "Silkworm"],
        compounds: ["Dual Compound"],
      },
    },
  },
  schwalbe: {
    name: "Schwalbe",
    defaultCasings: [
      "Super Trail",
      "Super Gravity",
      "Super Downhill",
      "Super Ground",
      "Super Race",
    ],
    defaultCompounds: [
      "Addix Ultra Soft",
      "Addix Soft",
      "Addix Speedgrip",
      "Addix Speed",
    ],
    models: {
      "Magic Mary": {
        casings: ["Super Trail", "Super Gravity", "Super Downhill"],
        compounds: ["Addix Ultra Soft", "Addix Soft"],
      },
      "Big Betty": {
        casings: ["Super Trail", "Super Gravity", "Super Downhill"],
        compounds: ["Addix Ultra Soft", "Addix Soft"],
      },
      "Tacky Chan": {
        casings: ["Super Trail", "Super Gravity", "Super Downhill"],
        compounds: ["Addix Ultra Soft", "Addix Soft"],
      },
      "Hans Dampf": {
        casings: ["Super Trail", "Super Gravity"],
        compounds: ["Addix Soft", "Addix Speedgrip"],
      },
      "Nobby Nic": {
        casings: ["Super Ground", "Super Trail"],
        compounds: ["Addix Soft", "Addix Speedgrip"],
      },
      "Wicked Will": {
        casings: ["Super Race", "Super Ground", "Super Trail"],
        compounds: ["Addix Speedgrip", "Addix Soft"],
      },
      "Racing Ray": {
        casings: ["Super Race", "Super Ground"],
        compounds: ["Addix Speedgrip"],
      },
      "Racing Ralph": {
        casings: ["Super Race", "Super Ground"],
        compounds: ["Addix Speed"],
      },
      "G-One Allround": {
        casings: ["Super Ground", "RaceGuard"],
        compounds: ["Addix Speedgrip", "Dual Compound"],
      },
      "G-One Bite": {
        casings: ["Super Ground", "RaceGuard"],
        compounds: ["Addix Speedgrip"],
      },
      "G-One R": {
        casings: ["Super Race"],
        compounds: ["Addix Race"],
      },
      "Pro One": {
        casings: ["Super Race", "V-Guard"],
        compounds: ["Addix Race"],
      },
    },
  },
  continental: {
    name: "Continental",
    defaultCasings: [
      "Trail Casing",
      "Enduro Casing",
      "Downhill Casing",
      "ProTection",
    ],
    defaultCompounds: [
      "BlackChili Soft",
      "BlackChili SuperSoft",
      "BlackChili Endurance",
      "PureGrip",
    ],
    models: {
      "Kryptotal-Fr": {
        casings: ["Trail Casing", "Enduro Casing", "Downhill Casing"],
        compounds: ["BlackChili SuperSoft", "BlackChili Soft", "BlackChili Endurance"],
      },
      "Kryptotal-Re": {
        casings: ["Trail Casing", "Enduro Casing", "Downhill Casing"],
        compounds: ["BlackChili Soft", "BlackChili Endurance"],
      },
      "Argotal": {
        casings: ["Enduro Casing", "Downhill Casing", "Trail Casing"],
        compounds: ["BlackChili SuperSoft", "BlackChili Soft"],
      },
      "Xynotal": {
        casings: ["Trail Casing", "Enduro Casing", "Downhill Casing"],
        compounds: ["BlackChili Soft", "BlackChili Endurance"],
      },
      "Hydrotal": {
        casings: ["Downhill Casing"],
        compounds: ["BlackChili SuperSoft"],
      },
      "Mountain King": {
        casings: ["ProTection", "ShieldWall"],
        compounds: ["BlackChili", "PureGrip"],
      },
      "Cross King": {
        casings: ["ProTection", "RaceSport"],
        compounds: ["BlackChili", "PureGrip"],
      },
      "Race King": {
        casings: ["ProTection", "RaceSport"],
        compounds: ["BlackChili"],
      },
      "Terra Speed": {
        casings: ["ProTection"],
        compounds: ["BlackChili"],
      },
      "Terra Trail": {
        casings: ["ProTection"],
        compounds: ["BlackChili"],
      },
      "Grand Prix 5000 S TR": {
        casings: ["Vectran Breaker 3-Ply"],
        compounds: ["BlackChili"],
      },
    },
  },
  specialized: {
    name: "Specialized",
    defaultCasings: [
      "Grid Trail",
      "Grid Gravity",
      "Grid",
      "Control",
    ],
    defaultCompounds: [
      "GripTon T9",
      "GripTon T7",
      "GripTon T5",
      "GripTon T7/T9",
    ],
    models: {
      "Butcher": {
        casings: ["Grid Trail", "Grid Gravity"],
        compounds: ["GripTon T9", "GripTon T7"],
      },
      "Eliminator": {
        casings: ["Grid Trail", "Grid Gravity"],
        compounds: ["GripTon T7", "GripTon T7/T9"],
      },
      "Hillbilly": {
        casings: ["Grid Gravity"],
        compounds: ["GripTon T9"],
      },
      "Cannibal": {
        casings: ["Grid Gravity"],
        compounds: ["GripTon T9"],
      },
      "Ground Control": {
        casings: ["Control", "Grid"],
        compounds: ["GripTon T5", "GripTon T7"],
      },
      "Fast Trak": {
        casings: ["Control", "Grid", "S-Works"],
        compounds: ["GripTon T5", "GripTon T7"],
      },
      "Renegade": {
        casings: ["Control", "S-Works"],
        compounds: ["GripTon T5"],
      },
      "Pathfinder Pro": {
        casings: ["Grid Shield"],
        compounds: ["GripTon"],
      },
      "S-Works Turbo": {
        casings: ["BlackBelt"],
        compounds: ["GripTon T2/T5"],
      },
    },
  },
  michelin: {
    name: "Michelin",
    defaultCasings: [
      "Gravity Shield",
      "Downhill Shield",
      "Trail Shield",
    ],
    defaultCompounds: [
      "Magi-X",
      "Magi-X DH",
      "Gum-X",
    ],
    models: {
      "Wild Enduro Front": {
        casings: ["Gravity Shield", "Racing Line"],
        compounds: ["Magi-X", "Gum-X"],
      },
      "Wild Enduro Rear": {
        casings: ["Gravity Shield", "Racing Line"],
        compounds: ["Gum-X", "Magi-X"],
      },
      "DH22": {
        casings: ["Downhill Shield"],
        compounds: ["Magi-X DH"],
      },
      "DH34": {
        casings: ["Downhill Shield"],
        compounds: ["Magi-X DH"],
      },
      "Wild AM2": {
        casings: ["Trail Shield", "Gravity Shield"],
        compounds: ["Gum-X"],
      },
      "Force AM2": {
        casings: ["Gravity Shield"],
        compounds: ["Gum-X"],
      },
      "Power Cup": {
        casings: ["Aramid Shield"],
        compounds: ["Gum-X"],
      },
    },
  },
  vittoria: {
    name: "Vittoria",
    defaultCasings: [
      "Enduro",
      "Downhill",
      "Trail",
      "XC-Trail",
      "XC-Race",
    ],
    defaultCompounds: [
      "Graphene 2.0 4C",
      "1C Compound",
    ],
    models: {
      "Mazza": {
        casings: ["Enduro", "Downhill", "Trail"],
        compounds: ["Graphene 2.0 4C"],
      },
      "Martello": {
        casings: ["Enduro", "Downhill", "Trail"],
        compounds: ["Graphene 2.0 4C"],
      },
      "Mota": {
        casings: ["Enduro", "Downhill"],
        compounds: ["Graphene 2.0 4C"],
      },
      "Agarro": {
        casings: ["Trail"],
        compounds: ["Graphene 2.0 4C"],
      },
      "Barzo": {
        casings: ["XC-Race", "XC-Trail"],
        compounds: ["Graphene 2.0 4C"],
      },
      "Mezcal": {
        casings: ["XC-Race", "XC-Trail"],
        compounds: ["Graphene 2.0 4C"],
      },
      "Terreno Dry": {
        casings: ["Gravel TNT"],
        compounds: ["Graphene 2.0 4C"],
      },
      "Corsa PRO TLR": {
        casings: ["Cotton 320 TPI"],
        compounds: ["Graphene + Silica"],
      },
    },
  },
  pirelli: {
    name: "Pirelli",
    defaultCasings: [
      "HardWALL",
      "ProWALL",
      "DualWALL+",
    ],
    defaultCompounds: [
      "SmartGRIP Gravity",
      "SmartGRIP",
      "SmartEVO DH",
      "SmartEVO",
    ],
    models: {
      "Scorpion Enduro M": {
        casings: ["HardWALL", "ProWALL"],
        compounds: ["SmartGRIP Gravity"],
      },
      "Scorpion Enduro R": {
        casings: ["HardWALL"],
        compounds: ["SmartGRIP Gravity"],
      },
      "Scorpion Enduro S": {
        casings: ["HardWALL"],
        compounds: ["SmartGRIP Gravity"],
      },
      "Scorpion Race DH": {
        casings: ["DualWALL+"],
        compounds: ["SmartEVO DH"],
      },
      "Scorpion Trail M": {
        casings: ["ProWALL"],
        compounds: ["SmartGRIP"],
      },
      "Scorpion XC RC": {
        casings: ["ProWALL", "Lite"],
        compounds: ["SmartGRIP"],
      },
      "Cinturato Gravel M": {
        casings: ["TechWALL Gravel"],
        compounds: ["SpeedGRIP"],
      },
      "P Zero Race TLR": {
        casings: ["TechWALL+"],
        compounds: ["SmartEVO"],
      },
    },
  },
  wtb: {
    name: "WTB",
    defaultCasings: [
      "Tough / High Grip",
      "Tough / Fast Rolling",
      "Light / High Grip",
      "Light / Fast Rolling",
    ],
    defaultCompounds: [
      "TriTec",
      "Dual DNA",
    ],
    models: {
      "Vigilante": {
        casings: ["Tough / High Grip", "Light / High Grip"],
        compounds: ["TriTec"],
      },
      "Judge": {
        casings: ["Tough / High Grip", "Tough / Fast Rolling"],
        compounds: ["TriTec"],
      },
      "Trail Boss": {
        casings: ["Tough / Fast Rolling", "Light / Fast Rolling"],
        compounds: ["TriTec"],
      },
      "Verdict": {
        casings: ["Tough / High Grip", "Light / High Grip"],
        compounds: ["TriTec"],
      },
      "Riddler": {
        casings: ["Light / Fast Rolling"],
        compounds: ["Dual DNA"],
      },
      "Byway": {
        casings: ["Light / Fast Rolling"],
        compounds: ["Dual DNA"],
      },
    },
  },
};

export const TIRE_MANUFACTURERS: string[] = [
  "Maxxis",
  "Schwalbe",
  "Continental",
  "Specialized",
  "Michelin",
  "Vittoria",
  "Pirelli",
  "WTB",
  "Bontrager",
  "Goodyear",
  "Panaracer",
  "Teravail",
  "Kenda",
];

// Normalize helper for case-insensitive lookup
function normalizeKey(str: string): string {
  return str.trim().toLowerCase();
}

/**
 * Returns available tire manufacturers
 */
export function getTireManufacturers(): string[] {
  const catalogBrands = Object.values(TIRE_CATALOG).map((b) => b.name);
  return Array.from(new Set([...catalogBrands, ...TIRE_MANUFACTURERS]));
}

/**
 * Returns model names filtered by manufacturer if known, or all known models
 */
export function getTireModels(manufacturer?: string): string[] {
  if (!manufacturer || !manufacturer.trim()) {
    // Return all models across catalog
    const allModels: string[] = [];
    for (const brand of Object.values(TIRE_CATALOG)) {
      allModels.push(...Object.keys(brand.models));
    }
    return Array.from(new Set(allModels));
  }

  const brand = TIRE_CATALOG[normalizeKey(manufacturer)];
  if (brand) {
    return Object.keys(brand.models);
  }

  // If manufacturer is unknown/custom, return all catalog models as fallback
  const allModels: string[] = [];
  for (const b of Object.values(TIRE_CATALOG)) {
    allModels.push(...Object.keys(b.models));
  }
  return Array.from(new Set(allModels));
}

/**
 * Returns casing options filtered by manufacturer and model if known
 */
export function getTireCasings(manufacturer?: string, model?: string): string[] {
  if (!manufacturer || !manufacturer.trim()) {
    return DEFAULT_TIRE_CASINGS;
  }

  const brand = TIRE_CATALOG[normalizeKey(manufacturer)];
  if (!brand) {
    return DEFAULT_TIRE_CASINGS;
  }

  if (model && model.trim()) {
    // Check if model exists in brand
    const modelEntry = Object.entries(brand.models).find(
      ([m]) => normalizeKey(m) === normalizeKey(model)
    );
    if (modelEntry && modelEntry[1].casings && modelEntry[1].casings.length > 0) {
      return modelEntry[1].casings;
    }
  }

  return brand.defaultCasings.length > 0
    ? brand.defaultCasings
    : DEFAULT_TIRE_CASINGS;
}

/**
 * Returns compound options filtered by manufacturer and model if known
 */
export function getTireCompounds(manufacturer?: string, model?: string): string[] {
  if (!manufacturer || !manufacturer.trim()) {
    return DEFAULT_TIRE_COMPOUNDS;
  }

  const brand = TIRE_CATALOG[normalizeKey(manufacturer)];
  if (!brand) {
    return DEFAULT_TIRE_COMPOUNDS;
  }

  if (model && model.trim()) {
    const modelEntry = Object.entries(brand.models).find(
      ([m]) => normalizeKey(m) === normalizeKey(model)
    );
    if (modelEntry && modelEntry[1].compounds && modelEntry[1].compounds.length > 0) {
      return modelEntry[1].compounds;
    }
  }

  return brand.defaultCompounds.length > 0
    ? brand.defaultCompounds
    : DEFAULT_TIRE_COMPOUNDS;
}
