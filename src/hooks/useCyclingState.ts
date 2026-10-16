import { useState, useEffect } from "react";
import type { Bike, RiderProfile } from "@/types/cycling";
import { dataService, DEFAULT_PROFILE, DEFAULT_BIKES, STORAGE_KEYS } from "@/services";

export { DEFAULT_PROFILE, DEFAULT_BIKES };

/**
 * useCyclingState Hook
 * 
 * Manages reactive application state for rider metrics, bike fleet, and active setup.
 * All persistence is delegated to IDataService (LocalDataService today, SupabaseDataService tomorrow).
 */
export function useCyclingState() {
  // Synchronous initial hydrate from localStorage to prevent any render flickers
  const [profile, setProfile] = useState<RiderProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          heightInches: parsed.heightInches || 71,
        };
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
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

  // Re-sync with IDataService to handle asynchronous cloud loading
  useEffect(() => {
    let isMounted = true;

    async function syncDataLayer() {
      try {
        const [loadedProfile, loadedBikes, loadedActiveId] = await Promise.all([
          dataService.getProfile(),
          dataService.getBikes(),
          dataService.getActiveBikeId(),
        ]);

        if (isMounted) {
          if (loadedProfile) setProfile(loadedProfile);
          if (loadedBikes && loadedBikes.length > 0) setBikes(loadedBikes);
          if (loadedActiveId) setActiveBikeId(loadedActiveId);
        }
      } catch (err) {
        console.warn("[useCyclingState] DataService sync note:", err);
      }
    }

    syncDataLayer();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeBike = bikes.find((b) => b.id === activeBikeId) || bikes[0];

  const updateProfile = (partial: Partial<RiderProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...partial };
      if (partial.heightInches) {
        const ft = Math.floor(partial.heightInches / 12);
        const inches = partial.heightInches % 12;
        const cm = Math.round(partial.heightInches * 2.54);
        updated.height = `${ft}' ${inches}" (${cm} cm)`;
      }
      // Delegate persistence to abstracted dataService
      dataService.saveProfile(updated).catch(console.error);
      return updated;
    });
  };

  const addBike = (newBike: Omit<Bike, "id">) => {
    const id = `bike-${Date.now()}`;
    const bikeWithId: Bike = { ...newBike, id };
    setBikes((prev) => [bikeWithId, ...prev]);
    setActiveBikeId(id);
    dataService.addBike(newBike).catch(console.error);
  };

  const updateBike = (id: string, updated: Partial<Bike>) => {
    setBikes((prev) =>
      prev.map((bike) => (bike.id === id ? { ...bike, ...updated } : bike))
    );
    dataService.updateBike(id, updated).catch(console.error);
  };

  const deleteBike = (id: string) => {
    setBikes((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      if (activeBikeId === id) {
        const nextId = filtered[0]?.id || "";
        setActiveBikeId(nextId);
        dataService.setActiveBikeId(nextId).catch(console.error);
      }
      return filtered;
    });
    dataService.deleteBike(id).catch(console.error);
  };

  const handleSetActiveBikeId = (id: string) => {
    setActiveBikeId(id);
    dataService.setActiveBikeId(id).catch(console.error);
  };

  return {
    profile,
    updateProfile,
    bikes,
    activeBikeId,
    setActiveBikeId: handleSetActiveBikeId,
    activeBike,
    addBike,
    updateBike,
    deleteBike,
  };
}
