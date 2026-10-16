import type { RideTimePlan } from "@/components/setup/RidePlanDrawer";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  temperature: number; // in Celsius
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: "sun" | "cloud" | "rain";
  pop: number; // Probability of precipitation %
  precipitation: number; // mm
  isCold: boolean;
  timePlans: RideTimePlan[];
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  label: string;
}

export interface TrailLocationPreset {
  name: string;
  label: string;
  latitude: number;
  longitude: number;
}

export const PRESET_TRAIL_LOCATIONS: TrailLocationPreset[] = [
  {
    name: "Squamish, BC",
    label: "Squamish (Alice Lake), BC",
    latitude: 49.7016,
    longitude: -123.1558,
  },
  {
    name: "Whistler, BC",
    label: "Whistler Mountain Bike Park, BC",
    latitude: 50.1163,
    longitude: -122.9574,
  },
  {
    name: "North Shore, BC",
    label: "North Shore (Mount Fromme), BC",
    latitude: 49.3667,
    longitude: -123.0333,
  },
  {
    name: "Bellingham, WA",
    label: "Galbraith Mountain (Bellingham, WA)",
    latitude: 48.7233,
    longitude: -122.4278,
  },
  {
    name: "Moab, UT",
    label: "Moab (Whole Enchilada), UT",
    latitude: 38.5733,
    longitude: -109.5498,
  },
];

/**
 * Maps WMO Weather Interpretation Codes to human readable descriptions & UI icons
 */
export function mapWeatherCode(code: number): {
  description: string;
  icon: "sun" | "cloud" | "rain";
  isRain: boolean;
} {
  switch (code) {
    case 0:
      return { description: "Clear Sky", icon: "sun", isRain: false };
    case 1:
      return { description: "Mainly Clear", icon: "sun", isRain: false };
    case 2:
      return { description: "Partly Cloudy", icon: "cloud", isRain: false };
    case 3:
      return { description: "Overcast", icon: "cloud", isRain: false };
    case 45:
    case 48:
      return { description: "Dense Fog", icon: "cloud", isRain: false };
    case 51:
      return { description: "Light Drizzle", icon: "rain", isRain: true };
    case 53:
      return { description: "Moderate Drizzle", icon: "rain", isRain: true };
    case 55:
      return { description: "Dense Drizzle", icon: "rain", isRain: true };
    case 56:
    case 57:
      return { description: "Freezing Drizzle", icon: "rain", isRain: true };
    case 61:
      return { description: "Slight Rain", icon: "rain", isRain: true };
    case 63:
      return { description: "Moderate Rain", icon: "rain", isRain: true };
    case 65:
      return { description: "Heavy Rain", icon: "rain", isRain: true };
    case 66:
    case 67:
      return { description: "Freezing Rain", icon: "rain", isRain: true };
    case 71:
      return { description: "Slight Snow", icon: "rain", isRain: true };
    case 73:
      return { description: "Moderate Snow", icon: "rain", isRain: true };
    case 75:
      return { description: "Heavy Snow", icon: "rain", isRain: true };
    case 77:
      return { description: "Snow Grains", icon: "rain", isRain: true };
    case 80:
      return { description: "Slight Showers", icon: "rain", isRain: true };
    case 81:
      return { description: "Moderate Showers", icon: "rain", isRain: true };
    case 82:
      return { description: "Violent Showers", icon: "rain", isRain: true };
    case 85:
    case 86:
      return { description: "Snow Showers", icon: "rain", isRain: true };
    case 95:
      return { description: "Thunderstorm", icon: "rain", isRain: true };
    case 96:
    case 99:
      return { description: "Thunderstorm & Hail", icon: "rain", isRain: true };
    default:
      return { description: "Variable Cloud", icon: "cloud", isRain: false };
  }
}

/**
 * Retrieve user's current coordinates via HTML5 Geolocation API
 */
export function getCurrentPosition(options?: PositionOptions): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (_err) => {
        // If initial standard accuracy fails or times out, retry once with relaxed parameters
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          (finalErr) => {
            reject(finalErr);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 600000,
          }
        );
      },
      {
        enableHighAccuracy: false, // Fast resolution via WiFi / IP / Cellular (50-150ms)
        timeout: 4000,
        maximumAge: 300000, // 5 minutes cache
        ...options,
      }
    );
  });
}

/**
 * Reverse geocode latitude and longitude to a human-readable city name using BigDataCloud's direct keyless API
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  const url = `https://api-bdc.io/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Reverse geocode failed with status: ${res.status}`);
    }
    const data = await res.json();
    const city =
      data.city ||
      data.locality ||
      data.principalSubdivision ||
      data.countryName;

    let subCode = data.principalSubdivisionCode;
    if (subCode && typeof subCode === "string" && subCode.includes("-")) {
      subCode = subCode.split("-")[1];
    } else if (!subCode && data.principalSubdivision) {
      subCode = data.principalSubdivision;
    }

    if (city && subCode && city !== subCode) {
      return `${city}, ${subCode}`;
    }
    if (city && data.countryCode && !subCode) {
      return `${city}, ${data.countryCode}`;
    }
    if (city) {
      return city;
    }
  } catch (err) {
    console.warn("Reverse geocode lookup error:", err);
  }
  return "Current Location";
}

/**
 * Search locations using Open-Meteo Geocoding API
 */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=5&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding failed with status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((r: any) => {
    const parts = [r.name];
    if (r.admin1) parts.push(r.admin1);
    if (r.country) parts.push(r.country);

    return {
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
      label: parts.join(", "),
    };
  });
}

