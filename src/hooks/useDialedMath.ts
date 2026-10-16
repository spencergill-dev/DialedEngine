import { useMemo } from "react";
import type {
  Bike,
  RiderProfile,
  TrailCondition,
  SetupCalculationOutput,
  ModifierItem,
  RidingStyle,
  TireSetup,
} from "@/types/cycling";

function calculateTireModifiers(
  tire: TireSetup,
  bike: Bike,
  condition: TrailCondition,
  activeRidingStyle: RidingStyle,
  temperature?: number
): ModifierItem[] {
  const mods: ModifierItem[] = [];

  // 1. Strict Modifier: If E-Bike (+2.0 PSI)
  if (bike.isEBike) {
    mods.push({
      label: "E-Bike Chassis",
      delta: 2.0,
      description: "Added +2.0 PSI for e-bike motor and battery chassis mass",
    });
  }

  // 2. Strict Modifier: If Tubeless (-2.0 PSI compared to tubes)
  if (tire.isTubeless) {
    mods.push({
      label: "Tubeless Setup",
      delta: -2.0,
      description: "Dropped 2.0 PSI for tubeless compliance (vs inner tubes)",
    });
  }

  // 3. Strict Modifier: If Tire Insert (-1.5 PSI)
  if (tire.hasInsert) {
    mods.push({
      label: "Tire Insert",
      delta: -1.5,
      description: "Dropped 1.5 PSI for tire insert (CushCore) rim protection",
    });
  }

  // 4. Strict Modifier: If Heavy/DH Casing (-1.0 PSI)
  if (tire.casing === "heavy") {
    mods.push({
      label: "Heavy / DH Casing",
      delta: -1.0,
      description: "Dropped 1.0 PSI for reinforced casing sidewall stiffness",
    });
  }

  // 5. Strict Surface Condition Modifiers
  switch (condition) {
    case "wet_slippery":
    case "wet_mud":
    case "fat_mud":
      mods.push({
        label: "Wet / Mud",
        delta: -1.5,
        description: "Dropped 1.5 PSI for slick mud & wet surface mechanical grip",
      });
      break;
    case "wet_tarmac":
    case "wet_rain":
      mods.push({
        label: "Wet Surface",
        delta: -3.0,
        description: "Dropped 3.0 PSI for wet pavement safety & braking grip",
      });
      break;
    case "bike_park":
      mods.push({
        label: "Bike Park",
        delta: 2.0,
        description: "Added +2.0 PSI to resist high-speed berm compressions and rim strikes",
      });
      break;
    case "snow_ice":
      mods.push({
        label: "Snow / Ice",
        delta: -2.0,
        description: "Dropped 2.0 PSI to maximize tread siping contact on frozen terrain",
      });
      break;
    case "packed_snow":
      mods.push({
        label: "Packed Snow",
        delta: -1.0,
        description: "Dropped 1.0 PSI for groomed snow floatation and bite",
      });
      break;
    case "deep_snow":
      mods.push({
        label: "Deep Snow",
        delta: -2.5,
        description: "Dropped 2.5 PSI for ultra-low pressure floatation over unpacked snow",
      });
      break;
    case "sand":
      mods.push({
        label: "Sand Floatation",
        delta: -2.0,
        description: "Dropped 2.0 PSI to widen tire footprint and prevent sand trenching",
      });
      break;
    case "hardpack_pavement":
      mods.push({
        label: "Pavement / Hardpack",
        delta: 2.0,
        description: "Added +2.0 PSI for fast rolling efficiency on smooth tarmac",
      });
      break;
    case "loose_chunky":
      mods.push({
        label: "Loose / Chunky",
        delta: -2.0,
        description: "Dropped 2.0 PSI to reduce tire deflection over loose rocks",
      });
      break;
    case "smooth_asphalt":
      mods.push({
        label: "Smooth Asphalt",
        delta: 3.0,
        description: "Added +3.0 PSI for low rolling resistance on pristine asphalt",
      });
      break;
    case "rough_chipseal":
      mods.push({
        label: "Rough / Chipseal",
        delta: -3.0,
        description: "Dropped 3.0 PSI to damp road buzz and reduce fatigue",
      });
      break;
    case "cobblestones":
      mods.push({
        label: "Cobblestones",
        delta: -6.0,
        description: "Dropped 6.0 PSI for compliance over harsh stone pavé",
      });
      break;
    case "rough_potholes":
      mods.push({
        label: "Potholes / Rough",
        delta: -2.0,
        description: "Dropped 2.0 PSI for shock absorption over urban pavement cracks",
      });
      break;
    case "winter_slush":
      mods.push({
        label: "Winter / Slush",
        delta: -4.0,
        description: "Dropped 4.0 PSI to broaden contact patch in slush and ice",
      });
      break;
    default:
      // Nominal/dry conditions: 0 delta
      break;
  }

  // 6. Cold Ambient Temperature Compensation (<10°C adds +1.0 PSI)
  if (typeof temperature === "number" && temperature < 10) {
    mods.push({
      label: "Cold Air Density (<10°C)",
      delta: 1.0,
      description: `Added +1.0 PSI to compensate for cold air contraction and pressure loss at ${temperature}°C`,
    });
  }

  // Riding Style Dynamics
  if (activeRidingStyle === "aggressive_heavy") {
    mods.push({
      label: "Aggressive Style",
      delta: 1.5,
      description: "Added +1.5 PSI for hard-charging aggressive riding support",
    });
  } else if (activeRidingStyle === "smooth_light") {
    mods.push({
      label: "Smooth Style",
      delta: -1.0,
      description: "Dropped 1.0 PSI for finesse riding compliance & sensitivity",
    });
  }

  return mods;
}

