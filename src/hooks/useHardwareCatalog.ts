import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { POPULAR_FORKS, POPULAR_SHOCKS } from "@/data/suspensionPresets";

export const DEFAULT_BRANDS: string[] = [
  "Santa Cruz",
  "Specialized",
  "Trek",
  "Canyon",
  "Giant",
  "Yeti",
  "Cannondale",
  "Cervelo",
  "Pivot",
  "Orbea",
  "Transition",
  "Ibis",
  "Kona",
  "Norco",
  "Marin",
  "Scott",
  "Commencal",
  "Rocky Mountain",
  "Evil",
  "Bianchi",
  "Pinarello",
  "Colnago",
];

export const DEFAULT_MODELS_BY_BRAND: Record<string, string[]> = {
  "santa cruz": [
    "Megatower",
    "Nomad",
    "Hightower",
    "Bronson",
    "5010",
    "Tallboy",
    "Blur",
    "Stigmata",
    "V10",
    "Bullit",
    "Heckler",
  ],
  specialized: [
    "Stumpjumper",
    "Stumpjumper EVO",
    "Enduro",
    "Epic",
    "Epic EVO",
    "Status",
    "Demo",
    "Turbo Levo",
    "Turbo Kenevo",
    "Diverge",
    "Crux",
    "Tarmac SL8",
    "Roubaix",
    "Aethos",
  ],
  trek: [
    "Slash",
    "Fuel EX",
    "Top Fuel",
    "Supercaliber",
    "Session",
    "Rail",
    "Checkpoint",
    "Boone",
    "Madone",
    "Domane",
    "Emonda",
  ],
  yeti: ["SB160", "SB140", "SB120", "SB135", "160E", "ARC"],
  pivot: [
    "Firebird",
    "Switchblade",
    "Trail 429",
    "Mach 6",
    "Shadowcat",
    "Vault",
    "Shuttle",
  ],
  canyon: [
    "Strive",
    "Spectral",
    "Torque",
    "Neuron",
    "Lux",
    "Sender",
    "Grizl",
    "Grail",
    "Aeroad",
    "Ultimate",
    "Endurace",
  ],
  giant: [
    "Reign",
    "Trance X",
    "Trance",
    "Anthem",
    "Glory",
    "Defy",
    "TCR",
    "Propel",
    "Revolt",
  ],
  cannondale: [
    "Jekyll",
    "Habit",
    "Scalpel",
    "Topstone",
    "SuperSix EVO",
    "Synapse",
  ],
  orbea: ["Rallon", "Occam", "Oiz", "Wild", "Rise", "Terra", "Orca"],
  cervelo: ["Aspero", "ZHT-5", "Caledonia", "R5", "S5", "Soloist"],
};

export const DEFAULT_TIRES: string[] = [
  "Assegai",
  "Minion DHR II",
  "Minion DHF",
  "Dissector",
  "High Roller III",
  "Aggressor",
  "Rekon",
  "Rekon Race",
  "Magic Mary",
  "Big Betty",
  "Hans Dampf",
  "Nobby Nic",
  "Tacky Chan",
  "Kryptotal-Fr",
  "Kryptotal-Re",
  "Argotal",
  "Xynotal",
  "Butcher",
  "Eliminator",
  "Hillbilly",
  "Pathfinder Pro",
  "Rambler",
  "G-One Allround",
  "G-One Bite",
  "G-One R",
  "Vittoria Mezcal",
  "Vittoria Barzo",
  "Teravail Rutland",
  "Grand Prix 5000 S TR",
  "P Zero Race TLR",
  "Schwalbe Pro One",
  "Corsa PRO TLR",
];

// Helper to extract a display string from flexible table column naming
function extractRowString(row: any, keys: string[] = ["name", "model", "brand", "title", "label"]): string {
  if (!row) return "";
  if (typeof row === "string") return row.trim();
  for (const k of keys) {
    if (typeof row[k] === "string" && row[k].trim()) {
      return row[k].trim();
    }
  }
  return "";
}

// In-memory cache across component mounts to keep UI snappy
let cachedCatalog: {
  brands: string[];
  models: string[];
  modelsByBrand: Record<string, string[]>;
  forks: string[];
  shocks: string[];
  tires: string[];
} | null = null;

