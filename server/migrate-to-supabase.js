import { supabase } from './supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const STORIES_FILE = path.join(__dirname, 'data', 'stories.json');

async function checkTable(tableName) {
    if (!supabase) return false;
    const { error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });
    if (error && error.code === '42P01') {
        return false;
    }
    return true;
}

async function migrate() {
    if (!supabase) {
        console.error('❌ Migration failed: Supabase client not initialized.');
        return;
    }

    const usersExist = await checkTable('users');
    const storiesExist = await checkTable('stories');

    if (!usersExist || !storiesExist) {
        console.error('❌ ERROR: Database tables do not exist yet!');
        console.error('📂 You MUST run the SQL code in your Supabase dashboard first.');
        if (!usersExist) console.error('   Missing table: "users"');
        if (!storiesExist) console.error('   Missing table: "stories"');
        return;
    }

    console.log('🚀 Starting migration to Supabase...');

    // 1. Migrate Users
    if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        console.log(`👥 Found ${users.length} users in JSON.`);

        const formattedUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            bio: u.bio || '',
            avatar: u.avatar || '',
            location: u.location || '',
            website: u.website || '',
            joined_date: u.joinedDate || new Date().toISOString(),
            role: u.role || 'user',
            followers: u.followers || [],
            following: u.following || []
        }));

        const { error: userError } = await supabase.from('users').upsert(formattedUsers);
        if (userError) console.error('❌ Error migrating users:', userError.message);
        else console.log('✅ Users migrated successfully.');
    }

    // 2. Migrate Stories
    if (fs.existsSync(STORIES_FILE)) {
        const stories = JSON.parse(fs.readFileSync(STORIES_FILE, 'utf8'));
        console.log(`📖 Found ${stories.length} stories in JSON.`);

        const formattedStories = stories.map(s => ({
            id: s.id,
            author: s.author,
            profile_image: s.profile_image || s.profileImage || null,
            context: s.context || null,
            content: s.content,
            image: s.image || null,
            images: s.images || (s.image ? [s.image] : []),
            status: s.status || 'approved',
            likes: s.likes || 0,
            comments: s.comments || 0,
            felt_this_count: s.feltThisCount || 0,
            timestamp: s.createdAt || s.timestamp || new Date().toISOString()
        }));

        const { error: storyError } = await supabase.from('stories').upsert(formattedStories);
        if (storyError) console.error('❌ Error migrating stories:', storyError.message);
        else console.log('✅ Stories migrated successfully.');
    }

    console.log('🏁 Migration finished.');
}

migrate().catch(console.error);
