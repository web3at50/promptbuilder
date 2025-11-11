import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Creates a Supabase client with Clerk authentication integration
 * Uses the NEW 2025 Clerk + Supabase native integration method
 *
 * This uses Clerk session tokens directly (no JWT template needed)
 * The Clerk+Supabase integration automatically adds the required claims
 *
 * Documentation:
 * https://supabase.com/docs/guides/auth/third-party/clerk
 * https://clerk.com/docs/guides/development/integrations/databases/supabase
 */
export async function createClerkSupabaseClient() {
  const { getToken } = await auth();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    accessToken: async () => {
      // Use Clerk session token directly (no template parameter needed)
      // The integration automatically adds role: "authenticated" claim
      return await getToken() ?? null;
    },
  });
}

/**
 * Gets the current user's Clerk ID
 * Returns null if not authenticated
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