export function useHardwareCatalog() {
  const [brands, setBrands] = useState<string[]>(() => cachedCatalog?.brands || DEFAULT_BRANDS);
  const [models, setModels] = useState<string[]>(() => cachedCatalog?.models || Object.values(DEFAULT_MODELS_BY_BRAND).flat());
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, string[]>>(() => cachedCatalog?.modelsByBrand || DEFAULT_MODELS_BY_BRAND);
  const [forks, setForks] = useState<string[]>(() => cachedCatalog?.forks || POPULAR_FORKS);
  const [shocks, setShocks] = useState<string[]>(() => cachedCatalog?.shocks || POPULAR_SHOCKS);
  const [tires, setTires] = useState<string[]>(() => cachedCatalog?.tires || DEFAULT_TIRES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadCatalog() {
      if (!isSupabaseConfigured) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [brandsRes, modelsRes, suspensionRes, tiresRes] = await Promise.allSettled([
          supabase.from("brands").select("*"),
          supabase.from("bike_models").select("*"),
          supabase.from("suspension").select("*"),
          supabase.from("tires").select("*"),
        ]);

        if (isCancelled) return;

        // Process Brands
        let fetchedBrands: string[] = [];
        const brandIdToNameMap: Record<string, string> = {};
        if (brandsRes.status === "fulfilled" && !brandsRes.value.error && Array.isArray(brandsRes.value.data)) {
          for (const rawItem of brandsRes.value.data) {
            const item = rawItem as Record<string, any>;
            const name = extractRowString(item, ["name", "brand", "brand_name", "title"]);
            if (name) {
              fetchedBrands.push(name);
              if (item.id !== undefined && item.id !== null) {
                brandIdToNameMap[String(item.id)] = name;
              }
            }
          }
        }

        // Process Models
        let fetchedModels: string[] = [];
        const newModelsByBrand: Record<string, string[]> = { ...DEFAULT_MODELS_BY_BRAND };

        if (modelsRes.status === "fulfilled" && !modelsRes.value.error && Array.isArray(modelsRes.value.data)) {
          for (const rawItem of modelsRes.value.data) {
            const item = rawItem as Record<string, any>;
            const modelName = extractRowString(item, ["name", "model", "model_name", "title"]);
            if (!modelName) continue;
            fetchedModels.push(modelName);

            // Associate with brand if brand / brand_id present
            const brandStr =
              item.brand ||
              item.brand_name ||
              (item.brand_id ? brandIdToNameMap[String(item.brand_id)] : null);

            if (brandStr && typeof brandStr === "string") {
              const bKey = brandStr.trim().toLowerCase();
              if (!newModelsByBrand[bKey]) {
                newModelsByBrand[bKey] = [];
              }
              if (!newModelsByBrand[bKey].includes(modelName)) {
                newModelsByBrand[bKey].push(modelName);
              }
            }
          }
        }

        // Process Suspension (Forks & Shocks)
        let fetchedForks: string[] = [];
        let fetchedShocks: string[] = [];

        if (suspensionRes.status === "fulfilled" && !suspensionRes.value.error && Array.isArray(suspensionRes.value.data)) {
          for (const rawItem of suspensionRes.value.data) {
            const item = rawItem as Record<string, any>;
            const rawName = extractRowString(item, ["name", "model", "model_name", "title"]);
            if (!rawName) continue;

            const brand =
              item.brand ||
              item.manufacturer ||
              (item.brand_id ? brandIdToNameMap[String(item.brand_id)] : "");
            const displayName =
              brand && !rawName.toLowerCase().includes(brand.toLowerCase())
                ? `${brand} ${rawName}`
                : rawName;

            const type = (item.type || item.category || "").toLowerCase();
            const lowerName = displayName.toLowerCase();

            const isShock =
              type.includes("shock") ||
              lowerName.includes("shock") ||
              lowerName.includes("float") ||
              lowerName.includes("deluxe") ||
              lowerName.includes("coil") ||
              lowerName.includes("dhx") ||
              lowerName.includes("ttx");

            const isFork =
              type.includes("fork") ||
              lowerName.includes("fork") ||
              lowerName.includes("38") ||
              lowerName.includes("36") ||
              lowerName.includes("34") ||
              lowerName.includes("zeb") ||
              lowerName.includes("lyrik") ||
              lowerName.includes("pike") ||
              lowerName.includes("sid") ||
              lowerName.includes("boxxer") ||
              lowerName.includes("mezzer") ||
              lowerName.includes("onyx") ||
              lowerName.includes("bomber z1");

            if (isShock && !isFork) {
              fetchedShocks.push(displayName);
            } else if (isFork && !isShock) {
              fetchedForks.push(displayName);
            } else {
              // Ambiguous or generic suspension item
              fetchedForks.push(displayName);
              fetchedShocks.push(displayName);
            }
          }
        }

        // Process Tires
        let fetchedTires: string[] = [];
        if (tiresRes.status === "fulfilled" && !tiresRes.value.error && Array.isArray(tiresRes.value.data)) {
          for (const rawItem of tiresRes.value.data) {
            const item = rawItem as Record<string, any>;
            const modelName = extractRowString(item, ["model", "name", "model_name", "title"]);
            const brand =
              item.brand ||
              item.manufacturer ||
              (item.brand_id ? brandIdToNameMap[String(item.brand_id)] : "");
            if (modelName) {
              fetchedTires.push(modelName);
              if (brand && !modelName.toLowerCase().includes(brand.toLowerCase())) {
                fetchedTires.push(`${brand} ${modelName}`);
              }
            }
          }
        }

        // Merge fetched data with presets ensuring uniqueness
        const mergedBrands = Array.from(new Set([...fetchedBrands, ...DEFAULT_BRANDS]));
        const mergedModels = Array.from(new Set([...fetchedModels, ...Object.values(DEFAULT_MODELS_BY_BRAND).flat()]));
        const mergedForks = Array.from(new Set([...fetchedForks, ...POPULAR_FORKS]));
        const mergedShocks = Array.from(new Set([...fetchedShocks, ...POPULAR_SHOCKS]));
        const mergedTires = Array.from(new Set([...fetchedTires, ...DEFAULT_TIRES]));

        cachedCatalog = {
          brands: mergedBrands,
          models: mergedModels,
          modelsByBrand: newModelsByBrand,
          forks: mergedForks,
          shocks: mergedShocks,
          tires: mergedTires,
        };

        setBrands(mergedBrands);
        setModels(mergedModels);
        setModelsByBrand(newModelsByBrand);
        setForks(mergedForks);
        setShocks(mergedShocks);
        setTires(mergedTires);
      } catch (err: any) {
        console.warn("Failed to fetch hardware catalog from Supabase:", err);
        setError(err?.message || "Failed to load hardware catalog");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    brands,
    models,
    modelsByBrand,
    forks,
    shocks,
    tires,
    isLoading,
    error,
  };
}
