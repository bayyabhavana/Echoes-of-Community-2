import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'users.json');
const SALT_ROUNDS = 10;

// Read existing users
const users = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// Hash passwords for all users
async function migratePasswords() {
    console.log('Starting password migration...');

    for (let user of users) {
        // Check if password is already hashed (bcrypt hashes start with $2b$)
        if (!user.password.startsWith('$2b$')) {
            console.log(`Hashing password for user: ${user.email}`);
            user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        } else {
            console.log(`Password already hashed for user: ${user.email}`);
        }
    }

    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
    console.log('Password migration completed!');
    console.log(`Total users migrated: ${users.length}`);
}

migratePasswords().catch(console.error);