/**
 * Fetch live current weather & hourly forecast from Open-Meteo
 */
export async function fetchLiveWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,precipitation&hourly=temperature_2m,precipitation_probability&forecast_days=2`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API returned error status: ${res.status}`);
  }

  const json = await res.json();
  const current = json.current;
  const hourly = json.hourly;

  const currentTemp = Math.round(Number(current.temperature_2m));
  const currentCode = Number(current.weather_code ?? 0);
  const currentPrecip = Number(current.precipitation ?? 0);
  const weatherMap = mapWeatherCode(currentCode);

  // Determine current hour index in the hourly array
  const now = new Date();
  const currentHour = now.getHours();

  // Find index corresponding to current hour, or default to 0
  let currentIndex = 0;
  if (hourly?.time && Array.isArray(hourly.time)) {
    const todayDateStr = now.toISOString().split("T")[0];
    const matchPrefix = `${todayDateStr}T${String(currentHour).padStart(2, "0")}`;
    const idx = hourly.time.findIndex((t: string) => t.startsWith(matchPrefix));
    if (idx !== -1) currentIndex = idx;
  }

  const currentPop = Number(hourly?.precipitation_probability?.[currentIndex] ?? (weatherMap.isRain ? 80 : 15));

  // Build the 4 dynamic departure windows based on real hourly forecasts
  const plus2Index = Math.min(currentIndex + 2, (hourly?.temperature_2m?.length || 24) - 1);
  const plus2Temp = Math.round(Number(hourly?.temperature_2m?.[plus2Index] ?? currentTemp));
  const plus2Pop = Number(hourly?.precipitation_probability?.[plus2Index] ?? currentPop);
  const plus2IsWet = plus2Pop >= 60;

  // Afternoon: ~14:00 (index ~14 today)
  const afternoonIndex = Math.min(Math.max(currentIndex, 14), (hourly?.temperature_2m?.length || 24) - 1);
  const afternoonTemp = Math.round(Number(hourly?.temperature_2m?.[afternoonIndex] ?? currentTemp));
  const afternoonPop = Number(hourly?.precipitation_probability?.[afternoonIndex] ?? 25);
  const afternoonIsWet = afternoonPop >= 60;

  // Tomorrow morning: ~09:00 tomorrow (24 + 9 = 33)
  const tomorrowAmIndex = Math.min(33, (hourly?.temperature_2m?.length || 48) - 1);
  const tomorrowAmTemp = Math.round(Number(hourly?.temperature_2m?.[tomorrowAmIndex] ?? (currentTemp - 2)));
  const tomorrowAmPop = Number(hourly?.precipitation_probability?.[tomorrowAmIndex] ?? 10);
  const tomorrowIsWet = tomorrowAmPop >= 60;

  const timePlans: RideTimePlan[] = [
    {
      id: "now",
      label: "Riding Now",
      timeLabel: "Current Live Telemetry",
      temperature: currentTemp,
      weatherDescription: weatherMap.description,
      pop: currentPop,
      weatherIcon: weatherMap.icon,
      autoSurfaceCondition: weatherMap.isRain || currentPop >= 65 ? "wet_slippery" : undefined,
    },
    {
      id: "plus_2h",
      label: "+2 Hours",
      timeLabel: "Incoming Hourly Forecast",
      temperature: plus2Temp,
      weatherDescription: plus2Pop >= 60 ? "Rain Expected" : plus2Temp < 10 ? "Chilly Air" : "Mild Conditions",
      pop: plus2Pop,
      weatherIcon: plus2Pop >= 60 ? "rain" : plus2Pop >= 30 ? "cloud" : "sun",
      autoSurfaceCondition: plus2IsWet ? "wet_slippery" : undefined,
    },
    {
      id: "afternoon",
      label: "This Afternoon",
      timeLabel: "Peak Thermal Forecast",
      temperature: afternoonTemp,
      weatherDescription: afternoonPop >= 60 ? "Scattered Showers" : afternoonTemp >= 20 ? "Warm Sun" : "Overcast",
      pop: afternoonPop,
      weatherIcon: afternoonPop >= 60 ? "rain" : afternoonPop >= 30 ? "cloud" : "sun",
      autoSurfaceCondition: afternoonIsWet ? "wet_slippery" : undefined,
    },
    {
      id: "tomorrow_am",
      label: "Tomorrow Morning",
      timeLabel: "09:00 Early Alpine Air",
      temperature: tomorrowAmTemp,
      weatherDescription: tomorrowAmPop >= 60 ? "Morning Rain" : "Crisp Air",
      pop: tomorrowAmPop,
      weatherIcon: tomorrowAmPop >= 60 ? "rain" : tomorrowAmPop >= 30 ? "cloud" : "sun",
      autoSurfaceCondition: tomorrowIsWet ? "wet_slippery" : "dry_fast",
    },
  ];

  return {
    temperature: currentTemp,
    weatherCode: currentCode,
    weatherDescription: weatherMap.description,
    weatherIcon: weatherMap.icon,
    pop: currentPop,
    precipitation: currentPrecip,
    isCold: currentTemp < 10,
    timePlans,
  };
}
