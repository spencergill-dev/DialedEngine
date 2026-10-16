import type { Bike, RiderProfile } from "@/types/cycling";

/**
 * Data Service Interface (IDataService)
 * 
 * Abstract contract decoupling the UI components from the underlying persistence layer.
 * Allows transparent swapping between LocalDataService (localStorage) and SupabaseDataService (Cloud PostgreSQL).
 */
export interface IDataService {
  /**
   * Retrieves the current rider biometric profile.
   */
  getProfile(): Promise<RiderProfile>;

  /**
   * Persists updates to the rider profile.
   */
  saveProfile(profile: RiderProfile): Promise<RiderProfile>;

  /**
   * Retrieves all bicycles currently in the garage fleet.
   */
  getBikes(): Promise<Bike[]>;

  /**
   * Replaces or bulk updates the bike fleet list.
   */
  saveBikes(bikes: Bike[]): Promise<void>;

  /**
   * Creates and registers a new bicycle in the garage fleet.
   */
  addBike(bike: Omit<Bike, "id">): Promise<Bike>;

  /**
   * Updates component or chassis specs on an existing bicycle.
   */
  updateBike(id: string, updates: Partial<Bike>): Promise<Bike | null>;

  /**
   * Removes a bicycle by ID from the fleet.
   */
  deleteBike(id: string): Promise<boolean>;

  /**
   * Retrieves the ID of the bicycle currently staged for the ride setup.
   */
  getActiveBikeId(): Promise<string>;

  /**
   * Sets the active bicycle ID for the ride setup engine.
   */
  setActiveBikeId(id: string): Promise<void>;
}
