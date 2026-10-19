import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface DeleteAccountResult {
  success: boolean;
  message: string;
}

/**
 * Securely deletes a user account:
 * 1. Executes Postgres RPC `delete_user_account` (cascades user_bikes, profiles, and deletes from auth.users).
 * 2. If RPC is not found, attempts Supabase Edge Function `delete-user`.
 * 3. If Edge Function is not configured, performs cascading table deletes on accessible tables.
 * 4. Cleanses user-isolated browser storage and signs out the session.
 */
export async function deleteUserAccount(userId: string): Promise<DeleteAccountResult> {
  // If in guest/offline mode without cloud configuration
  if (!isSupabaseConfigured || !userId) {
    clearUserStorage(userId);
    return {
      success: true,
      message: "Local profile and fleet data cleared successfully.",
    };
  }

  let deletionSucceeded = false;
  let deletionMessage = "Account deleted successfully.";

  // 1. Try invoking the Postgres RPC 'delete_user_account'
  try {
    const { data, error } = await supabase.rpc("delete_user_account");
    if (!error) {
      deletionSucceeded = true;
      deletionMessage = data?.message || "Account and telemetry records permanently deleted.";
    } else {
      console.warn("[deleteUserAccount] RPC invocation returned error, attempting edge function fallback:", error);
    }
  } catch (rpcErr) {
    console.warn("[deleteUserAccount] RPC exception, attempting edge function fallback:", rpcErr);
  }

  // 2. Try invoking the Edge Function 'delete-user' if RPC was unavailable
  if (!deletionSucceeded) {
    try {
      const { data, error } = await supabase.functions.invoke("delete-user");
      if (!error && data?.success) {
        deletionSucceeded = true;
        deletionMessage = data?.message || "User account deleted via Edge Function.";
      } else if (error) {
        console.warn("[deleteUserAccount] Edge function returned error, attempting direct table cascade:", error);
      }
    } catch (edgeErr) {
      console.warn("[deleteUserAccount] Edge function unavailable, attempting direct table cascade:", edgeErr);
    }
  }

  // 3. Fallback: Cascading delete on client-accessible database records
  if (!deletionSucceeded) {
    try {
      // Delete user's bikes
      await supabase.from("user_bikes").delete().eq("profile_id", userId);
      // Delete user's profile
      await supabase.from("profiles").delete().eq("id", userId);
      deletionSucceeded = true;
      deletionMessage = "User profile and fleet hardware successfully removed.";
    } catch (dbErr: any) {
      console.error("[deleteUserAccount] Table cascade deletion error:", dbErr);
      throw new Error(dbErr?.message || "Failed to remove user database records.");
    }
  }

  // 4. Wipe all browser storage keys isolated to this user ID
  clearUserStorage(userId);

  // 5. Sign out the client session
  try {
    await supabase.auth.signOut();
  } catch (signOutErr) {
    console.warn("[deleteUserAccount] Sign out warning:", signOutErr);
  }

  return {
    success: true,
    message: deletionMessage,
  };
}

function clearUserStorage(userId?: string) {
  try {
    if (userId) {
      localStorage.removeItem(`dialed_profile_${userId}`);
      localStorage.removeItem(`dialed_bikes_${userId}`);
      localStorage.removeItem(`dialed_active_bike_${userId}`);
      localStorage.removeItem(`dialed_onboarded_${userId}`);
    }
    // Also clear generic fallback keys if needed
    localStorage.removeItem("dialed_active_bike");
  } catch (e) {
    console.error("[deleteUserAccount] Failed to clear local storage:", e);
  }
}
