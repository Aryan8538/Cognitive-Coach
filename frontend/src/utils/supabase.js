import { createClient } from "@supabase/supabase-js";

console.log("DEBUG Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("DEBUG Supabase Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log("DEBUG Supabase Publishable Key:", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
  console.warn(
    "Supabase credentials (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing in environment variables. Auth flows will fallback or run in mock mode."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
