import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

function readHiddenPassword(prompt) {
    const input = process.stdin;

    return new Promise((resolve, reject) => {
        let password = '';
        let active = true;

        const finish = (error) => {
            if (!active) return;
            active = false;
            input.removeListener('data', onData);
            input.setRawMode(false);
            input.pause();
            process.stdout.write('\n');

            if (error) {
                reject(error);
            } else {
                resolve(password);
            }
        };

        const onData = (chunk) => {
            for (const character of chunk) {
                if (character === '\u0003' || character === '\u0004') {
                    finish(new Error('Password reset cancelled.'));
                    return;
                }
                if (character === '\r' || character === '\n') {
                    finish();
                    return;
                }
                if (character === '\u007f' || character === '\b') {
                    password = password.slice(0, -1);
                } else if (character.codePointAt(0) >= 32) {
                    password += character;
                }
            }
        };

        process.stdout.write(prompt);
        input.setRawMode(true);
        input.setEncoding('utf8');
        input.resume();
        input.on('data', onData);
    });
}

async function main() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Local password reset is disabled in production.');
    }
    if (!process.stdin.isTTY || !process.stdout.isTTY || typeof process.stdin.setRawMode !== 'function') {
        throw new Error('Run this command in an interactive terminal so password input is not echoed.');
    }

    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    let email;
    try {
        email = (await prompt.question('Account email: ')).trim().toLowerCase();
    } finally {
        prompt.close();
    }
    if (!email) throw new Error('Account email is required.');

    const password = await readHiddenPassword('New password (minimum 8 characters): ');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');

    const users = JSON.parse(await readFile(USERS_FILE, 'utf8'));
    if (!Array.isArray(users)) throw new Error('Local users data must be an array.');

    const user = users.find((entry) => entry.email?.trim().toLowerCase() === email);
    if (!user) throw new Error('No local account was found for that email.');

    user.password = await bcrypt.hash(password, 10);
    await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    console.log('Local password updated. Sign in with the new password.');
}

main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
});
