/**
 * DialedEngine - Bike Weight Estimator Utility
 * 
 * Estimates realistic bicycle chassis weight based on category and frame material
 * when exact scale weight is unknown.
 */

export const BIKE_CATEGORIES = [
  "Gravel",
  "XC/Downcountry",
  "Trail",
  "Enduro",
  "Downhill",
  "E-Bike (Light)",
  "E-Bike (Full Power)",
] as const;

export type BikeCategoryOption = (typeof BIKE_CATEGORIES)[number];

export const FRAME_MATERIALS = [
  "Carbon",
  "Alloy/Aluminum",
  "Steel",
  "Titanium",
] as const;

export type FrameMaterialOption = (typeof FRAME_MATERIALS)[number];

interface WeightSpec {
  carbon: number;
  alloy: number;
  steel?: number;
  titanium?: number;
}

/**
 * Estimation Matrix:
 * - Gravel: Carbon = 19.5, Alloy/Steel = 22.5
 * - XC/Downcountry: Carbon = 25.0, Alloy = 28.0
 * - Trail: Carbon = 30.0, Alloy = 33.0
 * - Enduro: Carbon = 33.5, Alloy = 36.5
 * - Downhill: Carbon = 36.0, Alloy = 39.0
 * - E-Bike (Light): Carbon = 42.0, Alloy = 45.0
 * - E-Bike (Full): Carbon = 52.0, Alloy = 55.0
 */
const CATEGORY_WEIGHT_MAP: Record<string, WeightSpec> = {
  gravel: {
    carbon: 19.5,
    alloy: 22.5,
    steel: 22.5,
    titanium: 21.0,
  },
  "xc/downcountry": {
    carbon: 25.0,
    alloy: 28.0,
    steel: 28.5,
    titanium: 26.5,
  },
  trail: {
    carbon: 30.0,
    alloy: 33.0,
    steel: 34.0,
    titanium: 31.5,
  },
  enduro: {
    carbon: 33.5,
    alloy: 36.5,
    steel: 37.5,
    titanium: 35.0,
  },
  downhill: {
    carbon: 36.0,
    alloy: 39.0,
    steel: 40.0,
    titanium: 37.5,
  },
  "e-bike (light)": {
    carbon: 42.0,
    alloy: 45.0,
    steel: 46.0,
    titanium: 43.5,
  },
  "e-bike (full power)": {
    carbon: 52.0,
    alloy: 55.0,
    steel: 56.0,
    titanium: 53.5,
  },
  "e-bike (full)": {
    carbon: 52.0,
    alloy: 55.0,
    steel: 56.0,
    titanium: 53.5,
  },
};

/**
 * Calculates estimated bike weight in lbs based on category and material.
 */
export function estimateBikeWeight(
  category: string,
  material: string
): number {
  const normCategory = (category || "").toLowerCase().trim();
  const normMaterial = (material || "").toLowerCase().trim();

  let spec: WeightSpec | undefined = CATEGORY_WEIGHT_MAP[normCategory];

  if (!spec) {
    if (normCategory.includes("gravel")) {
      spec = CATEGORY_WEIGHT_MAP["gravel"];
    } else if (normCategory.includes("xc") || normCategory.includes("downcountry")) {
      spec = CATEGORY_WEIGHT_MAP["xc/downcountry"];
    } else if (normCategory.includes("trail")) {
      spec = CATEGORY_WEIGHT_MAP["trail"];
    } else if (normCategory.includes("enduro")) {
      spec = CATEGORY_WEIGHT_MAP["enduro"];
    } else if (normCategory.includes("downhill") || normCategory.includes("dh")) {
      spec = CATEGORY_WEIGHT_MAP["downhill"];
    } else if (normCategory.includes("light") && (normCategory.includes("bike") || normCategory.includes("ebike"))) {
      spec = CATEGORY_WEIGHT_MAP["e-bike (light)"];
    } else if (normCategory.includes("full") && (normCategory.includes("bike") || normCategory.includes("ebike"))) {
      spec = CATEGORY_WEIGHT_MAP["e-bike (full power)"];
    } else if (normCategory.includes("ebike") || normCategory.includes("e-bike")) {
      spec = CATEGORY_WEIGHT_MAP["e-bike (full power)"];
    } else {
      spec = CATEGORY_WEIGHT_MAP["trail"];
    }
  }

  if (normMaterial.includes("carbon")) {
    return spec.carbon;
  }

  if (normMaterial.includes("steel")) {
    return spec.steel ?? spec.alloy;
  }

  if (normMaterial.includes("titanium") || normMaterial.includes("ti")) {
    return spec.titanium ?? Math.round((spec.carbon + (spec.alloy - spec.carbon) * 0.5) * 10) / 10;
  }

  // Default to Alloy/Aluminum
  return spec.alloy;
}
