-- ==============================================================================
-- SECURE ACCOUNT DELETION RPC FOR SUPABASE
-- Description: Cascades deletion of all user-owned data and deletes the user
-- from auth.users so their email is freed up for immediate re-registration.
-- Security: SECURITY DEFINER with search_path set. Uses auth.uid() to strictly
-- ensure callers can ONLY delete their own authenticated record.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_bikes_deleted INT := 0;
BEGIN
    -- 1. Identify the authenticated user calling the function
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: No active authenticated session found.';
    END IF;

    -- 2. Delete user's bikes from user_bikes (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_bikes') THEN
        DELETE FROM public.user_bikes WHERE profile_id = v_user_id;
        GET DIAGNOSTICS v_bikes_deleted = ROW_COUNT;
    END IF;

    -- 3. Delete from public.setups and public.bikes (if schema.sql tables exist)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'setups') THEN
        DELETE FROM public.setups WHERE bike_id IN (SELECT id FROM public.bikes WHERE user_id = v_user_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bikes') THEN
        DELETE FROM public.bikes WHERE user_id = v_user_id;
    END IF;

    -- 4. Delete user profile from profiles (and legacy users table if present)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DELETE FROM public.profiles WHERE id = v_user_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        DELETE FROM public.users WHERE id = v_user_id;
    END IF;

    -- 5. Completely remove user from auth.users (frees email for re-registration)
    DELETE FROM auth.users WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'deleted_user_id', v_user_id,
        'bikes_deleted', v_bikes_deleted,
        'message', 'User account and all associated telemetry successfully deleted.'
    );
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Account deletion failed: %', SQLERRM;
END;
$$;

-- Grant execution permission to authenticated users only
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
