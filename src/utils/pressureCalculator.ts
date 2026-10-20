/**
 * DialedEngine Telemetry Engine - Tire Pressure Calculator
 */

export interface CalculateTirePressureParams {
  riderWeightLbs: number;
  bikeWeightLbs: number;
  isFront: boolean;
  tireWidth: string | number;
  casing: string;
  hasInsert: boolean;
}

/**
 * Parses tire width string or number into decimal inches.
 * Handles: 2.4, "2.4", "2.5\" WT", "40mm", etc.
 */
export function parseTireWidthInches(width: string | number): number {
  if (typeof width === "number" && !isNaN(width) && width > 0) {
    return width;
  }
  if (!width || typeof width !== "string") {
    return 2.3;
  }

  const trimmed = width.trim();
  // Check for millimeter specifier (e.g. 40mm gravel/road tires)
  const mmMatch = trimmed.match(/^([\d.]+)\s*mm/i);
  if (mmMatch) {
    const mm = parseFloat(mmMatch[1]);
    if (!isNaN(mm) && mm > 0) {
      return mm / 25.4;
    }
  }

  // Extract decimal number (e.g. "2.5\" WT" -> 2.5)
  const match = trimmed.match(/([\d.]+)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0) {
      return val;
    }
  }

  return 2.3;
}

/**
 * Computes casing modifier based on casing name.
 * - 'EXO' or 'SilkShield' = +1.0
 * - 'EXO+' = 0.0
 * - 'DoubleDown' = -1.5
 * - 'Downhill' = -2.5
 */
export function getCasingModifier(casing: string): number {
  const c = (casing || "").toLowerCase().trim();

  // Check most reinforced / downhill first
  if (c.includes("downhill") || c.includes("dh") || c.includes("gravity shield") || c.includes("grid gravity") || c.includes("super downhill")) {
    return -2.5;
  }
  if (c.includes("doubledown") || c.includes("dd") || c.includes("super gravity") || c.includes("enduro")) {
    return -1.5;
  }
  if (c.includes("exo+") || c.includes("super trail") || c.includes("grid trail")) {
    return 0.0;
  }
  if (
    c.includes("exo") ||
    c.includes("silkshield") ||
    c.includes("control") ||
    c.includes("super ground") ||
    c.includes("trail") ||
    c.includes("light")
  ) {
    return 1.0;
  }

  return 0.0;
}

/**
 * Calculates recommended tire pressure according to DialedEngine telemetry math:
 * - Base PSI = (riderWeightLbs + (bikeWeightLbs * 0.5)) / 7
 * - Axle Bias: Front = Base - 1.0, Rear = Base + 2.0
 * - Volume Modifier: For every 0.1" wider than 2.3", subtract 0.5 PSI. For every 0.1" narrower, add 0.5 PSI.
 * - Casing Modifier: 'EXO' or 'SilkShield' = +1.0, 'EXO+' = 0.0, 'DoubleDown' = -1.5, 'Downhill' = -2.5.
 * - Insert Modifier: If hasInsert is true, subtract 1.5 PSI.
 * - Minimum safety floor: 15.0 PSI.
 * - Result: rounded to 1 decimal place.
 */
export function calculateTirePressure({
  riderWeightLbs,
  bikeWeightLbs,
  isFront,
  tireWidth,
  casing,
  hasInsert,
}: CalculateTirePressureParams): number {
  const safeRiderWeight = Math.max(80, Number(riderWeightLbs) || 165);
  const safeBikeWeight = Math.max(10, Number(bikeWeightLbs) || 32);

  // 1. Base PSI
  const basePsi = (safeRiderWeight + safeBikeWeight * 0.5) / 7;

  // 2. Axle Bias
  const axlePsi = isFront ? basePsi - 1.0 : basePsi + 2.0;

  // 3. Volume Modifier: For every 0.1" wider than 2.3", subtract 0.5 PSI; narrower adds 0.5 PSI
  const parsedWidth = parseTireWidthInches(tireWidth);
  const widthDiff = parsedWidth - 2.3;
  const volumeModifier = -((widthDiff / 0.1) * 0.5);

  // 4. Casing Modifier
  const casingModifier = getCasingModifier(casing);

  // 5. Insert Modifier
  const insertModifier = hasInsert ? -1.5 : 0.0;

  // Total Calculation
  const unroundedPsi = axlePsi + volumeModifier + casingModifier + insertModifier;

  // 6. Hard safety floor: 15.0 PSI
  const flooredPsi = Math.max(15.0, unroundedPsi);

  // 7. Rounded to one decimal place
  return Math.round(flooredPsi * 10) / 10;
}

export interface SetupCalculationResult {
  basePsi: number;
  frontPsi: number;
  rearPsi: number;
  frontModifiers: {
    axleBias: number;
    volume: number;
    casing: number;
    insert: number;
  };
  rearModifiers: {
    axleBias: number;
    volume: number;
    casing: number;
    insert: number;
  };
}

export function calculateFullBikeSetupPressures(params: {
  riderWeightLbs: number;
  bikeWeightLbs?: number;
  isEBike?: boolean;
  frontTire: {
    width: string | number;
    casing: string;
    hasInsert: boolean;
  };
  rearTire: {
    width: string | number;
    casing: string;
    hasInsert: boolean;
  };
}): SetupCalculationResult {
  const safeRiderWeight = Math.max(80, Number(params.riderWeightLbs) || 165);
  // Default bike weight: analog MTB ~32 lbs, e-bike ~50 lbs
  const defaultBikeWeight = params.isEBike ? 50 : 32;
  const safeBikeWeight = Math.max(10, Number(params.bikeWeightLbs) || defaultBikeWeight);

  const basePsi = Math.round(((safeRiderWeight + safeBikeWeight * 0.5) / 7) * 10) / 10;

  const frontPsi = calculateTirePressure({
    riderWeightLbs: safeRiderWeight,
    bikeWeightLbs: safeBikeWeight,
    isFront: true,
    tireWidth: params.frontTire.width,
    casing: params.frontTire.casing,
    hasInsert: params.frontTire.hasInsert,
  });

  const rearPsi = calculateTirePressure({
    riderWeightLbs: safeRiderWeight,
    bikeWeightLbs: safeBikeWeight,
    isFront: false,
    tireWidth: params.rearTire.width,
    casing: params.rearTire.casing,
    hasInsert: params.rearTire.hasInsert,
  });

  const frontWidth = parseTireWidthInches(params.frontTire.width);
  const rearWidth = parseTireWidthInches(params.rearTire.width);

  return {
    basePsi,
    frontPsi,
    rearPsi,
    frontModifiers: {
      axleBias: -1.0,
      volume: Math.round(-((frontWidth - 2.3) / 0.1 * 0.5) * 10) / 10,
      casing: getCasingModifier(params.frontTire.casing),
      insert: params.frontTire.hasInsert ? -1.5 : 0.0,
    },
    rearModifiers: {
      axleBias: 2.0,
      volume: Math.round(-((rearWidth - 2.3) / 0.1 * 0.5) * 10) / 10,
      casing: getCasingModifier(params.rearTire.casing),
      insert: params.rearTire.hasInsert ? -1.5 : 0.0,
    },
  };
}
