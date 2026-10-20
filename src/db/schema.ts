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

export type BikeDiscipline =
  | "mountain"
  | "gravel"
  | "road"
  | "fat_bike"
  | "urban_commuter";

export type SuspensionLayout =
  | "rigid"
  | "front_suspension"
  | "full_suspension";

export type BikeCategory =
  | "full_suspension"
  | "hardtail"
  | "gravel"
  | "road"
  | "fat_bike"
  | "urban_commuter"
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
          discipline?: BikeDiscipline;
          suspension_layout?: SuspensionLayout;
          category: BikeCategory;
          is_ebike: boolean;
          bike_weight_lbs?: number | null;
          fork_model: string | null;
          fork_travel: number;
          shock_model: string | null;
          rear_shock_stroke?: number | null;
          rear_wheel_travel?: number | null;
          front_tire_manufacturer?: string | null;
          front_tire_model?: string | null;
          front_tire_casing?: string | null;
          front_tire_compound?: string | null;
          front_tire_width?: string | null;
          rear_tire_manufacturer?: string | null;
          rear_tire_model?: string | null;
          rear_tire_casing?: string | null;
          rear_tire_compound?: string | null;
          rear_tire_width?: string | null;
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
          discipline?: BikeDiscipline;
          suspension_layout?: SuspensionLayout;
          category: BikeCategory;
          is_ebike?: boolean;
          bike_weight_lbs?: number | null;
          fork_model?: string | null;
          fork_travel?: number;
          shock_model?: string | null;
          rear_shock_stroke?: number | null;
          rear_wheel_travel?: number | null;
          front_tire_manufacturer?: string | null;
          front_tire_model?: string | null;
          front_tire_casing?: string | null;
          front_tire_compound?: string | null;
          front_tire_width?: string | null;
          rear_tire_manufacturer?: string | null;
          rear_tire_model?: string | null;
          rear_tire_casing?: string | null;
          rear_tire_compound?: string | null;
          rear_tire_width?: string | null;
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
          discipline?: BikeDiscipline;
          suspension_layout?: SuspensionLayout;
          category?: BikeCategory;
          is_ebike?: boolean;
          bike_weight_lbs?: number | null;
          fork_model?: string | null;
          fork_travel?: number;
          shock_model?: string | null;
          rear_shock_stroke?: number | null;
          rear_wheel_travel?: number | null;
          front_tire_manufacturer?: string | null;
          front_tire_model?: string | null;
          front_tire_casing?: string | null;
          front_tire_compound?: string | null;
          front_tire_width?: string | null;
          rear_tire_manufacturer?: string | null;
          rear_tire_model?: string | null;
          rear_tire_casing?: string | null;
          rear_tire_compound?: string | null;
          rear_tire_width?: string | null;
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
      brands: {
        Row: {
          id?: string | number;
          name?: string;
          brand?: string;
          created_at?: string;
          [key: string]: any;
        };
        Insert: {
          id?: string | number;
          name?: string;
          brand?: string;
          created_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string | number;
          name?: string;
          brand?: string;
          [key: string]: any;
        };
      };
      tire_brands: {
        Row: {
          id: string | number;
          name: string;
          created_at?: string;
          [key: string]: any;
        };
        Insert: {
          id?: string | number;
          name: string;
          created_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string | number;
          name?: string;
          [key: string]: any;
        };
      };
      tire_models: {
        Row: {
          id: string | number;
          brand_id: string | number;
          name: string;
          created_at?: string;
          [key: string]: any;
        };
        Insert: {
          id?: string | number;
          brand_id: string | number;
          name: string;
          created_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string | number;
          brand_id?: string | number;
          name?: string;
          [key: string]: any;
        };
      };
      tire_specs: {
        Row: {
          id: string | number;
          model_id: string | number;
          casing?: string | null;
          compound?: string | null;
          width?: string | null;
          created_at?: string;
          [key: string]: any;
        };
        Insert: {
          id?: string | number;
          model_id: string | number;
          casing?: string | null;
          compound?: string | null;
          width?: string | null;
          created_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string | number;
          model_id?: string | number;
          casing?: string | null;
          compound?: string | null;
          width?: string | null;
          [key: string]: any;
        };
      };
      bike_models: {
        Row: {
          id?: string | number;
          name?: string;
          model?: string;
          brand_id?: string | number | null;
          brand?: string | null;
          year?: string | number | null;
          created_at?: string;
          [key: string]: any;
        };
        Insert: {
          id?: string | number;
          name?: string;
          model?: string;
          brand_id?: string | number | null;
          brand?: string | null;
          [key: string]: any;
        };
        Update: {
          id?: string | number;
          name?: string;
          model?: string;
          brand_id?: string | number | null;
          brand?: string | null;
          [key: string]: any;
        };
      };
      suspension: {
        Row: {
          id?: string | number;
          name?: string;
          model?: string;
          brand?: string | null;
          manufacturer?: string | null;
          type?: string | null;
          category?: string | null;
          created_at?: string;
          [key: string]: any;
        };
        Insert: {
          id?: string | number;
          name?: string;
          model?: string;
          brand?: string | null;
          type?: string | null;
          [key: string]: any;
        };
        Update: {
          id?: string | number;
          name?: string;
          model?: string;
          brand?: string | null;
          type?: string | null;
          [key: string]: any;
        };
      };
      tires: {
        Row: {
          id?: string | number;
          name?: string;
          model?: string;
          brand?: string | null;
          manufacturer?: string | null;
          width?: string | null;
          casing?: string | null;
          created_at?: string;
          [key: string]: any;
        };
        Insert: {
          id?: string | number;
          name?: string;
          model?: string;
          brand?: string | null;
          [key: string]: any;
        };
        Update: {
          id?: string | number;
          name?: string;
          model?: string;
          brand?: string | null;
          [key: string]: any;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name?: string | null;
          weight_lbs?: number | null;
          created_at?: string;
          [key: string]: any;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          weight_lbs?: number | null;
          created_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          weight_lbs?: number | null;
          created_at?: string;
          [key: string]: any;
        };
      };
      user_bikes: {
        Row: {
          id: string;
          profile_id: string | null;
          custom_name: string | null;
          brand: string | null;
          model: string | null;
          discipline: string | null;
          suspension_layout: string | null;
          wheel_size: string | null;
          bike_weight_lbs?: number | null;
          rear_shock_stroke?: number | null;
          rear_wheel_travel?: number | null;
          front_tire_manufacturer?: string | null;
          front_tire_model?: string | null;
          front_tire_casing?: string | null;
          front_tire_compound?: string | null;
          front_tire_width: string | null;
          rear_tire_manufacturer?: string | null;
          rear_tire_model?: string | null;
          rear_tire_casing?: string | null;
          rear_tire_compound?: string | null;
          rear_tire_width: string | null;
          created_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          custom_name?: string | null;
          brand?: string | null;
          model?: string | null;
          discipline?: string | null;
          suspension_layout?: string | null;
          wheel_size?: string | null;
          bike_weight_lbs?: number | null;
          rear_shock_stroke?: number | null;
          rear_wheel_travel?: number | null;
          front_tire_manufacturer?: string | null;
          front_tire_model?: string | null;
          front_tire_casing?: string | null;
          front_tire_compound?: string | null;
          front_tire_width?: string | null;
          rear_tire_manufacturer?: string | null;
          rear_tire_model?: string | null;
          rear_tire_casing?: string | null;
          rear_tire_compound?: string | null;
          rear_tire_width?: string | null;
          created_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          custom_name?: string | null;
          brand?: string | null;
          model?: string | null;
          discipline?: string | null;
          suspension_layout?: string | null;
          wheel_size?: string | null;
          bike_weight_lbs?: number | null;
          rear_shock_stroke?: number | null;
          rear_wheel_travel?: number | null;
          front_tire_manufacturer?: string | null;
          front_tire_model?: string | null;
          front_tire_casing?: string | null;
          front_tire_compound?: string | null;
          front_tire_width?: string | null;
          rear_tire_manufacturer?: string | null;
          rear_tire_model?: string | null;
          rear_tire_casing?: string | null;
          rear_tire_compound?: string | null;
          rear_tire_width?: string | null;
          created_at?: string;
          [key: string]: any;
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
