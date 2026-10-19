import { useState, useEffect } from "react";
import type {
  Bike,
  RiderProfile,
  BikeDiscipline,
  SuspensionLayout,
  WheelSize,
} from "@/types/cycling";
import { dataService, DEFAULT_PROFILE, DEFAULT_BIKES, STORAGE_KEYS } from "@/services";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { toast } from "sonner";

export { DEFAULT_PROFILE, DEFAULT_BIKES };

function mapDbRowToBike(row: any): Bike {
  const discipline: BikeDiscipline =
    (row.discipline?.toLowerCase() as BikeDiscipline) || "mountain";
  const suspensionLayout: SuspensionLayout =
    (row.suspension_layout?.toLowerCase() as SuspensionLayout) ||
    (discipline === "mountain" ? "full_suspension" : "rigid");

  const rawWheel = row.wheel_size || '29"';
  const wheelSize: WheelSize =
    rawWheel === "700c" ||
    rawWheel === "650b" ||
    rawWheel === '27.5"' ||
    rawWheel === '26"'
      ? rawWheel
      : '29"';

  const defaultFrontWidth =
    wheelSize === "700c" || wheelSize === "650b" ? "40mm" : '2.5" WT';
  const defaultRearWidth =
    wheelSize === "700c" || wheelSize === "650b" ? "40mm" : '2.4" WT';

  return {
    id: row.id,
    brand: row.brand || "Custom",
    model: row.model || "Custom Build",
    year: "2024",
    frameSize: "L",
    discipline,
    suspensionLayout,
    isEBike: false,
    forkModel:
      suspensionLayout === "rigid" ? "Rigid Fork" : "Fox 38 Factory Grip2",
    forkTravel: suspensionLayout === "rigid" ? 0 : 160,
    shockModel:
      suspensionLayout === "full_suspension"
        ? "Fox Float X2 Factory"
        : "Rigid Frame",
    frontTire: {
      wheelSize,
      manufacturer: "Maxxis",
      model: "Assegai",
      width: row.front_tire_width || defaultFrontWidth,
      casing: "standard",
      hasInsert: false,
      isTubeless: true,
    },
    rearTire: {
      wheelSize,
      manufacturer: "Maxxis",
      model: "Minion DHR II",
      width: row.rear_tire_width || defaultRearWidth,
      casing: "heavy",
      hasInsert: true,
      isTubeless: true,
    },
  };
}

/**
 * useCyclingState Hook
 * 
 * Manages reactive application state for rider metrics, bike fleet, and active setup.
 * Supports transparent synchronization with Supabase user_bikes and profiles tables.
 */