export function useDialedMath(
  bike: Bike | undefined,
  profile: RiderProfile,
  condition: TrailCondition,
  overrideStyle?: RidingStyle,
  temperature?: number
): SetupCalculationOutput {
  const activeRidingStyle = overrideStyle || profile.ridingStyle || "neutral";

  return useMemo(() => {
    const weight = Math.max(90, profile.weight || 165);

    if (!bike) {
      return {
        frontPsi: 21.0,
        rearPsi: 23.0,
        forkPsi: 75.0,
        shockPsi: 185.0,
        reboundClicks: 8,
        hasForkSuspension: true,
        hasRearSuspension: true,
        frontModifiers: [],
        rearModifiers: [],
        suspensionNotes: [],
      };
    }

    // 1. "Minty" Deterministic Baseline Physics by Discipline
    const discipline =
      bike.discipline ||
      (bike.category === "road"
        ? "road"
        : bike.category === "urban_commuter"
        ? "urban_commuter"
        : bike.category === "gravel"
        ? "gravel"
        : bike.category === "fat_bike"
        ? "fat_bike"
        : "mountain");

    let baseFrontPsi = 21.0;
    let baseRearPsi = 23.0;

    switch (discipline) {
      case "road":
        // Road Baseline: Front = (Weight / 10) + 55, Rear = (Weight / 10) + 57
        baseFrontPsi = weight / 10 + 55;
        baseRearPsi = weight / 10 + 57;
        break;
      case "urban_commuter":
        // Commuter Baseline: Front = (Weight / 10) + 35, Rear = (Weight / 10) + 38
        baseFrontPsi = weight / 10 + 35;
        baseRearPsi = weight / 10 + 38;
        break;
      case "gravel":
        // Gravel Baseline: Front = (Weight / 10) + 15, Rear = (Weight / 10) + 17
        baseFrontPsi = weight / 10 + 15;
        baseRearPsi = weight / 10 + 17;
        break;
      case "fat_bike":
        // Fat Bike Baseline: Front = (Weight / 30) + 2, Rear = (Weight / 30) + 4
        baseFrontPsi = weight / 30 + 2;
        baseRearPsi = weight / 30 + 4;
        break;
      case "mountain":
      default:
        // MTB Baseline: Front = (Weight / 10) + 1, Rear = (Weight / 10) + 3
        baseFrontPsi = weight / 10 + 1;
        baseRearPsi = weight / 10 + 3;
        break;
    }

    // 2. Compute Strict Modifiers
    const frontModifiers = calculateTireModifiers(
      bike.frontTire,
      bike,
      condition,
      activeRidingStyle,
      temperature
    );
    const rearModifiers = calculateTireModifiers(
      bike.rearTire,
      bike,
      condition,
      activeRidingStyle,
      temperature
    );

    const frontTotalDelta = frontModifiers.reduce((acc, m) => acc + m.delta, 0);
    const rearTotalDelta = rearModifiers.reduce((acc, m) => acc + m.delta, 0);

    const minFloor =
      discipline === "fat_bike"
        ? 3.5
        : discipline === "road"
        ? 45.0
        : discipline === "urban_commuter"
        ? 30.0
        : 12.0;

    const frontPsi = Math.max(minFloor, baseFrontPsi + frontTotalDelta);
    const rearPsi = Math.max(minFloor + 1, baseRearPsi + rearTotalDelta);

    // 3. Suspension Calculations Strictly Read Suspension Layout
    const suspensionLayout =
      bike.suspensionLayout ||
      (bike.category === "full_suspension"
        ? "full_suspension"
        : bike.category === "hardtail"
        ? "front_suspension"
        : "rigid");

    const hasForkSuspension =
      suspensionLayout !== "rigid" && bike.forkTravel > 0;
    const hasRearSuspension = suspensionLayout === "full_suspension";

    let styleSuspensionFactor = 0;
    if (activeRidingStyle === "aggressive_heavy") {
      styleSuspensionFactor = 0.05; // +5%
    } else if (activeRidingStyle === "smooth_light") {
      styleSuspensionFactor = -0.05; // -5%
    }

    let forkPsi: number | null = null;
    let shockPsi: number | null = null;
    let reboundClicks: number | null = null;
    const suspensionNotes: string[] = [];

    if (hasForkSuspension) {
      forkPsi = weight * 0.45 * (1 + styleSuspensionFactor);
      let baseRebound = Math.floor(weight / 20);
      if (activeRidingStyle === "aggressive_heavy") {
        baseRebound = Math.max(1, baseRebound + 1);
      }
      reboundClicks = baseRebound;
      suspensionNotes.push(
        `Target 20% sag (~${(bike.forkTravel * 0.2).toFixed(0)}mm) in attack position.`
      );
      if (activeRidingStyle === "aggressive_heavy") {
        suspensionNotes.push(
          "Added +5% air spring pressure for aggressive riding bottom-out defense."
        );
      } else if (activeRidingStyle === "smooth_light") {
        suspensionNotes.push(
          "-5% air spring pressure calibrated for light finesse riding sensitivity."
        );
      }
    }

    if (hasRearSuspension) {
      shockPsi = weight * 1.1 * (1 + styleSuspensionFactor);
      suspensionNotes.push("Target 28–30% sag seated in ready riding gear.");
    }

    return {
      frontPsi,
      rearPsi,
      forkPsi,
      shockPsi,
      reboundClicks,
      hasForkSuspension,
      hasRearSuspension,
      frontModifiers,
      rearModifiers,
      suspensionNotes,
    };
  }, [bike, profile.weight, activeRidingStyle, condition, temperature]);
}
