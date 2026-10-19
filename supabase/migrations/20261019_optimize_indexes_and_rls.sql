-- ==============================================================================
-- DATABASE OPTIMIZATIONS: B-TREE INDEXES & CACHED RLS POLICIES
-- 
-- 1. B-Tree Indexes on filtered columns (profile_id, created_at, foreign keys)
-- 2. Statement-level RLS optimization with (SELECT auth.uid())
-- 3. Foreign key enforcement for PostgREST resource embedding (*, user_bikes(*))
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FOREIGN KEY RELATIONSHIP FOR RESOURCE EMBEDDING
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_bikes'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
              AND constraint_name = 'user_bikes_profile_id_fkey'
        ) THEN
            ALTER TABLE public.user_bikes
            ADD CONSTRAINT user_bikes_profile_id_fkey
            FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. HIGH-PERFORMANCE B-TREE INDEXES
-- ------------------------------------------------------------------------------

-- Index filtered and ordered columns in user_bikes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_bikes') THEN
        -- B-Tree index for .eq("profile_id", userId)
        CREATE INDEX IF NOT EXISTS idx_user_bikes_profile_id 
            ON public.user_bikes USING btree (profile_id);

        -- Composite B-Tree index for .eq("profile_id", ...).order("created_at", { ascending: false })
        CREATE INDEX IF NOT EXISTS idx_user_bikes_profile_id_created_at 
            ON public.user_bikes USING btree (profile_id, created_at DESC);
    END IF;
END $$;

-- Index primary key and lookup columns in profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_id 
            ON public.profiles USING btree (id);
    END IF;
END $$;

-- Index catalog lookup and foreign key columns for fast comboboxes & joins
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brands') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'name') THEN
            CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands USING btree (name);
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bike_models') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bike_models' AND column_name = 'brand_id') THEN
            CREATE INDEX IF NOT EXISTS idx_bike_models_brand_id ON public.bike_models USING btree (brand_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bike_models' AND column_name = 'name') THEN
            CREATE INDEX IF NOT EXISTS idx_bike_models_name ON public.bike_models USING btree (name);
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suspension') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'suspension' AND column_name = 'name') THEN
            CREATE INDEX IF NOT EXISTS idx_suspension_name ON public.suspension USING btree (name);
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tires') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tires' AND column_name = 'name') THEN
            CREATE INDEX IF NOT EXISTS idx_tires_name ON public.tires USING btree (name);
        END IF;
    END IF;

    -- Legacy schema index support
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bikes') THEN
        CREATE INDEX IF NOT EXISTS idx_bikes_user_id ON public.bikes USING btree (user_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'setups') THEN
        CREATE INDEX IF NOT EXISTS idx_setups_bike_id ON public.setups USING btree (bike_id);
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. OPTIMIZE ROW LEVEL SECURITY (RLS) POLICIES
-- Wrapping auth.uid() in (SELECT auth.uid()) allows Postgres to evaluate the function
-- once per statement (InitPlan) and cache the result, rather than evaluating it
-- per-row across sequential table scans.
-- ------------------------------------------------------------------------------

-- Optimized RLS for profiles table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Allow individual read" ON public.profiles;
        DROP POLICY IF EXISTS "Allow individual update" ON public.profiles;
        DROP POLICY IF EXISTS "Allow individual insert" ON public.profiles;
        DROP POLICY IF EXISTS "Allow individual delete" ON public.profiles;

        CREATE POLICY "Users can view own profile"
            ON public.profiles FOR SELECT
            USING (id = (SELECT auth.uid()));

        CREATE POLICY "Users can update own profile"
            ON public.profiles FOR UPDATE
            USING (id = (SELECT auth.uid()))
            WITH CHECK (id = (SELECT auth.uid()));

        CREATE POLICY "Users can insert own profile"
            ON public.profiles FOR INSERT
            WITH CHECK (id = (SELECT auth.uid()));

        CREATE POLICY "Users can delete own profile"
            ON public.profiles FOR DELETE
            USING (id = (SELECT auth.uid()));
    END IF;
END $$;

-- Optimized RLS for user_bikes table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_bikes') THEN
        ALTER TABLE public.user_bikes ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view own user_bikes" ON public.user_bikes;
        DROP POLICY IF EXISTS "Users can insert own user_bikes" ON public.user_bikes;
        DROP POLICY IF EXISTS "Users can update own user_bikes" ON public.user_bikes;
        DROP POLICY IF EXISTS "Users can delete own user_bikes" ON public.user_bikes;
        DROP POLICY IF EXISTS "Users can view own bikes" ON public.user_bikes;
        DROP POLICY IF EXISTS "Users can insert own bikes" ON public.user_bikes;
        DROP POLICY IF EXISTS "Users can update own bikes" ON public.user_bikes;
        DROP POLICY IF EXISTS "Users can delete own bikes" ON public.user_bikes;
        DROP POLICY IF EXISTS "Allow individual read" ON public.user_bikes;
        DROP POLICY IF EXISTS "Allow individual insert" ON public.user_bikes;
        DROP POLICY IF EXISTS "Allow individual update" ON public.user_bikes;
        DROP POLICY IF EXISTS "Allow individual delete" ON public.user_bikes;

        CREATE POLICY "Users can view own user_bikes"
            ON public.user_bikes FOR SELECT
            USING (profile_id = (SELECT auth.uid()));

        CREATE POLICY "Users can insert own user_bikes"
            ON public.user_bikes FOR INSERT
            WITH CHECK (profile_id = (SELECT auth.uid()));

        CREATE POLICY "Users can update own user_bikes"
            ON public.user_bikes FOR UPDATE
            USING (profile_id = (SELECT auth.uid()))
            WITH CHECK (profile_id = (SELECT auth.uid()));

        CREATE POLICY "Users can delete own user_bikes"
            ON public.user_bikes FOR DELETE
            USING (profile_id = (SELECT auth.uid()));
    END IF;
END $$;

-- Optimized RLS for legacy schema tables (users, bikes, setups) if present
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

        CREATE POLICY "Users can view own profile"
            ON public.users FOR SELECT
            USING (id = (SELECT auth.uid()));

        CREATE POLICY "Users can update own profile"
            ON public.users FOR UPDATE
            USING (id = (SELECT auth.uid()));
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bikes') THEN
        ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own bikes" ON public.bikes;
        DROP POLICY IF EXISTS "Users can insert own bikes" ON public.bikes;
        DROP POLICY IF EXISTS "Users can update own bikes" ON public.bikes;
        DROP POLICY IF EXISTS "Users can delete own bikes" ON public.bikes;

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
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'setups') THEN
        ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view setups of own bikes" ON public.setups;
        DROP POLICY IF EXISTS "Users can insert setups for own bikes" ON public.setups;
        DROP POLICY IF EXISTS "Users can update setups of own bikes" ON public.setups;
        DROP POLICY IF EXISTS "Users can delete setups of own bikes" ON public.setups;

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
    END IF;
END $$;
