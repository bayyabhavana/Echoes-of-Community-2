import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabaseInstance = null;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE')) {
    console.error('❌ ERROR: Supabase environment variables are not configured.');
} else {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseKey, {
            global: { fetch: fetch }
        });
        console.log('✅ Supabase client initialized.');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error.message);
    }
}

export const supabase = supabaseInstance;
