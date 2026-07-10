import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export interface ProjectListing {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  posted_at: string;
  client_name: string;
  remote: boolean;
}
