import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key in environment variables');
}

// Client for user operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Client for admin operations (uses service role key)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

export default supabase;
