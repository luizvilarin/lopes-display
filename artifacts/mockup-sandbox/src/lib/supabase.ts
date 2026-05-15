import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://PLACEHOLDER_URL_NOT_CONFIGURED.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "PLACEHOLDER_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
