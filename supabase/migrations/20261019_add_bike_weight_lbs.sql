-- ==============================================================================
-- MIGRATION: ADD BIKE WEIGHT COLUMN (bike_weight_lbs)
--
-- Adds bike_weight_lbs (NUMERIC, nullable) to public.user_bikes and public.bikes
-- to allow riders to specify exact bike weight for telemetry pressure calculation.
-- ==============================================================================

-- 1. Apply to public.bikes (if present)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bikes') THEN
        ALTER TABLE public.bikes
            ADD COLUMN IF NOT EXISTS bike_weight_lbs NUMERIC;

        COMMENT ON COLUMN public.bikes.bike_weight_lbs IS 'Total bicycle weight in pounds without rider (e.g. 32.5)';
    END IF;
END $$;

-- 2. Apply to public.user_bikes (active table queried by client application)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_bikes') THEN
        ALTER TABLE public.user_bikes
            ADD COLUMN IF NOT EXISTS bike_weight_lbs NUMERIC;

        COMMENT ON COLUMN public.user_bikes.bike_weight_lbs IS 'Total bicycle weight in pounds without rider (e.g. 32.5)';
    END IF;
END $$;
