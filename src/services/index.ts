import { LocalDataService } from "./LocalDataService";
import type { IDataService } from "./DataService";

// Default active data service for client runtime.
// Switching to cloud Supabase tomorrow is as simple as re-exporting new SupabaseDataService().
export const dataService: IDataService = new LocalDataService();

export * from "./DataService";
export * from "./LocalDataService";
export * from "./SupabaseDataService";
