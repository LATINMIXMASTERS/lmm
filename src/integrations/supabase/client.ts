// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oycmlzwexdlsfthnebfk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Y21sendleGRsc2Z0aG5lYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NDk2MjYsImV4cCI6MjA1NzEyNTYyNn0.QGHlcl5rSH_b_U_xJo3axiiWpa3IeFDEp5idCrBGflU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);