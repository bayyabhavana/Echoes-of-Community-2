import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://xzcwbnngrrvbahlbhsks.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Y3dibm5ncnJ2YmFobGJoc2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDY1OTcsImV4cCI6MjA4NzU4MjU5N30.fMe7AhS5MNo7aGkYr4x-VhNc91PS2HPXzkpWgj3gLII';

let supabaseInstance = null;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE')) {
    console.error('❌ ERROR: Real Supabase credentials not found!');
    console.error(`� Currently reading URL as: "${supabaseUrl}"`);
    console.error(`�📂 Please open this exact file and replace the text:`);
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
