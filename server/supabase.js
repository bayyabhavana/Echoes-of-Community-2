import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabaseInstance = null;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE')) {
    console.error('❌ ERROR: Real Supabase credentials not found!');
    console.error(`📂 Please open this exact file and paste your keys:`);
    console.error(`   ${path.join(__dirname, '.env')}`);
} else {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client initialized.');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error.message);
    }
}

export const supabase = supabaseInstance;
