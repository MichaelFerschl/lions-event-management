import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase Admin client with service role key.
 * This client bypasses Row Level Security and should only be used server-side.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase Admin credentials not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Fetches Supabase Auth user data by user ID.
 * Returns null if user not found or on error.
 */
export async function getSupabaseAuthUser(authUserId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(authUserId);

    if (error) {
      console.error('Error fetching Supabase auth user:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error fetching Supabase auth user:', error);
    return null;
  }
}
