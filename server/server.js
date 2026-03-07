import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { supabase } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'echoes-secret-key-change-in-production';

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const STORIES_FILE = path.join(__dirname, 'data', 'stories.json');
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(UPLOAD_DIR, { recursive: true });
            cb(null, UPLOAD_DIR);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

let lastError = null;

// Helper to timeout long-running Supabase requests
const withTimeout = (promise, ms = 2000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timed out')), ms))
    ]);
};

// Helper functions using Supabase
async function readUsers() {
    try {
        if (!supabase) {
            // Fallback to local if no Supabase (for local development)
            const data = await fs.readFile(USERS_FILE, 'utf8');
            return JSON.parse(data);
        }
        // Check if Supabase has data with a quick timeout
        const { data: allData, error: allErr } = await withTimeout(supabase.from('users').select('*'), 2500);
        if (allErr) {
            lastError = `Supabase fetch failed: ${allErr.message}`;
            throw allErr;
        }

        if (allData && allData.length > 0) {
            return allData;
        }

        // If Supabase is empty, fallback to local data
        lastError = "Supabase is empty, falling back to local users.json";
        const localData = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(localData);
    } catch (error) {
        lastError = `readUsers Fallback: ${error.message}`;
        console.warn('Falling back to local users.json due to error:', error.message);
        try {
            const data = await fs.readFile(USERS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (fsError) {
            return [];
        }
    }
}

async function readStories() {
    try {
        if (!supabase) {
            const data = await fs.readFile(STORIES_FILE, 'utf8');
            const stories = JSON.parse(data);
            return stories.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
        }
        const { data, error } = await withTimeout(supabase.from('stories').select('*'), 2500);
        if (error) {
            lastError = `Supabase Stories Error: ${error.message}`;
            throw error;
        }
        
        if (data && data.length > 0) {
            return data;
        }

        // If Supabase is empty, fallback to local data
        lastError = "Supabase is empty, falling back to local stories.json";
        const localData = await fs.readFile(STORIES_FILE, 'utf8');
        return JSON.parse(localData);
    } catch (error) {
        lastError = `readStories Fallback: ${error.message}`;
        console.warn('Falling back to local stories.json due to error:', error.message);
        try {
            const data = await fs.readFile(STORIES_FILE, 'utf8');
            return JSON.parse(data);
        } catch (fsError) {
            return [];
        }
    }
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Admin only middleware
async function requireAdmin(req, res, next) {
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const users = await readUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            ...userWithoutPassword,
            joinedDate: user.joined_date || user.joinedDate,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const users = await readUsers();
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            bio: '',
            avatar: '',
            location: '',
            website: '',
            joined_date: new Date().toISOString(),
            role: 'user',
            followers: [],
            following: []
        };

        if (supabase) {
            const { error } = await withTimeout(supabase.from('users').insert([newUser]), 3000);
            if (error) throw error;
        } else {
            users.push(newUser);
            await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        }

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, name: newUser.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            ...userWithoutPassword,
            joinedDate: newUser.joined_date,
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        const isConnError = error.message.includes('fetch failed') || error.message.includes('timed out');
        res.status(500).json({
            message: isConnError ? 'Database connection failed. Please ensure Supabase is configured.' : 'Internal server error during signup',
            details: error.message
        });
    }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (supabase) {
            const { error } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('email', email);
            if (error) throw error;
        } else {
            const users = await readUsers();
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex === -1) {
                return res.status(404).json({ message: 'User not found' });
            }
            users[userIndex].password = hashedPassword;
            await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        }

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
    try {
        const users = await readUsers();
        const user = users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            ...userWithoutPassword,
            joinedDate: user.joined_date || user.joinedDate
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

// Search users
app.get('/api/users/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query is required' });

        const users = await readUsers();
        const searchResults = users.filter(u => 
            (u.name?.toLowerCase().includes(q.toLowerCase())) || 
            (u.email?.toLowerCase().includes(q.toLowerCase()))
        ).slice(0, 20);

        const results = searchResults.map(({ password: _, ...user }) => ({
            ...user,
            joinedDate: user.joined_date || user.joinedDate,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0
        }));

        res.json(results);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user profile by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const users = await readUsers();
        const user = users.find(u => u.id === id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;

        const profile = {
            ...userWithoutPassword,
            joinedDate: user.joined_date || user.joinedDate,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0
        };

        res.json(profile);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user profile
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.id !== id) {
            return res.status(403).json({ message: 'You can only update your own profile' });
        }

        const { bio, avatar, location, website } = req.body;
        const updateData = {};
        if (bio !== undefined) updateData.bio = bio;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (location !== undefined) updateData.location = location;
        if (website !== undefined) updateData.website = website;

        let updatedUser;
        if (supabase) {
            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            updatedUser = data;
        } else {
            const users = await readUsers();
            const userIndex = users.findIndex(u => u.id === id);
            if (userIndex === -1) return res.status(404).json({ message: 'User not found' });
            
            users[userIndex] = { ...users[userIndex], ...updateData };
            await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
            updatedUser = users[userIndex];
        }

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json({
            ...userWithoutPassword,
            joinedDate: updatedUser.joined_date || updatedUser.joinedDate
        });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================
// FILE UPLOAD ENDPOINTS
// ============================================

app.post('/api/upload/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        res.json({
            message: 'Avatar uploaded successfully',
            url: avatarUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ message: error.message || 'Failed to upload avatar' });
    }
});


