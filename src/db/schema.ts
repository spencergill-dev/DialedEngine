/**
 * Supabase V2 Database Type Definitions for DialedEngine
 * Mirrors db/schema.sql tables: users, bikes, setups
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RidingStyle = "smooth_light" | "neutral" | "aggressive_heavy";

export type BikeCategory =
  | "full_suspension"
  | "hardtail"
  | "gravel"
  | "road"
  | "rigid";

export type TireCasing = "light" | "standard" | "heavy" | "downhill";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // uuid references auth.users
          display_name: string;
          weight_lbs: number;
          height_cm: number;
          height_inches: number | null;
          riding_style: RidingStyle;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          weight_lbs?: number;
          height_cm?: number;
          riding_style?: RidingStyle;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          weight_lbs?: number;
          height_cm?: number;
          riding_style?: RidingStyle;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      bikes: {
        Row: {
          id: string; // uuid
          user_id: string; // uuid references users.id
          brand: string;
          custom_brand: string | null;
          model: string;
          year: string;
          frame_size: string;
          category: BikeCategory;
          is_ebike: boolean;
          fork_model: string | null;
          fork_travel: number;
          shock_model: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brand: string;
          custom_brand?: string | null;
          model: string;
          year: string;
          frame_size: string;
          category: BikeCategory;
          is_ebike?: boolean;
          fork_model?: string | null;
          fork_travel?: number;
          shock_model?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brand?: string;
          custom_brand?: string | null;
          model?: string;
          year?: string;
          frame_size?: string;
          category?: BikeCategory;
          is_ebike?: boolean;
          fork_model?: string | null;
          fork_travel?: number;
          shock_model?: string | null;
          image_url?: string | null;
          updated_at?: string;
        };
      };
      setups: {
        Row: {
          id: string; // uuid
          bike_id: string; // uuid references bikes.id
          front_wheel_size: string;
          front_tire_manufacturer: string;
          front_tire_model: string;
          front_tire_width: string;
          front_tire_casing: TireCasing;
          front_tubeless: boolean;
          front_insert: boolean;
          rear_wheel_size: string;
          rear_tire_manufacturer: string;
          rear_tire_model: string;
          rear_tire_width: string;
          rear_tire_casing: TireCasing;
          rear_tubeless: boolean;
          rear_insert: boolean;
          suspension_fork_psi: number | null;
          suspension_fork_rebound: number | null;
          suspension_shock_psi: number | null;
          suspension_shock_rebound: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bike_id: string;
          front_wheel_size?: string;
          front_tire_manufacturer?: string;
          front_tire_model?: string;
          front_tire_width?: string;
          front_tire_casing?: TireCasing;
          front_tubeless?: boolean;
          front_insert?: boolean;
          rear_wheel_size?: string;
          rear_tire_manufacturer?: string;
          rear_tire_model?: string;
          rear_tire_width?: string;
          rear_tire_casing?: TireCasing;
          rear_tubeless?: boolean;
          rear_insert?: boolean;
          suspension_fork_psi?: number | null;
          suspension_fork_rebound?: number | null;
          suspension_shock_psi?: number | null;
          suspension_shock_rebound?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bike_id?: string;
          front_wheel_size?: string;
          front_tire_manufacturer?: string;
          front_tire_model?: string;
          front_tire_width?: string;
          front_tire_casing?: TireCasing;
          front_tubeless?: boolean;
          front_insert?: boolean;
          rear_wheel_size?: string;
          rear_tire_manufacturer?: string;
          rear_tire_model?: string;
          rear_tire_width?: string;
          rear_tire_casing?: TireCasing;
          rear_tubeless?: boolean;
          rear_insert?: boolean;
          suspension_fork_psi?: number | null;
          suspension_fork_rebound?: number | null;
          suspension_shock_psi?: number | null;
          suspension_shock_rebound?: number | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      riding_style: RidingStyle;
      bike_category: BikeCategory;
      tire_casing: TireCasing;
    };
  };
}
