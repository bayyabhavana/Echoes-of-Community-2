import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
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
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const STORIES_FILE = path.join(__dirname, 'data', 'stories.json');
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'avatars');

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

// Helper function to read users from file
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users file:', error);
        return [];
    }
}

// Helper function to write users to file
async function writeUsers(users) {
    try {
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing users file:', error);
        throw error;
    }
}

// Helper function to read stories from file
async function readStories() {
    try {
        const data = await fs.readFile(STORIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        console.error('Error reading stories file:', error);
        return [];
    }
}

// Helper function to write stories to file
async function writeStories(stories) {
    try {
        await fs.writeFile(STORIES_FILE, JSON.stringify(stories, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing stories file:', error);
        throw error;
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

        if (users.find(u => u.email === email)) {
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
            joinedDate: new Date().toISOString(),
            followers: [],
            following: []
        };

        users.push(newUser);
        await writeUsers(users);

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, name: newUser.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            ...userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        const users = await readUsers();
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        users[userIndex].password = hashedPassword;

        await writeUsers(users);

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
        res.json(userWithoutPassword);
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
        const users = await readUsers();
        const user = users.find(u => u.id === id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;

        // Add follower/following counts
        const profile = {
            ...userWithoutPassword,
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

        // Verify user is updating their own profile
        if (req.user.id !== id) {
            return res.status(403).json({ message: 'You can only update your own profile' });
        }

        const { bio, avatar, location, website } = req.body;
        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update only allowed fields
        if (bio !== undefined) users[userIndex].bio = bio;
        if (avatar !== undefined) users[userIndex].avatar = avatar;
        if (location !== undefined) users[userIndex].location = location;
        if (website !== undefined) users[userIndex].website = website;

        await writeUsers(users);

        const { password: _, ...userWithoutPassword } = users[userIndex];
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================
// FILE UPLOAD ENDPOINTS
// ============================================

// Upload avatar
app.post('/api/upload/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Generate the URL for the uploaded file
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

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const users = await readUsers();
        const searchTerm = q.toLowerCase();

        const results = users
            .filter(u =>
                u.name.toLowerCase().includes(searchTerm) ||
                u.email.toLowerCase().includes(searchTerm)
            )
            .map(({ password: _, ...user }) => ({
                ...user,
                followersCount: user.followers?.length || 0,
                followingCount: user.following?.length || 0
            }))
            .slice(0, 20); // Limit to 20 results

        res.json(results);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================
// FOLLOW/UNFOLLOW ENDPOINTS
// ============================================

// Follow a user
app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        if (currentUserId === id) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const users = await readUsers();
        const currentUserIndex = users.findIndex(u => u.id === currentUserId);
        const targetUserIndex = users.findIndex(u => u.id === id);

        if (currentUserIndex === -1 || targetUserIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize arrays if they don't exist
        if (!users[currentUserIndex].following) users[currentUserIndex].following = [];
        if (!users[targetUserIndex].followers) users[targetUserIndex].followers = [];

        // Check if already following
        if (users[currentUserIndex].following.includes(id)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Add to following and followers lists
        users[currentUserIndex].following.push(id);
        users[targetUserIndex].followers.push(currentUserId);

        await writeUsers(users);

        res.json({
            message: 'Successfully followed user',
            followersCount: users[targetUserIndex].followers.length,
            followingCount: users[currentUserIndex].following.length
        });
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Unfollow a user
app.delete('/api/users/:id/unfollow', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        const users = await readUsers();
        const currentUserIndex = users.findIndex(u => u.id === currentUserId);
        const targetUserIndex = users.findIndex(u => u.id === id);

        if (currentUserIndex === -1 || targetUserIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize arrays if they don't exist
        if (!users[currentUserIndex].following) users[currentUserIndex].following = [];
        if (!users[targetUserIndex].followers) users[targetUserIndex].followers = [];

        // Check if not following
        if (!users[currentUserIndex].following.includes(id)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        // Remove from following and followers lists
        users[currentUserIndex].following = users[currentUserIndex].following.filter(uid => uid !== id);
        users[targetUserIndex].followers = users[targetUserIndex].followers.filter(uid => uid !== currentUserId);

        await writeUsers(users);

        res.json({
            message: 'Successfully unfollowed user',
            followersCount: users[targetUserIndex].followers.length,
            followingCount: users[currentUserIndex].following.length
        });
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get followers list
app.get('/api/users/:id/followers', async (req, res) => {
    try {
        const { id } = req.params;
        const users = await readUsers();
        const user = users.find(u => u.id === id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const followerIds = user.followers || [];
        const followers = users
            .filter(u => followerIds.includes(u.id))
            .map(({ password: _, ...user }) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio
            }));

        res.json(followers);
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get following list
app.get('/api/users/:id/following', async (req, res) => {
    try {
        const { id } = req.params;
        const users = await readUsers();
        const user = users.find(u => u.id === id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const followingIds = user.following || [];
        const following = users
            .filter(u => followingIds.includes(u.id))
            .map(({ password: _, ...user }) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio
            }));

        res.json(following);
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================
// STORY MODERATION ENDPOINTS
// ============================================

// Get all approved stories
app.get('/api/stories', async (req, res) => {
    try {
        const stories = await readStories();
        const approvedStories = stories.filter(s => s.status === 'approved');
        res.json(approvedStories);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stories' });
    }
});

// Post multiple stories at once
app.post('/api/stories/bulk', authenticateToken, async (req, res) => {
    try {
        const storiesData = req.body;
        if (!Array.isArray(storiesData)) {
            return res.status(400).json({ message: 'Request body must be an array of stories' });
        }

        const stories = await readStories();
        const newStories = storiesData.map(storyData => {
            const { image, ...rest } = storyData;
            return {
                ...rest,
                images: storyData.images || (image ? [image] : []),
                id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
                status: 'approved',
                createdAt: new Date().toISOString(),
                likes: 0,
                comments: 0,
                feltThisCount: 0
            };
        });

        stories.unshift(...newStories);
        await writeStories(stories);

        res.status(201).json({
            message: `${newStories.length} stories shared successfully`,
            stories: newStories
        });
    } catch (error) {
        console.error('Bulk submission error:', error);
        res.status(500).json({ message: 'Failed to submit stories' });
    }
});

// Post a new story (pending moderation)
app.post('/api/stories', authenticateToken, async (req, res) => {
    try {
        const storyData = req.body;
        const stories = await readStories();

        const { image, ...rest } = storyData;
        const newStory = {
            ...rest,
            images: storyData.images || (image ? [image] : []),
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
            status: 'approved',
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            feltThisCount: 0
        };

        stories.unshift(newStory);
        await writeStories(stories);

        res.status(201).json({
            message: 'Story shared successfully',
            story: newStory
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit story' });
    }
});

// Get all stories for admin moderation
app.get('/api/admin/stories', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const stories = await readStories();
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stories for moderation' });
    }
});

// Approve or reject a story
app.put('/api/admin/stories/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const stories = await readStories();
        const storyIndex = stories.findIndex(s => s.id === id);

        if (storyIndex === -1) {
            return res.status(404).json({ message: 'Story not found' });
        }

        stories[storyIndex].status = status;
        await writeStories(stories);

        res.json({ message: `Story ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update story status' });
    }
});

// Delete a story (admin or owner)
app.delete('/api/stories/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const stories = await readStories();
        const storyIndex = stories.findIndex(s => s.id === id);

        if (storyIndex === -1) {
            return res.status(404).json({ message: 'Story not found' });
        }

        const users = await readUsers();
        const currentUser = users.find(u => u.id === req.user.id);

        // Allow if admin or the author (if author info matches)
        const isAuthor = stories[storyIndex].author === req.user.name;
        const isAdmin = currentUser && currentUser.role === 'admin';

        if (!isAdmin && !isAuthor) {
            return res.status(403).json({ message: 'Not authorized to delete this story' });
        }

        stories.splice(storyIndex, 1);
        await writeStories(stories);

        res.json({ message: 'Story deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete story' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Echoes of Community API is running' });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
    });
}

export default app;
