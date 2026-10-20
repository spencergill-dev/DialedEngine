import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  getTireManufacturers as getPresetManufacturers,
  getTireModels as getPresetModels,
  getTireCasings as getPresetCasings,
  getTireCompounds as getPresetCompounds,
} from "@/data/tireCatalog";

interface BrandRecord {
  id: string | number;
  name: string;
}

interface ModelRecord {
  id: string | number;
  brand_id: string | number;
  name: string;
}

interface SpecRecord {
  id: string | number;
  model_id: string | number;
  casing?: string | null;
  compound?: string | null;
  width?: string | null;
}

// In-memory cache across component mounts
const globalBrandMap = new Map<string, string | number>(); // lower name -> id
let cachedBrandsList: string[] | null = null;
const cachedModelsByBrandId = new Map<string | number, ModelRecord[]>();
const cachedSpecsByModelId = new Map<string | number, SpecRecord[]>();

export function useDynamicTireCatalog(
  activeBrand?: string,
  activeModel?: string
) {
  const [brands, setBrands] = useState<string[]>(() => {
    if (cachedBrandsList && cachedBrandsList.length > 0) {
      return cachedBrandsList;
    }
    return getPresetManufacturers();
  });

  const [dbModels, setDbModels] = useState<ModelRecord[]>([]);
  const [dbSpecs, setDbSpecs] = useState<SpecRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch Brands on mount
  useEffect(() => {
    let isCancelled = false;

    async function fetchBrands() {
      if (!isSupabaseConfigured) return;

      try {
        const { data, error } = await supabase
          .from("tire_brands")
          .select("id, name")
          .order("name");

        if (error) {
          console.warn("[useDynamicTireCatalog] fetchBrands error:", error.message);
          return;
        }

        if (isCancelled || !Array.isArray(data) || data.length === 0) return;

        const dbBrandNames: string[] = [];
        data.forEach((b: BrandRecord) => {
          if (b.name) {
            dbBrandNames.push(b.name);
            globalBrandMap.set(b.name.trim().toLowerCase(), b.id);
          }
        });

        // Merge DB brands with presets, ensuring uniqueness
        const merged = Array.from(
          new Set([...dbBrandNames, ...getPresetManufacturers()])
        );
        cachedBrandsList = merged;
        setBrands(merged);
      } catch (err) {
        console.warn("[useDynamicTireCatalog] fetchBrands exception:", err);
      }
    }

    fetchBrands();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Fetch Models when activeBrand changes
  useEffect(() => {
    let isCancelled = false;
    const brandTrimmed = activeBrand?.trim().toLowerCase();

    if (!brandTrimmed || !isSupabaseConfigured) {
      setDbModels([]);
      return;
    }

    const brandId = globalBrandMap.get(brandTrimmed);
    if (!brandId) {
      setDbModels([]);
      return;
    }

    // Check memory cache first
    if (cachedModelsByBrandId.has(brandId)) {
      setDbModels(cachedModelsByBrandId.get(brandId)!);
      return;
    }

    async function fetchModels(id: string | number) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("tire_models")
          .select("id, brand_id, name")
          .eq("brand_id", id)
          .order("name");

        if (isCancelled) return;

        if (error) {
          console.warn("[useDynamicTireCatalog] fetchModels error:", error.message);
          return;
        }

        if (Array.isArray(data)) {
          cachedModelsByBrandId.set(id, data);
          setDbModels(data);
        }
      } catch (err) {
        console.warn("[useDynamicTireCatalog] fetchModels exception:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchModels(brandId);

    return () => {
      isCancelled = true;
    };
  }, [activeBrand]);

  // 3. Fetch Specs when activeModel changes
  useEffect(() => {
    let isCancelled = false;
    const modelTrimmed = activeModel?.trim().toLowerCase();

    if (!modelTrimmed || !isSupabaseConfigured) {
      setDbSpecs([]);
      return;
    }

    // Find model record from current dbModels or cached models
    let modelRecord: ModelRecord | undefined = dbModels.find(
      (m) => m.name.trim().toLowerCase() === modelTrimmed
    );

    if (!modelRecord) {
      for (const modelsList of cachedModelsByBrandId.values()) {
        const found = modelsList.find(
          (m) => m.name.trim().toLowerCase() === modelTrimmed
        );
        if (found) {
          modelRecord = found;
          break;
        }
      }
    }

    if (!modelRecord) {
      setDbSpecs([]);
      return;
    }

    const modelId = modelRecord.id;
    if (cachedSpecsByModelId.has(modelId)) {
      setDbSpecs(cachedSpecsByModelId.get(modelId)!);
      return;
    }

    async function fetchSpecs(id: string | number) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("tire_specs")
          .select("id, model_id, casing, compound, width")
          .eq("model_id", id);

        if (isCancelled) return;

        if (error) {
          console.warn("[useDynamicTireCatalog] fetchSpecs error:", error.message);
          return;
        }

        if (Array.isArray(data)) {
          cachedSpecsByModelId.set(id, data);
          setDbSpecs(data);
        }
      } catch (err) {
        console.warn("[useDynamicTireCatalog] fetchSpecs exception:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchSpecs(modelId);

    return () => {
      isCancelled = true;
    };
  }, [activeModel, dbModels]);

  // Helper: compute dependent models for any given brand
  const getModelsForBrand = useCallback(
    (brand?: string): string[] => {
      const presetModels = getPresetModels(brand);
      if (!brand) return presetModels;

      const brandId = globalBrandMap.get(brand.trim().toLowerCase());
      if (brandId && cachedModelsByBrandId.has(brandId)) {
        const dbNames = cachedModelsByBrandId.get(brandId)!.map((m) => m.name);
        return Array.from(new Set([...dbNames, ...presetModels]));
      }

      // If activeBrand matches the requested brand and we have live dbModels
      if (
        activeBrand &&
        activeBrand.trim().toLowerCase() === brand.trim().toLowerCase() &&
        dbModels.length > 0
      ) {
        const dbNames = dbModels.map((m) => m.name);
        return Array.from(new Set([...dbNames, ...presetModels]));
      }

      return presetModels;
    },
    [activeBrand, dbModels]
  );

  // Helper: compute dependent casings for any brand + model
  const getCasingsForModel = useCallback(
    (brand?: string, model?: string): string[] => {
      const presetCasings = getPresetCasings(brand, model);
      if (!model) return presetCasings;

      const modelTrimmed = model.trim().toLowerCase();
      let matchedSpecs: SpecRecord[] | undefined;

      // Check current dbSpecs if activeModel matches
      if (
        activeModel &&
        activeModel.trim().toLowerCase() === modelTrimmed &&
        dbSpecs.length > 0
      ) {
        matchedSpecs = dbSpecs;
      } else {
        // Look up in cache
        for (const [mId, specs] of cachedSpecsByModelId.entries()) {
          for (const mList of cachedModelsByBrandId.values()) {
            if (
              mList.some(
                (m) => m.id === mId && m.name.trim().toLowerCase() === modelTrimmed
              )
            ) {
              matchedSpecs = specs;
              break;
            }
          }
          if (matchedSpecs) break;
        }
      }

      if (matchedSpecs && matchedSpecs.length > 0) {
        const dbCasings = matchedSpecs
          .map((s) => s.casing?.trim())
          .filter((c): c is string => Boolean(c));
        if (dbCasings.length > 0) {
          return Array.from(new Set([...dbCasings, ...presetCasings]));
        }
      }

      return presetCasings;
    },
    [activeModel, dbSpecs]
  );

  // Helper: compute dependent compounds for any brand + model
  const getCompoundsForModel = useCallback(
    (brand?: string, model?: string): string[] => {
      const presetCompounds = getPresetCompounds(brand, model);
      if (!model) return presetCompounds;

      const modelTrimmed = model.trim().toLowerCase();
      let matchedSpecs: SpecRecord[] | undefined;

      if (
        activeModel &&
        activeModel.trim().toLowerCase() === modelTrimmed &&
        dbSpecs.length > 0
      ) {
        matchedSpecs = dbSpecs;
      } else {
        for (const [mId, specs] of cachedSpecsByModelId.entries()) {
          for (const mList of cachedModelsByBrandId.values()) {
            if (
              mList.some(
                (m) => m.id === mId && m.name.trim().toLowerCase() === modelTrimmed
              )
            ) {
              matchedSpecs = specs;
              break;
            }
          }
          if (matchedSpecs) break;
        }
      }

      if (matchedSpecs && matchedSpecs.length > 0) {
        const dbCompounds = matchedSpecs
          .map((s) => s.compound?.trim())
          .filter((c): c is string => Boolean(c));
        if (dbCompounds.length > 0) {
          return Array.from(new Set([...dbCompounds, ...presetCompounds]));
        }
      }

      return presetCompounds;
    },
    [activeModel, dbSpecs]
  );

  // Helper: compute dependent widths for any brand + model
  const getWidthsForModel = useCallback(
    (_brand?: string, model?: string, defaultWidths: string[] = []): string[] => {
      if (!model) return defaultWidths;

      const modelTrimmed = model.trim().toLowerCase();
      let matchedSpecs: SpecRecord[] | undefined;

      if (
        activeModel &&
        activeModel.trim().toLowerCase() === modelTrimmed &&
        dbSpecs.length > 0
      ) {
        matchedSpecs = dbSpecs;
      } else {
        for (const [mId, specs] of cachedSpecsByModelId.entries()) {
          for (const mList of cachedModelsByBrandId.values()) {
            if (
              mList.some(
                (m) => m.id === mId && m.name.trim().toLowerCase() === modelTrimmed
              )
            ) {
              matchedSpecs = specs;
              break;
            }
          }
          if (matchedSpecs) break;
        }
      }

      if (matchedSpecs && matchedSpecs.length > 0) {
        const dbWidths = matchedSpecs
          .map((s) => s.width?.trim())
          .filter((w): w is string => Boolean(w));
        if (dbWidths.length > 0) {
          return Array.from(new Set([...dbWidths, ...defaultWidths]));
        }
      }

      return defaultWidths;
    },
    [activeModel, dbSpecs]
  );

  return {
    brands,
    getModelsForBrand,
    getCasingsForModel,
    getCompoundsForModel,
    getWidthsForModel,
    isLoading,
  };
}
