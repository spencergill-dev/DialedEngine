import { useState, useEffect } from "react";
import type { Bike, RiderProfile } from "@/types/mountainBike";

const INITIAL_PROFILE: RiderProfile = {
  baseWeight: 165,
  gearWeight: 10,
};

const DEFAULT_BIKES: Bike[] = [
  {
    id: "bike-1",
    name: "Santa Cruz Megatower CC",
    isEBike: false,
    suspensionType: "Full Suspension",
    forkModel: "Fox 38 Factory Grip2",
    forkTravel: 170,
    shockModel: "Fox Float X2 Factory",
    frontTire: {
      manufacturer: "Maxxis",
      model: "Assegai",
      width: "2.5 WT",
      casing: "standard",
      hasInsert: false,
    },
    rearTire: {
      manufacturer: "Maxxis",
      model: "Minion DHR II",
      width: "2.4 WT",
      casing: "heavy",
      hasInsert: false,
    },
  },
  {
    id: "bike-2",
    name: "Specialized Turbo Levo Pro",
    isEBike: true,
    suspensionType: "Full Suspension",
    forkModel: "Fox 38 Float Factory E-MTB",
    forkTravel: 160,
    shockModel: "Fox Float X2 Factory",
    frontTire: {
      manufacturer: "Specialized",
      model: "Butcher Grid Trail",
      width: "2.6",
      casing: "standard",
      hasInsert: false,
    },
    rearTire: {
      manufacturer: "Specialized",
      model: "Eliminator Grid Gravity",
      width: "2.6",
      casing: "heavy",
      hasInsert: false,
    },
  },
  {
    id: "bike-3",
    name: "Trek Top Fuel 9.8",
    isEBike: false,
    suspensionType: "Full Suspension",
    forkModel: "RockShox Pike Ultimate",
    forkTravel: 130,
    shockModel: "RockShox Deluxe Ultimate",
    frontTire: {
      manufacturer: "Bontrager",
      model: "XR4 Team Issue",
      width: "2.4",
      casing: "light",
      hasInsert: false,
    },
    rearTire: {
      manufacturer: "Bontrager",
      model: "XR4 Team Issue",
      width: "2.4",
      casing: "light",
      hasInsert: false,
    },
  },
];

const STORAGE_KEYS = {
  PROFILE: "dialed_rider_profile_v2",
  BIKES: "dialed_garage_bikes_v2",
  ACTIVE_BIKE: "dialed_active_bike_id_v2",
};

export function useGarageState() {
  const [profile, setProfile] = useState<RiderProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [bikes, setBikes] = useState<Bike[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIKES);
      return saved ? JSON.parse(saved) : DEFAULT_BIKES;
    } catch {
      return DEFAULT_BIKES;
    }
  });

  const [activeBikeId, setActiveBikeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_BIKE);
      if (saved && bikes.some((b) => b.id === saved)) return saved;
      return bikes[0]?.id || "";
    } catch {
      return bikes[0]?.id || "";
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore storage error
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BIKES, JSON.stringify(bikes));
    } catch {
      // ignore
    }
  }, [bikes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BIKE, activeBikeId);
    } catch {
      // ignore
    }
  }, [activeBikeId]);

  const activeBike = bikes.find((b) => b.id === activeBikeId) || bikes[0];

  const updateProfile = (partial: Partial<RiderProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  };

  const addBike = (newBike: Omit<Bike, "id">) => {
    const id = `bike-${Date.now()}`;
    const bikeWithId: Bike = { ...newBike, id };
    setBikes((prev) => [bikeWithId, ...prev]);
    setActiveBikeId(id);
  };

  const updateBike = (id: string, updated: Partial<Bike>) => {
    setBikes((prev) =>
      prev.map((bike) => (bike.id === id ? { ...bike, ...updated } : bike))
    );
  };

  const deleteBike = (id: string) => {
    setBikes((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      if (activeBikeId === id) {
        setActiveBikeId(filtered[0]?.id || "");
      }
      return filtered;
    });
  };

  return {
    profile,
    updateProfile,
    bikes,
    activeBikeId,
    setActiveBikeId,
    activeBike,
    addBike,
    updateBike,
    deleteBike,
  };
}
