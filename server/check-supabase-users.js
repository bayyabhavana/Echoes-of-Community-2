import { supabase } from './supabase.js';

async function checkUsers() {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return;
    }
    const { data, error } = await supabase.from('users').select('id, email, name');
    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Users in Supabase:', data);
    }
}

checkUsers();
