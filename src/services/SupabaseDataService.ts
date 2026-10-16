import type { Bike, RiderProfile } from "@/types/cycling";
import type { IDataService } from "./DataService";
import type { Database } from "@/db/schema";

export type SupabaseDatabase = Database;

/**
 * SupabaseDataService (V2 Scaffolding)
 * 
 * Future-ready implementation of IDataService that synchronizes
 * fleet data, component setups, and rider profiles with Supabase PostgreSQL.
 * 
 * To activate in V2:
 * 1. npm install @supabase/supabase-js
 * 2. Supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 * 3. Swap the active singleton in src/services/index.ts to new SupabaseDataService(client)
 */
export class SupabaseDataService implements IDataService {
  private client: unknown; // Will type as SupabaseClient<Database> when installed

  constructor(supabaseClient?: unknown) {
    this.client = supabaseClient;
  }

  async getProfile(): Promise<RiderProfile> {
    if (!this.client) {
      throw new Error("[SupabaseDataService] Supabase client is not configured yet. Fallback to LocalDataService.");
    }

    // Example query mapping public.users -> RiderProfile:
    // const { data, error } = await this.client.from('users').select('*').single();
    // return mapUserRowToProfile(data);
    throw new Error("Supabase integration pending V2 activation");
  }

  async saveProfile(_profile: RiderProfile): Promise<RiderProfile> {
    if (!this.client) throw new Error("Supabase client not initialized");
    // Example upsert into public.users
    return _profile;
  }

  async getBikes(): Promise<Bike[]> {
    if (!this.client) throw new Error("Supabase client not initialized");
    // Example query joining public.bikes and public.setups:
    // const { data } = await this.client.from('bikes').select('*, setups(*)');
    // return data.map(mapDbToBike);
    return [];
  }

  async saveBikes(_bikes: Bike[]): Promise<void> {
    if (!this.client) throw new Error("Supabase client not initialized");
  }

  async addBike(_bike: Omit<Bike, "id">): Promise<Bike> {
    if (!this.client) throw new Error("Supabase client not initialized");
    throw new Error("Pending V2");
  }

  async updateBike(_id: string, _updates: Partial<Bike>): Promise<Bike | null> {
    if (!this.client) throw new Error("Supabase client not initialized");
    return null;
  }

  async deleteBike(_id: string): Promise<boolean> {
    if (!this.client) throw new Error("Supabase client not initialized");
    return false;
  }

  async getActiveBikeId(): Promise<string> {
    return "";
  }

  async setActiveBikeId(_id: string): Promise<void> {
    // Can be persisted to user metadata or local storage
  }
}
