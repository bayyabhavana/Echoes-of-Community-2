import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'echoes-secret-key-change-in-production';
import { supabase } from './supabase.js';

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

// Helper functions using Supabase
async function readUsers() {
    if (!supabase) {
        console.error('Supabase not initialized');
        return [];
    }
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Error reading users from Supabase:', error);
        return [];
    }
    return data;
}

async function readStories() {
    if (!supabase) {
        console.error('Supabase not initialized');
        return [];
    }
    const { data, error } = await supabase.from('stories').select('*').order('timestamp', { ascending: false });
    if (error) {
        console.error('Error reading stories from Supabase:', error);
        return [];
    }
    return data;
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
    const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single();

    if (error || !user || user.role !== 'admin') {
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

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
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

        // Return with camelCase for frontend
        res.json({
            ...userWithoutPassword,
            joinedDate: user.joined_date,
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
        if (!supabase) {
            return res.status(503).json({
                message: 'Internal server error: Database connection not configured.',
                error: 'Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in server/.env'
            });
        }
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

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

        const { error } = await supabase.from('users').insert([newUser]);
        if (error) throw error;

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
        res.status(500).json({
            message: 'Internal server error during signup',
            error: error.message
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
        const { error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        if (error) throw error;

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            ...userWithoutPassword,
            joinedDate: user.joined_date
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

// Get user profile by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;

        const profile = {
            ...userWithoutPassword,
            joinedDate: user.joined_date,
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
        const updates = {};
        if (bio !== undefined) updates.bio = bio;
        if (avatar !== undefined) updates.avatar = avatar;
        if (location !== undefined) updates.location = location;
        if (website !== undefined) updates.website = website;

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json({
            ...userWithoutPassword,
            joinedDate: updatedUser.joined_date
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

// Search users
app.get('/api/users/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query is required' });

        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
            .limit(20);

        if (error) throw error;

        const results = users.map(({ password: _, ...user }) => ({
            ...user,
            joinedDate: user.joined_date,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0
        }));

        res.json(results);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Internal server error' });
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

        const { data: currentUser } = await supabase.from('users').select('following').eq('id', currentUserId).single();
        const { data: targetUser } = await supabase.from('users').select('followers').eq('id', id).single();

        if (!currentUser || !targetUser) return res.status(404).json({ message: 'User not found' });

        if (currentUser.following.includes(id)) return res.status(400).json({ message: 'Already following this user' });

        const { error: err1 } = await supabase.from('users').update({ following: [...currentUser.following, id] }).eq('id', currentUserId);
        const { error: err2 } = await supabase.from('users').update({ followers: [...targetUser.followers, currentUserId] }).eq('id', id);

        if (err1 || err2) throw err1 || err2;

        res.json({
            message: 'Successfully followed user',
            followersCount: targetUser.followers.length + 1,
            followingCount: currentUser.following.length + 1
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

        const { data: currentUser } = await supabase.from('users').select('following').eq('id', currentUserId).single();
        const { data: targetUser } = await supabase.from('users').select('followers').eq('id', id).single();

        if (!currentUser || !targetUser) return res.status(404).json({ message: 'User not found' });

        if (!currentUser.following.includes(id)) return res.status(400).json({ message: 'Not following this user' });

        const { error: err1 } = await supabase.from('users').update({ following: currentUser.following.filter(uid => uid !== id) }).eq('id', currentUserId);
        const { error: err2 } = await supabase.from('users').update({ followers: targetUser.followers.filter(uid => uid !== currentUserId) }).eq('id', id);

        if (err1 || err2) throw err1 || err2;

        res.json({
            message: 'Successfully unfollowed user',
            followersCount: targetUser.followers.length - 1,
            followingCount: currentUser.following.length - 1
        });
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================
// STORY ENDPOINTS
// ============================================

app.get('/api/stories', async (req, res) => {
    try {
        const { data: stories, error } = await supabase
            .from('stories')
            .select('*')
            .eq('status', 'approved')
            .order('timestamp', { ascending: false });

        if (error) throw error;

        res.json(stories.map(s => ({
            ...s,
            createdAt: s.timestamp,
            feltThisCount: s.felt_this_count
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
            images: storyData.images || (image ? [image] : []),
            image: image || null,
            status: 'approved',
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: 0,
            felt_this_count: 0
        };

        const { error } = await supabase.from('stories').insert([newStory]);
        if (error) throw error;

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
        const { data: stories, error } = await supabase.from('stories').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        res.json(stories.map(s => ({ ...s, createdAt: s.timestamp, feltThisCount: s.felt_this_count })));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stories for moderation' });
    }
});

app.put('/api/admin/stories/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

        const { error } = await supabase.from('stories').update({ status }).eq('id', id);
        if (error) throw error;

        res.json({ message: `Story ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update story status' });
    }
});

app.delete('/api/stories/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { data: story } = await supabase.from('stories').select('author').eq('id', id).single();
        if (!story) return res.status(404).json({ message: 'Story not found' });

        const { data: user } = await supabase.from('users').select('role').eq('id', req.user.id).single();
        const isAdmin = user && user.role === 'admin';
        const isAuthor = story.author === req.user.name;

        if (!isAdmin && !isAuthor) return res.status(403).json({ message: 'Not authorized to delete this story' });

        const { error } = await supabase.from('stories').delete().eq('id', id);
        if (error) throw error;

        res.json({ message: 'Story deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete story' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Echoes of Community API is running with Supabase' });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
    });
}

export default app;
