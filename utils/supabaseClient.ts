import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // "https://<project-id>.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // "<anon-key>"
const supabase = createClient(supabaseUrl, supabaseKey); // create a supabase client
export default supabase;
