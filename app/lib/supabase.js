import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oqyolwjgewfundiosjas.supabase.co";
const supabaseAnonKey = "sb_publishable_xa5OwCIDevASdvYgreHwdQ_PaoLpmC3";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;