export function useCyclingState(userId?: string | null) {
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

  // Re-sync with local DataService on mount
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

  // Sync with Supabase cloud database when authenticated user is present
  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;
    let isCancelled = false;

    async function syncCloudFleet() {
      try {
        // Ensure profile row exists in profiles table
        await supabase
          .from("profiles")
          .upsert(
            {
              id: userId!,
              first_name: profile.displayName || "Rider",
              weight_lbs: profile.weight || 175,
            },
            { onConflict: "id" }
          );

        // Fetch cloud bikes for this user
        const { data: cloudBikes, error } = await supabase
          .from("user_bikes")
          .select("*")
          .eq("profile_id", userId!)
          .order("created_at", { ascending: false });

        if (isCancelled) return;

        if (error) {
          console.warn("[useCyclingState] Error querying user_bikes:", error);
          return;
        }

        if (cloudBikes && cloudBikes.length > 0) {
          const mapped = cloudBikes.map(mapDbRowToBike);
          setBikes(mapped);
          setActiveBikeId((prev) =>
            mapped.some((b) => b.id === prev) ? prev : mapped[0].id
          );
        }
      } catch (err) {
        console.warn("[useCyclingState] Cloud fleet sync exception:", err);
      }
    }

    syncCloudFleet();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

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

      // Sync to Supabase profiles table if authenticated
      if (userId && isSupabaseConfigured) {
        supabase
          .from("profiles")
          .upsert(
            {
              id: userId,
              first_name: updated.displayName,
              weight_lbs: updated.weight,
            },
            { onConflict: "id" }
          )
          .then(({ error }: { error: any }) => {
            if (error) console.error("[useCyclingState] Error syncing profile:", error);
          });
      }

      // Delegate persistence to abstracted dataService
      dataService.saveProfile(updated).catch(console.error);
      return updated;
    });
  };

  const addBike = async (newBike: Omit<Bike, "id">) => {
    let assignedId = `bike-${Date.now()}`;

    // Insert record into Supabase user_bikes linked to user ID
    if (userId && isSupabaseConfigured) {
      try {
        const brandStr =
          newBike.brand === "Custom"
            ? newBike.customBrand || "Custom"
            : newBike.brand;
        const customName = `${brandStr} ${newBike.model}`.trim();

        // Guarantee profile row exists before insert to satisfy foreign key
        await supabase
          .from("profiles")
          .upsert(
            {
              id: userId,
              first_name: profile.displayName || "Rider",
              weight_lbs: profile.weight || 175,
            },
            { onConflict: "id" }
          );

        const { data, error } = await supabase
          .from("user_bikes")
          .insert({
            profile_id: userId,
            custom_name: customName,
            brand: brandStr,
            model: newBike.model,
            discipline: newBike.discipline,
            suspension_layout: newBike.suspensionLayout,
            wheel_size: newBike.frontTire?.wheelSize || '29"',
            front_tire_width: newBike.frontTire?.width || '2.4"',
            rear_tire_width: newBike.rearTire?.width || '2.4"',
          })
          .select()
          .single();

        if (error) {
          console.error("[useCyclingState] Error inserting to user_bikes:", error);
          toast.error(`Database error: ${error.message}`);
        } else if (data?.id) {
          assignedId = data.id;
          toast.success("Bike saved to cloud fleet!", {
            description: `${customName} linked to your Supabase account.`,
          });
        }
      } catch (err: any) {
        console.error("[useCyclingState] Cloud insert exception:", err);
      }
    }

    const bikeWithId: Bike = { ...newBike, id: assignedId };
    setBikes((prev) => [bikeWithId, ...prev]);
    setActiveBikeId(assignedId);
    dataService.addBike(bikeWithId).catch(console.error);
    return bikeWithId;
  };

  const updateBike = async (id: string, updated: Partial<Bike>) => {
    setBikes((prev) =>
      prev.map((bike) => (bike.id === id ? { ...bike, ...updated } : bike))
    );

    if (userId && isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (updated.brand !== undefined) {
          payload.brand =
            updated.brand === "Custom"
              ? updated.customBrand || "Custom"
              : updated.brand;
        }
        if (updated.model !== undefined) payload.model = updated.model;
        if (updated.discipline !== undefined) payload.discipline = updated.discipline;
        if (updated.suspensionLayout !== undefined)
          payload.suspension_layout = updated.suspensionLayout;
        if (updated.frontTire?.wheelSize)
          payload.wheel_size = updated.frontTire.wheelSize;
        if (updated.frontTire?.width)
          payload.front_tire_width = updated.frontTire.width;
        if (updated.rearTire?.width)
          payload.rear_tire_width = updated.rearTire.width;
        if (payload.brand || payload.model) {
          payload.custom_name = `${payload.brand || ""} ${payload.model || ""}`.trim();
        }

        await supabase
          .from("user_bikes")
          .update(payload)
          .eq("id", id)
          .eq("profile_id", userId);
      } catch (err) {
        console.error("[useCyclingState] Error updating user_bikes:", err);
      }
    }

    dataService.updateBike(id, updated).catch(console.error);
  };

  const deleteBike = async (id: string) => {
    setBikes((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      if (activeBikeId === id) {
        const nextId = filtered[0]?.id || "";
        setActiveBikeId(nextId);
        dataService.setActiveBikeId(nextId).catch(console.error);
      }
      return filtered;
    });

    if (userId && isSupabaseConfigured) {
      try {
        await supabase
          .from("user_bikes")
          .delete()
          .eq("id", id)
          .eq("profile_id", userId);
      } catch (err) {
        console.error("[useCyclingState] Error deleting from user_bikes:", err);
      }
    }

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