// ============================================
// FOLLOW/UNFOLLOW ENDPOINTS
// ============================================

app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        if (currentUserId === id) return res.status(400).json({ message: 'You cannot follow yourself' });

        const users = await readUsers();
        const currentUser = users.find(u => u.id === currentUserId);
        const targetUser = users.find(u => u.id === id);

        if (!currentUser || !targetUser) return res.status(404).json({ message: 'User not found' });

        if (!currentUser.following) currentUser.following = [];
        if (!targetUser.followers) targetUser.followers = [];

        if (currentUser.following.includes(id)) return res.status(400).json({ message: 'Already following this user' });

        const updatedFollowing = [...currentUser.following, id];
        const updatedFollowers = [...targetUser.followers, currentUserId];

        if (supabase) {
            const { error: err1 } = await supabase.from('users').update({ following: updatedFollowing }).eq('id', currentUserId);
            const { error: err2 } = await supabase.from('users').update({ followers: updatedFollowers }).eq('id', id);
            if (err1 || err2) throw (err1 || err2);
        } else {
            currentUser.following = updatedFollowing;
            targetUser.followers = updatedFollowers;
            await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        }

        res.json({
            message: 'Successfully followed user',
            followersCount: updatedFollowers.length,
            followingCount: updatedFollowing.length
        });
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/users/:id/unfollow', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        const users = await readUsers();
        const currentUser = users.find(u => u.id === currentUserId);
        const targetUser = users.find(u => u.id === id);

        if (!currentUser || !targetUser) return res.status(404).json({ message: 'User not found' });

        if (!currentUser.following || !currentUser.following.includes(id)) return res.status(400).json({ message: 'Not following this user' });

        const updatedFollowing = currentUser.following.filter(uid => uid !== id);
        const updatedFollowers = (targetUser.followers || []).filter(uid => uid !== currentUserId);

        if (supabase) {
            const { error: err1 } = await supabase.from('users').update({ following: updatedFollowing }).eq('id', currentUserId);
            const { error: err2 } = await supabase.from('users').update({ followers: updatedFollowers }).eq('id', id);
            if (err1 || err2) throw (err1 || err2);
        } else {
            currentUser.following = updatedFollowing;
            targetUser.followers = updatedFollowers;
            await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        }

        res.json({
            message: 'Successfully unfollowed user',
            followersCount: updatedFollowers.length,
            followingCount: updatedFollowing.length
        });
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/users/:id/followers', async (req, res) => {
    try {
        const { id } = req.params;
        const users = await readUsers();
        const user = users.find(u => u.id === id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const followers = users.filter(u => user.followers?.includes(u.id));
        res.json(followers.map(({ password: _, ...u }) => ({
            ...u,
            joinedDate: u.joined_date || u.joinedDate
        })));
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/users/:id/following', async (req, res) => {
    try {
        const { id } = req.params;
        const users = await readUsers();
        const user = users.find(u => u.id === id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const following = users.filter(u => user.following?.includes(u.id));
        res.json(following.map(({ password: _, ...u }) => ({
            ...u,
            joinedDate: u.joined_date || u.joinedDate
        })));
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get stories for a specific user
app.get('/api/users/:id/stories', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] Fetching stories for user ID: ${id}`);
        const users = await readUsers();
        const user = users.find(u => u.id === id);

        if (!user) {
            console.log(`[DEBUG] User not found for ID: ${id}`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[DEBUG] Found user: ${user.name}`);
        const stories = await readStories();
        // Filter stories where the authorId matches OR fall back to name matching for legacy support
        const userStories = stories.filter(s => 
            (s.authorId === user.id || (!s.authorId && s.author === user.name)) && 
            s.status === 'approved'
        );
        console.log(`[DEBUG] Found ${userStories.length} stories for user ${user.name}`);

        res.json(userStories.map(s => ({
            ...s,
            createdAt: s.timestamp || s.createdAt,
            feltThisCount: s.felt_this_count || s.feltThisCount || 0
        })));
    } catch (error) {
        console.error('Get user stories error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/stories', async (req, res) => {
    try {
        const stories = await readStories();
        const approvedStories = stories.filter(s => s.status === 'approved');

        res.json(approvedStories.map(s => ({
            ...s,
            createdAt: s.timestamp || s.createdAt,
            feltThisCount: s.felt_this_count || s.feltThisCount || 0
        })));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stories' });
    }
});

app.post('/api/stories', authenticateToken, async (req, res) => {
    try {
        const storyData = req.body;
        const { image, ...rest } = storyData;

        const newStory = {
            ...rest,
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
            authorId: req.user.id, // Explicitly associate story with user ID
            images: storyData.images || (image ? [image] : []),
            image: image || null,
            status: 'approved',
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: 0,
            felt_this_count: 0
        };

        if (supabase) {
            const { error } = await supabase.from('stories').insert([newStory]);
            if (error) throw error;
        } else {
            const stories = await readStories();
            stories.push(newStory);
            await fs.writeFile(STORIES_FILE, JSON.stringify(stories, null, 2), 'utf8');
        }

        res.status(201).json({
            message: 'Story shared successfully',
            story: { ...newStory, createdAt: newStory.timestamp, feltThisCount: 0 }
        });
    } catch (error) {
        console.error('Create story error:', error);
        res.status(500).json({ message: 'Failed to submit story' });
    }
});

app.get('/api/admin/stories', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const stories = await readStories();
        res.json(stories.map(s => ({ ...s, createdAt: s.timestamp || s.createdAt, feltThisCount: s.felt_this_count || s.feltThisCount || 0 })));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stories for moderation' });
    }
});

app.put('/api/admin/stories/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

        if (supabase) {
            const { error } = await supabase
                .from('stories')
                .update({ status: status })
                .eq('id', id);
            if (error) throw error;
        } else {
            const stories = await readStories();
            const storyIndex = stories.findIndex(s => s.id === id);
            if (storyIndex === -1) return res.status(404).json({ message: 'Story not found' });

            stories[storyIndex].status = status;
            await fs.writeFile(STORIES_FILE, JSON.stringify(stories, null, 2), 'utf8');
        }

        res.json({ message: `Story ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update story status' });
    }
});

app.delete('/api/stories/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const stories = await readStories();
        const story = stories.find(s => s.id === id);
        if (!story) return res.status(404).json({ message: 'Story not found' });

        const users = await readUsers();
        const user = users.find(u => u.id === req.user.id);
        const isAdmin = user && user.role === 'admin';
        const isAuthor = story.authorId === req.user.id || story.author === req.user.name;

        if (!isAdmin && !isAuthor) return res.status(403).json({ message: 'Not authorized to delete this story' });

        if (supabase) {
            const { error } = await supabase.from('stories').delete().eq('id', id);
            if (error) throw error;
        } else {
            const filteredStories = stories.filter(s => s.id !== id);
            await fs.writeFile(STORIES_FILE, JSON.stringify(filteredStories, null, 2), 'utf8');
        }

        res.json({ message: 'Story deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete story' });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    const users = await readUsers();
    const stories = await readStories();
    
    res.json({ 
        status: 'ok', 
        storage: supabase ? 'Supabase (w/ Fallback)' : 'Local Files',
        supabaseConfigured: !!supabase,
        userCount: users.length,
        storyCount: stories.length,
        lastError: lastError,
        message: users.length > 0 ? `API is active with ${users.length} users and ${stories.length} stories` : 'API is active but data is empty'
    });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
    });
}

export default app;
