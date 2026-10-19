import { useState, useEffect } from "react";
import type {
  Bike,
  RiderProfile,
  BikeDiscipline,
  SuspensionLayout,
  WheelSize,
  RidingStyle,
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
    rearShockStroke: row.rear_shock_stroke != null ? Number(row.rear_shock_stroke) : null,
    rearWheelTravel: row.rear_wheel_travel != null ? Number(row.rear_wheel_travel) : null,
    frontTire: {
      wheelSize,
      manufacturer: row.front_tire_manufacturer || "Maxxis",
      model: row.front_tire_model || "Assegai",
      width: row.front_tire_width || defaultFrontWidth,
      casing: (row.front_tire_casing as any) || "standard",
      compound: row.front_tire_compound || null,
      hasInsert: false,
      isTubeless: true,
    },
    rearTire: {
      wheelSize,
      manufacturer: row.rear_tire_manufacturer || "Maxxis",
      model: row.rear_tire_model || "Minion DHR II",
      width: row.rear_tire_width || defaultRearWidth,
      casing: (row.rear_tire_casing as any) || "heavy",
      compound: row.rear_tire_compound || null,
      hasInsert: true,
      isTubeless: true,
    },
  };
}

/**
 * useCyclingState Hook
 * 
 * Manages reactive application state for rider metrics, bike fleet, and active setup.
 * Strictly isolates cloud user data by authenticated profile_id with zero mock fallback.
 */
