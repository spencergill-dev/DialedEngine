-- ==============================================================================
-- MIGRATION: ADD REAR SHOCK & TIRE TELEMETRY COLUMNS
-- 
-- Suspension Fields:
--   - rear_shock_stroke (NUMERIC, nullable): Stroke length in mm (e.g. 55)
--   - rear_wheel_travel (NUMERIC, nullable): Total rear wheel travel in mm (e.g. 150)
--
-- Tire Fields:
--   - front_tire_manufacturer (TEXT, nullable)
--   - front_tire_model (TEXT, nullable)
--   - front_tire_casing (TEXT, nullable)
--   - front_tire_compound (TEXT, nullable)
--   - front_tire_width (TEXT, nullable)
--   - rear_tire_manufacturer (TEXT, nullable)
--   - rear_tire_model (TEXT, nullable)
--   - rear_tire_casing (TEXT, nullable)
--   - rear_tire_compound (TEXT, nullable)
--   - rear_tire_width (TEXT, nullable)
-- ==============================================================================

-- 1. Apply to public.bikes (if present)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bikes') THEN
        ALTER TABLE public.bikes
            ADD COLUMN IF NOT EXISTS rear_shock_stroke NUMERIC,
            ADD COLUMN IF NOT EXISTS rear_wheel_travel NUMERIC,
            ADD COLUMN IF NOT EXISTS front_tire_manufacturer TEXT,
            ADD COLUMN IF NOT EXISTS front_tire_model TEXT,
            ADD COLUMN IF NOT EXISTS front_tire_casing TEXT,
            ADD COLUMN IF NOT EXISTS front_tire_compound TEXT,
            ADD COLUMN IF NOT EXISTS front_tire_width TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_manufacturer TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_model TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_casing TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_compound TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_width TEXT;

        COMMENT ON COLUMN public.bikes.rear_shock_stroke IS 'Stroke length of the rear shock in millimeters (e.g. 55)';
        COMMENT ON COLUMN public.bikes.rear_wheel_travel IS 'Total rear wheel / frame travel in millimeters (e.g. 150)';
    END IF;
END $$;

-- 2. Apply to public.user_bikes (active table queried by client application)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_bikes') THEN
        ALTER TABLE public.user_bikes
            ADD COLUMN IF NOT EXISTS rear_shock_stroke NUMERIC,
            ADD COLUMN IF NOT EXISTS rear_wheel_travel NUMERIC,
            ADD COLUMN IF NOT EXISTS front_tire_manufacturer TEXT,
            ADD COLUMN IF NOT EXISTS front_tire_model TEXT,
            ADD COLUMN IF NOT EXISTS front_tire_casing TEXT,
            ADD COLUMN IF NOT EXISTS front_tire_compound TEXT,
            ADD COLUMN IF NOT EXISTS front_tire_width TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_manufacturer TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_model TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_casing TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_compound TEXT,
            ADD COLUMN IF NOT EXISTS rear_tire_width TEXT;

        COMMENT ON COLUMN public.user_bikes.rear_shock_stroke IS 'Stroke length of the rear shock in millimeters (e.g. 55)';
        COMMENT ON COLUMN public.user_bikes.rear_wheel_travel IS 'Total rear wheel / frame travel in millimeters (e.g. 150)';
    END IF;
END $$;
