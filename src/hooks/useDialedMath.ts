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
  activeRidingStyle: RidingStyle
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

  // 5. Strict Modifier: If Surface is 'Wet' (-1.5 PSI)
  if (condition === "wet_slippery") {
    mods.push({
      label: "Wet Surface",
      delta: -1.5,
      description: "Dropped 1.5 PSI for wet & slick surface mechanical grip",
    });
  } else if (condition === "bike_park") {
    mods.push({
      label: "Bike Park",
      delta: 2.0,
      description: "Added +2.0 PSI to resist high-speed berm compressions and rim strikes",
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
  overrideStyle?: RidingStyle
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

    // 1. "Minty" Deterministic Baseline Physics
    let baseFrontPsi = 21.0;
    let baseRearPsi = 23.0;

    switch (bike.category) {
      case "road":
        // Road Baseline: Front = (Weight / 10) + 55, Rear = (Weight / 10) + 57
        baseFrontPsi = weight / 10 + 55;
        baseRearPsi = weight / 10 + 57;
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
      case "full_suspension":
      case "hardtail":
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
      activeRidingStyle
    );
    const rearModifiers = calculateTireModifiers(
      bike.rearTire,
      bike,
      condition,
      activeRidingStyle
    );

    const frontTotalDelta = frontModifiers.reduce((acc, m) => acc + m.delta, 0);
    const rearTotalDelta = rearModifiers.reduce((acc, m) => acc + m.delta, 0);

    const minFloor = bike.category === "fat_bike" ? 4.0 : 12.0;
    const frontPsi = Math.max(minFloor, baseFrontPsi + frontTotalDelta);
    const rearPsi = Math.max(minFloor + 1, baseRearPsi + rearTotalDelta);

    // 3. Suspension Calculations
    const hasForkSuspension =
      (bike.category === "full_suspension" || bike.category === "hardtail") &&
      bike.forkTravel > 0;
    const hasRearSuspension = bike.category === "full_suspension";

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
  }, [bike, profile.weight, activeRidingStyle, condition]);
}
