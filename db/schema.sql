-- ==============================================================================
-- DIALED ENGINE - CLOUD DATABASE SCHEMA (SUPABASE / POSTGRESQL V2)
-- Architecture: Multi-tenant, RLS-enforced cycling telemetry & bike fleet schema
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS / PROFILES TABLE
-- Directly mapped to Supabase auth.users with biometric metrics
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Rider',
    weight_lbs NUMERIC(5, 2) NOT NULL DEFAULT 175.00 CHECK (weight_lbs >= 50 AND weight_lbs <= 400),
    height_cm NUMERIC(5, 2) NOT NULL DEFAULT 180.00 CHECK (height_cm >= 100 AND height_cm <= 250),
    height_inches NUMERIC(4, 1) GENERATED ALWAYS AS (ROUND(height_cm / 2.54, 1)) STORED,
    riding_style TEXT NOT NULL DEFAULT 'neutral' CHECK (riding_style IN ('smooth_light', 'neutral', 'aggressive_heavy')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3. BIKES (FLEET) TABLE
-- Bicycle chassis and suspension hardware specs
CREATE TABLE IF NOT EXISTS public.bikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    custom_brand TEXT,
    model TEXT NOT NULL,
    year TEXT NOT NULL,
    frame_size TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('full_suspension', 'hardtail', 'gravel', 'road', 'rigid')),
    is_ebike BOOLEAN NOT NULL DEFAULT FALSE,
    fork_model TEXT,
    fork_travel INTEGER NOT NULL DEFAULT 0 CHECK (fork_travel >= 0 AND fork_travel <= 220),
    shock_model TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 4. SETUPS (WHEELSETS, TIRES & SUSPENSION BASELINES)
-- Specific component configurations tied to each bicycle
CREATE TABLE IF NOT EXISTS public.setups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bike_id UUID NOT NULL REFERENCES public.bikes(id) ON DELETE CASCADE,
    
    -- Front Tire Configuration
    front_wheel_size TEXT NOT NULL DEFAULT '29"',
    front_tire_manufacturer TEXT NOT NULL DEFAULT 'Maxxis',
    front_tire_model TEXT NOT NULL DEFAULT 'Assegai',
    front_tire_width TEXT NOT NULL DEFAULT '2.5"',
    front_tire_casing TEXT NOT NULL DEFAULT 'standard' CHECK (front_tire_casing IN ('light', 'standard', 'heavy', 'downhill')),
    front_tubeless BOOLEAN NOT NULL DEFAULT TRUE,
    front_insert BOOLEAN NOT NULL DEFAULT FALSE,

    -- Rear Tire Configuration
    rear_wheel_size TEXT NOT NULL DEFAULT '29"',
    rear_tire_manufacturer TEXT NOT NULL DEFAULT 'Maxxis',
    rear_tire_model TEXT NOT NULL DEFAULT 'Minion DHR II',
    rear_tire_width TEXT NOT NULL DEFAULT '2.4"',
    rear_tire_casing TEXT NOT NULL DEFAULT 'heavy' CHECK (rear_tire_casing IN ('light', 'standard', 'heavy', 'downhill')),
    rear_tubeless BOOLEAN NOT NULL DEFAULT TRUE,
    rear_insert BOOLEAN NOT NULL DEFAULT TRUE,

    -- Suspension Baseline Overrides (Optional calibration values)
    suspension_fork_psi NUMERIC(5, 2),
    suspension_fork_rebound INTEGER CHECK (suspension_fork_rebound >= 1 AND suspension_fork_rebound <= 24),
    suspension_shock_psi NUMERIC(5, 2),
    suspension_shock_rebound INTEGER CHECK (suspension_shock_rebound >= 1 AND suspension_shock_rebound <= 24),

    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_bike_setup UNIQUE(bike_id)
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_bikes_user_id ON public.bikes(user_id);
CREATE INDEX IF NOT EXISTS idx_setups_bike_id ON public.setups(bike_id);
CREATE INDEX IF NOT EXISTS idx_bikes_category ON public.bikes(category);

-- 6. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_users_updated
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_bikes_updated
    BEFORE UPDATE ON public.bikes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_setups_updated
    BEFORE UPDATE ON public.setups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. AUTOMATIC PROFILE ON SUPABASE AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, display_name, weight_lbs, height_cm, riding_style)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Rider'),
        175.00,
        180.00,
        'neutral'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (id = (SELECT auth.uid()));

-- Bikes Table Policies
CREATE POLICY "Users can view own bikes"
    ON public.bikes FOR SELECT
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own bikes"
    ON public.bikes FOR INSERT
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own bikes"
    ON public.bikes FOR UPDATE
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own bikes"
    ON public.bikes FOR DELETE
    USING (user_id = (SELECT auth.uid()));

-- Setups Table Policies
CREATE POLICY "Users can view setups of own bikes"
    ON public.setups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bikes
            WHERE public.bikes.id = public.setups.bike_id
            AND public.bikes.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Users can insert setups for own bikes"
    ON public.setups FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bikes
            WHERE public.bikes.id = public.setups.bike_id
            AND public.bikes.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Users can update setups of own bikes"
    ON public.setups FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.bikes
            WHERE public.bikes.id = public.setups.bike_id
            AND public.bikes.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Users can delete setups of own bikes"
    ON public.setups FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.bikes
            WHERE public.bikes.id = public.setups.bike_id
            AND public.bikes.user_id = (SELECT auth.uid())
        )
    );