export function useCyclingState(
  userId?: string | null,
  userMetadata?: Record<string, any> | null
) {
  // Synchronous initial hydrate from scoped localStorage
  const [profile, setProfile] = useState<RiderProfile>(() => {
    if (userId) {
      try {
        const saved = localStorage.getItem(`dialed_profile_${userId}`);
        if (saved) return JSON.parse(saved);
      } catch {}
      return {
        displayName: userMetadata?.first_name || userMetadata?.name || "",
        weight: null,
        heightInches: null,
        height: "",
        ridingStyle: "neutral",
      };
    }
    // Guest fallback
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
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [bikes, setBikes] = useState<Bike[]>(() => {
    if (userId) {
      try {
        const saved = localStorage.getItem(`dialed_bikes_${userId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
      // Authenticated users start with empty fleet until verified from DB - NEVER default mock bikes!
      return [];
    }
    // Guest fallback
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIKES);
      return saved ? JSON.parse(saved) : DEFAULT_BIKES;
    } catch {
      return DEFAULT_BIKES;
    }
  });

  const [activeBikeId, setActiveBikeId] = useState<string>(() => {
    if (userId) {
      try {
        return localStorage.getItem(`dialed_active_bike_${userId}`) || "";
      } catch {
        return "";
      }
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_BIKE);
      if (saved && bikes.some((b) => b.id === saved)) return saved;
      return bikes[0]?.id || "";
    } catch {
      return bikes[0]?.id || "";
    }
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    if (!userId) return true; // Guests bypass onboarding
    try {
      return localStorage.getItem(`dialed_onboarded_${userId}`) === "true";
    } catch {
      return false;
    }
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(Boolean(userId));

  // Handle session transitions & cloud synchronization strictly isolated per user
  useEffect(() => {
    let isCancelled = false;

    if (!userId) {
      // Guest mode
      setIsSyncing(false);
      setHasCompletedOnboarding(true);
      try {
        const savedBikes = localStorage.getItem(STORAGE_KEYS.BIKES);
        const guestBikes = savedBikes ? JSON.parse(savedBikes) : DEFAULT_BIKES;
        setBikes(guestBikes);
        setActiveBikeId(guestBikes[0]?.id || "");
      } catch {
        setBikes(DEFAULT_BIKES);
        setActiveBikeId(DEFAULT_BIKES[0]?.id || "");
      }
      return;
    }

    if (!isSupabaseConfigured) {
      setIsSyncing(false);
      return;
    }

    // Authenticated session: query Supabase as source of truth
    setIsSyncing(true);

    async function syncUserData() {
      try {
        // Eliminate N+1 queries: Single-query resource embedding fetching profile and fleet in 1 network trip
        let profileRow: any = null;
        let cloudBikes: any[] = [];

        const { data: embeddedData, error: embeddedErr } = await supabase
          .from("profiles")
          .select("*, user_bikes(*)")
          .eq("id", userId!)
          .maybeSingle();

        if (isCancelled) return;

        if (!embeddedErr && embeddedData) {
          profileRow = embeddedData;
          cloudBikes = Array.isArray(embeddedData.user_bikes) ? embeddedData.user_bikes : [];
          // Sort fleet by created_at descending
          cloudBikes.sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
        } else {
          if (embeddedErr) {
            console.warn("[useCyclingState] Resource embedding error, running fallback:", embeddedErr);
          }
          // Concurrent fallback if profile row does not exist yet (brand new signup)
          const [profileResult, bikesResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("*")
              .eq("id", userId!)
              .maybeSingle(),
            supabase
              .from("user_bikes")
              .select("*")
              .eq("profile_id", userId!)
              .order("created_at", { ascending: false }),
          ]);

          if (isCancelled) return;
          profileRow = profileResult.data;
          cloudBikes = bikesResult.data || [];
        }

        if (profileRow && profileRow.weight_lbs) {
          const riderName = profileRow.first_name || "";
          const riderWeight = Number(profileRow.weight_lbs);
          const riderHeightInches = profileRow.height_inches ? Number(profileRow.height_inches) : null;
          const riderStyle = profileRow.riding_style || "neutral";
          let heightDisplay = "";
          if (riderHeightInches) {
            const ft = Math.floor(riderHeightInches / 12);
            const inches = riderHeightInches % 12;
            heightDisplay = `${ft}' ${inches}" (${Math.round(riderHeightInches * 2.54)} cm)`;
          }

          const loadedProfile: RiderProfile = {
            displayName: riderName,
            weight: riderWeight,
            heightInches: riderHeightInches,
            height: heightDisplay,
            ridingStyle: riderStyle,
          };
          setProfile(loadedProfile);
          setHasCompletedOnboarding(true);
          try {
            localStorage.setItem(`dialed_profile_${userId}`, JSON.stringify(loadedProfile));
            localStorage.setItem(`dialed_onboarded_${userId}`, "true");
          } catch {}
        } else {
          // Check if auth user has metadata from sign-up (zero-network lookup from AuthContext)
          if (userMetadata?.first_name || userMetadata?.name) {
            setProfile((prev) => ({
              ...prev,
              displayName: userMetadata.first_name || userMetadata.name,
            }));
          }
          // Brand new user with no saved weight requires onboarding
          setHasCompletedOnboarding(false);
        }

        // Strictly set bikes to whatever the database returned (could be empty array)
        // NEVER fall back to DEFAULT_BIKES or mock arrays for authenticated accounts!
        const mapped = (cloudBikes || []).map(mapDbRowToBike);
        setBikes(mapped);

        if (mapped.length > 0) {
          setActiveBikeId((prev) =>
            mapped.some((b) => b.id === prev) ? prev : mapped[0].id
          );
        } else {
          setActiveBikeId("");
        }

        try {
          localStorage.setItem(`dialed_bikes_${userId}`, JSON.stringify(mapped));
          localStorage.setItem(
            `dialed_active_bike_${userId}`,
            mapped[0]?.id || ""
          );
        } catch {}
      } catch (err) {
        console.error("[useCyclingState] Cloud fleet sync exception:", err);
      } finally {
        if (!isCancelled) {
          setIsSyncing(false);
        }
      }
    }

    syncUserData();

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

        try {
          localStorage.setItem(`dialed_profile_${userId}`, JSON.stringify(updated));
        } catch {}
      } else {
        dataService.saveProfile(updated).catch(console.error);
      }

      return updated;
    });
  };

  const completeOnboarding = async (profileData: {
    displayName: string;
    weight: number;
    ridingStyle: RidingStyle;
    heightInches?: number | null;
  }) => {
    const heightInches = profileData.heightInches ?? null;
    let heightDisplay = "";
    if (heightInches) {
      const ft = Math.floor(heightInches / 12);
      const inches = heightInches % 12;
      const cm = Math.round(heightInches * 2.54);
      heightDisplay = `${ft}' ${inches}" (${cm} cm)`;
    }

    const updatedProfile: RiderProfile = {
      displayName: profileData.displayName,
      weight: profileData.weight,
      heightInches,
      height: heightDisplay,
      ridingStyle: profileData.ridingStyle,
    };

    setProfile(updatedProfile);
    setHasCompletedOnboarding(true);

    if (userId && isSupabaseConfigured) {
      try {
        await supabase.from("profiles").upsert(
          {
            id: userId,
            first_name: profileData.displayName,
            weight_lbs: profileData.weight,
          },
          { onConflict: "id" }
        );

        // Also update auth user metadata for convenience
        await supabase.auth.updateUser({
          data: {
            first_name: profileData.displayName,
            weight_lbs: profileData.weight,
            riding_style: profileData.ridingStyle,
            height_inches: heightInches,
          },
        });

        localStorage.setItem(`dialed_profile_${userId}`, JSON.stringify(updatedProfile));
        localStorage.setItem(`dialed_onboarded_${userId}`, "true");
      } catch (e) {
        console.error("[useCyclingState] Failed to persist profile during onboarding:", e);
      }
    }
  };

  const addBike = async (newBike: Omit<Bike, "id">) => {
    let assignedId = `bike-${Date.now()}`;
    const brandStr =
      newBike.brand === "Custom"
        ? newBike.customBrand || "Custom"
        : newBike.brand;
    const customName = `${brandStr} ${newBike.model}`.trim();

    // Insert record into Supabase user_bikes linked to user ID
    if (userId && isSupabaseConfigured) {
      try {
        // Guarantee profile row exists before insert to satisfy foreign key
        await supabase
          .from("profiles")
          .upsert(
            {
              id: userId,
              first_name: profile.displayName || "Rider",
              weight_lbs: profile.weight ?? null,
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
            rear_shock_stroke: newBike.rearShockStroke ?? null,
            rear_wheel_travel: newBike.rearWheelTravel ?? null,
            front_tire_manufacturer: newBike.frontTire?.manufacturer || null,
            front_tire_model: newBike.frontTire?.model || null,
            front_tire_casing: newBike.frontTire?.casing || null,
            front_tire_compound: newBike.frontTire?.compound || null,
            front_tire_width: newBike.frontTire?.width || '2.4"',
            rear_tire_manufacturer: newBike.rearTire?.manufacturer || null,
            rear_tire_model: newBike.rearTire?.model || null,
            rear_tire_casing: newBike.rearTire?.casing || null,
            rear_tire_compound: newBike.rearTire?.compound || null,
            rear_tire_width: newBike.rearTire?.width || '2.4"',
          })
          .select()
          .single();

        if (error) {
          console.error("[useCyclingState] Error inserting to user_bikes:", error);
          toast.error(`Database error: ${error.message}`);
        } else if (data?.id) {
          assignedId = data.id;
          toast.success("Bike added to your garage!", {
            description: `${customName} linked to your Supabase fleet.`,
          });
        }
      } catch (err: any) {
        console.error("[useCyclingState] Cloud insert exception:", err);
      }
    } else {
      toast.success("Bike added to your garage!", {
        description: `${customName} is ready to calibrate.`,
      });
    }

    const bikeWithId: Bike = { ...newBike, id: assignedId };
    setBikes((prev) => {
      const next = [bikeWithId, ...prev];
      if (userId) {
        try {
          localStorage.setItem(`dialed_bikes_${userId}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
    setActiveBikeId(assignedId);

    if (userId) {
      try {
        localStorage.setItem(`dialed_active_bike_${userId}`, assignedId);
      } catch {}
    } else {
      dataService.addBike(bikeWithId).catch(console.error);
    }

    return bikeWithId;
  };

  const updateBike = async (id: string, updated: Partial<Bike>) => {
    setBikes((prev) => {
      const next = prev.map((bike) =>
        bike.id === id ? { ...bike, ...updated } : bike
      );
      if (userId) {
        try {
          localStorage.setItem(`dialed_bikes_${userId}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });

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
        if (updated.rearShockStroke !== undefined)
          payload.rear_shock_stroke = updated.rearShockStroke;
        if (updated.rearWheelTravel !== undefined)
          payload.rear_wheel_travel = updated.rearWheelTravel;
        if (updated.frontTire?.manufacturer !== undefined)
          payload.front_tire_manufacturer = updated.frontTire.manufacturer;
        if (updated.frontTire?.model !== undefined)
          payload.front_tire_model = updated.frontTire.model;
        if (updated.frontTire?.casing !== undefined)
          payload.front_tire_casing = updated.frontTire.casing;
        if (updated.frontTire?.compound !== undefined)
          payload.front_tire_compound = updated.frontTire.compound;
        if (updated.rearTire?.manufacturer !== undefined)
          payload.rear_tire_manufacturer = updated.rearTire.manufacturer;
        if (updated.rearTire?.model !== undefined)
          payload.rear_tire_model = updated.rearTire.model;
        if (updated.rearTire?.casing !== undefined)
          payload.rear_tire_casing = updated.rearTire.casing;
        if (updated.rearTire?.compound !== undefined)
          payload.rear_tire_compound = updated.rearTire.compound;
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
    } else {
      dataService.updateBike(id, updated).catch(console.error);
    }
  };

  const deleteBike = async (id: string) => {
    setBikes((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      if (activeBikeId === id) {
        const nextId = filtered[0]?.id || "";
        setActiveBikeId(nextId);
        if (userId) {
          try {
            localStorage.setItem(`dialed_active_bike_${userId}`, nextId);
          } catch {}
        } else {
          dataService.setActiveBikeId(nextId).catch(console.error);
        }
      }
      if (userId) {
        try {
          localStorage.setItem(`dialed_bikes_${userId}`, JSON.stringify(filtered));
        } catch {}
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
    } else {
      dataService.deleteBike(id).catch(console.error);
    }
  };

  const handleSetActiveBikeId = (id: string) => {
    setActiveBikeId(id);
    if (userId) {
      try {
        localStorage.setItem(`dialed_active_bike_${userId}`, id);
      } catch {}
    } else {
      dataService.setActiveBikeId(id).catch(console.error);
    }
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
    hasCompletedOnboarding,
    completeOnboarding,
    isSyncing,
  };
}
