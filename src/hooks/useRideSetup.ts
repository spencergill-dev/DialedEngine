import { useMemo } from "react";
import type {
  Bike,
  RiderProfile,
  TrailCondition,
  BikeSetupOutput,
  ModifierNote,
} from "@/types/mountainBike";

export function useRideSetup(
  bike: Bike | undefined,
  profile: RiderProfile,
  trailCondition: TrailCondition
): BikeSetupOutput {
  return useMemo(() => {
    const totalRidingWeight = Math.max(100, profile.baseWeight + profile.gearWeight);

    if (!bike) {
      return {
        totalRidingWeight,
        frontPsi: 22.0,
        rearPsi: 24.0,
        forkPsi: totalRidingWeight * 0.45,
        shockPsi: totalRidingWeight * 1.1,
        reboundClicks: Math.floor(totalRidingWeight / 20),
        frontModifiers: [],
        rearModifiers: [],
        suspensionNotes: [],
      };
    }

    // Base Pressures
    const baseFrontPsi = totalRidingWeight / 10 + 2;
    const baseRearPsi = totalRidingWeight / 10 + 4;

    // --- FRONT TIRE MODIFIERS ---
    const frontModifiers: ModifierNote[] = [];

    if (bike.isEBike) {
      frontModifiers.push({
        label: "E-Bike Chassis",
        deltaPsi: 2.5,
        description: "Added 2.5 PSI for additional e-bike motor and battery weight",
      });
    }

    if (bike.frontTire.hasInsert) {
      frontModifiers.push({
        label: "Tire Insert",
        deltaPsi: -2.0,
        description: "Front pressure dropped 2.0 PSI for tire insert rim protection",
      });
    }

    if (bike.frontTire.casing === "heavy") {
      frontModifiers.push({
        label: "Heavy / DH Casing",
        deltaPsi: -1.0,
        description: "Dropped 1.0 PSI for reinforced downhill/heavy sidewall support",
      });
    } else if (bike.frontTire.casing === "standard") {
      frontModifiers.push({
        label: "Standard Casing",
        deltaPsi: -0.5,
        description: "Adjusted 0.5 PSI lower for robust trail/enduro casing",
      });
    }

    if (trailCondition === "wet_slippery") {
      frontModifiers.push({
        label: "Wet Conditions",
        deltaPsi: -1.5,
        description: "Front pressure dropped 1.5 PSI for grip over wet roots and mud",
      });
    } else if (trailCondition === "bike_park") {
      frontModifiers.push({
        label: "Bike Park",
        deltaPsi: 2.0,
        description: "Added 2.0 PSI to resist high-speed berm compression and rim strikes",
      });
    }

    // --- REAR TIRE MODIFIERS ---
    const rearModifiers: ModifierNote[] = [];

    if (bike.isEBike) {
      rearModifiers.push({
        label: "E-Bike Chassis",
        deltaPsi: 2.5,
        description: "Added 2.5 PSI for additional e-bike motor and battery weight",
      });
    }

    if (bike.rearTire.hasInsert) {
      rearModifiers.push({
        label: "Tire Insert",
        deltaPsi: -2.0,
        description: "Rear tire pressure dropped 2.0 PSI for CushCore / tire insert",
      });
    }

    if (bike.rearTire.casing === "heavy") {
      rearModifiers.push({
        label: "Heavy / DH Casing",
        deltaPsi: -1.0,
        description: "Dropped 1.0 PSI for stiff downhill/double-down casing",
      });
    } else if (bike.rearTire.casing === "standard") {
      rearModifiers.push({
        label: "Standard Casing",
        deltaPsi: -0.5,
        description: "Adjusted 0.5 PSI lower for standard enduro casing support",
      });
    }

    if (trailCondition === "wet_slippery") {
      rearModifiers.push({
        label: "Wet Conditions",
        deltaPsi: -1.5,
        description: "Rear tire pressure dropped 1.5 PSI for wet conditions",
      });
    } else if (trailCondition === "bike_park") {
      rearModifiers.push({
        label: "Bike Park",
        deltaPsi: 2.0,
        description: "Added 2.0 PSI for high-speed berm support and rim protection",
      });
    }

    const frontTotalMod = frontModifiers.reduce((acc, m) => acc + m.deltaPsi, 0);
    const rearTotalMod = rearModifiers.reduce((acc, m) => acc + m.deltaPsi, 0);

    const frontPsi = Math.max(14, baseFrontPsi + frontTotalMod);
    const rearPsi = Math.max(15, baseRearPsi + rearTotalMod);

    // --- SUSPENSION ---
    const forkPsi = totalRidingWeight * 0.45;
    const isHardtail = bike.suspensionType === "Hardtail";
    const shockPsi = isHardtail ? 0 : totalRidingWeight * 1.1;
    const reboundClicks = Math.floor(totalRidingWeight / 20);

    const suspensionNotes: string[] = [
      `Air spring pressures set to standard 25-30% sag based on ${totalRidingWeight} lbs total weight.`,
      `Rebound: set clicker ${reboundClicks} clicks counter-clockwise from fully closed (firmest).`,
    ];

    if (bike.isEBike) {
      suspensionNotes.push(
        "For e-bikes, consider adding 1 volume spacer if experiencing bottom-outs on high compressions."
      );
    }

    return {
      totalRidingWeight,
      frontPsi,
      rearPsi,
      forkPsi,
      shockPsi,
      reboundClicks,
      frontModifiers,
      rearModifiers,
      suspensionNotes,
    };
  }, [bike, profile.baseWeight, profile.gearWeight, trailCondition]);
}
