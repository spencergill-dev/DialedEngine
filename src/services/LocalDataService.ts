import type { Bike, RiderProfile } from "@/types/cycling";
import type { IDataService } from "./DataService";

export const STORAGE_KEYS = {
  PROFILE: "dialed_rider_profile_v4",
  BIKES: "dialed_garage_bikes_v4",
  ACTIVE_BIKE: "dialed_active_bike_id_v4",
};

export const DEFAULT_PROFILE: RiderProfile = {
  displayName: "",
  weight: null,
  heightInches: null,
  height: "",
  ridingStyle: "neutral",
};

function normalizeBike(bike: any): Bike {
  let discipline = bike.discipline;
  let suspensionLayout = bike.suspensionLayout;

  if (!discipline) {
    if (bike.category === "full_suspension" || bike.category === "hardtail") {
      discipline = "mountain";
    } else if (bike.category === "gravel") {
      discipline = "gravel";
    } else if (bike.category === "road") {
      discipline = "road";
    } else if (bike.category === "fat_bike") {
      discipline = "fat_bike";
    } else if (bike.category === "urban_commuter") {
      discipline = "urban_commuter";
    } else {
      discipline = "mountain";
    }
  }

  if (!suspensionLayout) {
    if (bike.category === "full_suspension") {
      suspensionLayout = "full_suspension";
    } else if (bike.category === "hardtail") {
      suspensionLayout = "front_suspension";
    } else if (bike.category === "gravel" || bike.category === "road") {
      suspensionLayout = "rigid";
    } else if (bike.category === "fat_bike") {
      suspensionLayout = Number(bike.forkTravel) > 0 ? "front_suspension" : "rigid";
    } else {
      suspensionLayout = Number(bike.forkTravel) > 0 ? "front_suspension" : "rigid";
    }
  }

  return {
    ...bike,
    discipline,
    suspensionLayout,
    category:
      bike.category ||
      (discipline === "mountain"
        ? suspensionLayout === "full_suspension"
          ? "full_suspension"
          : "hardtail"
        : discipline),
  };
}

export const DEFAULT_BIKES: Bike[] = [
  {
    id: "bike-mtb-1",
    brand: "Santa Cruz",
    model: "Megatower CC",
    year: "2024",
    frameSize: "L",
    discipline: "mountain",
    suspensionLayout: "full_suspension",
    category: "full_suspension",
    isEBike: false,
    forkModel: "Fox 38 Factory Grip2",
    forkTravel: 170,
    shockModel: "Fox Float X2 Factory",
    frontTire: {
      wheelSize: "29\"",
      manufacturer: "Maxxis",
      model: "Assegai",
      width: "2.5\" WT",
      casing: "standard",
      hasInsert: false,
      isTubeless: true,
    },
    rearTire: {
      wheelSize: "29\"",
      manufacturer: "Maxxis",
      model: "Minion DHR II",
      width: "2.4\" WT",
      casing: "heavy",
      hasInsert: true,
      isTubeless: true,
    },
  },
  {
    id: "bike-emtb-2",
    brand: "Specialized",
    model: "Turbo Levo Comp",
    year: "2024",
    frameSize: "S4",
    discipline: "mountain",
    suspensionLayout: "full_suspension",
    category: "full_suspension",
    isEBike: true,
    forkModel: "Fox 36 Rhythm E-Tuned",
    forkTravel: 160,
    shockModel: "Fox Float X Performance",
    frontTire: {
      wheelSize: "29\"",
      manufacturer: "Specialized",
      model: "Butcher GRID Trail",
      width: "2.6\"",
      casing: "standard",
      hasInsert: false,
      isTubeless: true,
    },
    rearTire: {
      wheelSize: "27.5\"",
      manufacturer: "Specialized",
      model: "Eliminator GRID Gravity",
      width: "2.6\"",
      casing: "heavy",
      hasInsert: true,
      isTubeless: true,
    },
  },
  {
    id: "bike-gravel-3",
    brand: "Canyon",
    model: "Grizl CF SL 8",
    year: "2024",
    frameSize: "M",
    discipline: "gravel",
    suspensionLayout: "rigid",
    category: "gravel",
    isEBike: false,
    forkModel: "Canyon FK0087 Carbon Rigid",
    forkTravel: 0,
    shockModel: "Rigid Frame",
    frontTire: {
      wheelSize: "700c",
      manufacturer: "Schwalbe",
      model: "G-One Bite",
      width: "45mm",
      casing: "standard",
      hasInsert: false,
      isTubeless: true,
    },
    rearTire: {
      wheelSize: "700c",
      manufacturer: "Schwalbe",
      model: "G-One Bite",
      width: "45mm",
      casing: "standard",
      hasInsert: false,
      isTubeless: true,
    },
  },
  {
    id: "bike-road-4",
    brand: "Specialized",
    model: "Tarmac SL8 Pro",
    year: "2024",
    frameSize: "56cm",
    discipline: "road",
    suspensionLayout: "rigid",
    category: "road",
    isEBike: false,
    forkModel: "FACT 12R Carbon Rigid",
    forkTravel: 0,
    shockModel: "Rigid Frame",
    frontTire: {
      wheelSize: "700c",
      manufacturer: "Continental",
      model: "Grand Prix 5000 S TR",
      width: "28mm",
      casing: "light",
      hasInsert: false,
      isTubeless: true,
    },
    rearTire: {
      wheelSize: "700c",
      manufacturer: "Continental",
      model: "Grand Prix 5000 S TR",
      width: "28mm",
      casing: "light",
      hasInsert: false,
      isTubeless: true,
    },
  },
  {
    id: "bike-fat-5",
    brand: "Trek",
    model: "Farley 9.6",
    year: "2024",
    frameSize: "L",
    discipline: "fat_bike",
    suspensionLayout: "rigid",
    category: "fat_bike",
    isEBike: false,
    forkModel: "Bontrager Haru Pro Carbon",
    forkTravel: 0,
    shockModel: "Rigid Frame",
    frontTire: {
      wheelSize: "27.5\"",
      manufacturer: "Bontrager",
      model: "Barbegazi",
      width: "4.5\"",
      casing: "light",
      hasInsert: false,
      isTubeless: true,
    },
    rearTire: {
      wheelSize: "27.5\"",
      manufacturer: "Bontrager",
      model: "Barbegazi",
      width: "4.5\"",
      casing: "light",
      hasInsert: false,
      isTubeless: true,
    },
  },
  {
    id: "bike-commuter-6",
    brand: "Trek",
    model: "FX 3 Disc",
    year: "2024",
    frameSize: "L",
    discipline: "urban_commuter",
    suspensionLayout: "rigid",
    category: "urban_commuter",
    isEBike: false,
    forkModel: "FX Carbon Rigid Fork",
    forkTravel: 0,
    shockModel: "Rigid Frame",
    frontTire: {
      wheelSize: "700c",
      manufacturer: "Bontrager",
      model: "H2 Hard-Case Lite",
      width: "35mm",
      casing: "standard",
      hasInsert: false,
      isTubeless: false,
    },
    rearTire: {
      wheelSize: "700c",
      manufacturer: "Bontrager",
      model: "H2 Hard-Case Lite",
      width: "35mm",
      casing: "standard",
      hasInsert: false,
      isTubeless: false,
    },
  },
];

