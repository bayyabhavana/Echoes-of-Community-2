import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = 'https://xzcwbnngrrvbahlbhsks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Y3dibm5ncnJ2YmFobGJoc2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDY1OTcsImV4cCI6MjA4NzU4MjU5N30.fMe7AhS5MNo7aGkYr4x-VhNc91PS2HPXzkpWgj3gLII';

let supabaseInstance = null;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE')) {
    console.error('❌ ERROR: Real Supabase credentials not found!');
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