/**
 * LocalDataService
 * 
 * Implements IDataService using browser localStorage.
 * Maintains client-side persistence for offline MVP operation.
 */
export class LocalDataService implements IDataService {
  async getProfile(): Promise<RiderProfile> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          heightInches: parsed.heightInches ?? null,
        };
      }
      return DEFAULT_PROFILE;
    } catch (e) {
      console.warn("[LocalDataService] Failed to load profile from localStorage, using default:", e);
      return DEFAULT_PROFILE;
    }
  }

  async saveProfile(profile: RiderProfile): Promise<RiderProfile> {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error("[LocalDataService] Failed to write profile to localStorage:", e);
    }
    return profile;
  }

  async getBikes(): Promise<Bike[]> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIKES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeBike);
        }
      }
      // Seed default bikes on initial launch
      localStorage.setItem(STORAGE_KEYS.BIKES, JSON.stringify(DEFAULT_BIKES));
      return DEFAULT_BIKES;
    } catch (e) {
      console.warn("[LocalDataService] Failed to load bikes from localStorage, using defaults:", e);
      return DEFAULT_BIKES;
    }
  }

  async saveBikes(bikes: Bike[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.BIKES, JSON.stringify(bikes));
    } catch (e) {
      console.error("[LocalDataService] Failed to write bikes to localStorage:", e);
    }
  }

  async addBike(bikeData: Omit<Bike, "id">): Promise<Bike> {
    const bikes = await this.getBikes();
    const id = `bike-${Date.now()}`;
    const newBike: Bike = { ...bikeData, id };
    const updated = [newBike, ...bikes];
    await this.saveBikes(updated);
    await this.setActiveBikeId(id);
    return newBike;
  }

  async updateBike(id: string, updates: Partial<Bike>): Promise<Bike | null> {
    const bikes = await this.getBikes();
    let updatedBike: Bike | null = null;

    const nextBikes = bikes.map((b) => {
      if (b.id === id) {
        updatedBike = { ...b, ...updates };
        return updatedBike;
      }
      return b;
    });

    if (updatedBike) {
      await this.saveBikes(nextBikes);
    }

    return updatedBike;
  }

  async deleteBike(id: string): Promise<boolean> {
    const bikes = await this.getBikes();
    const filtered = bikes.filter((b) => b.id !== id);
    if (filtered.length === bikes.length) return false;

    await this.saveBikes(filtered);

    // If deleting the active bike, point to the first remaining bike
    const activeId = await this.getActiveBikeId();
    if (activeId === id) {
      await this.setActiveBikeId(filtered[0]?.id || "");
    }

    return true;
  }

  async getActiveBikeId(): Promise<string> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_BIKE);
      const bikes = await this.getBikes();
      if (saved && bikes.some((b) => b.id === saved)) {
        return saved;
      }
      const fallbackId = bikes[0]?.id || "";
      if (fallbackId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_BIKE, fallbackId);
      }
      return fallbackId;
    } catch {
      return "";
    }
  }

  async setActiveBikeId(id: string): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BIKE, id);
    } catch (e) {
      console.error("[LocalDataService] Failed to set active bike ID:", e);
    }
  }
}
