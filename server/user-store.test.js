import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeUsers, normalizeEmail } from './user-store.js';

test('keeps accounts created locally when remote users exist', () => {
    const remoteUsers = [{ id: 'remote-1', email: 'remote@example.com' }];
    const localUsers = [
        { id: 'local-1', email: 'local@example.com', password: 'local-hash' }
    ];

    assert.deepEqual(mergeUsers(remoteUsers, localUsers), [...remoteUsers, ...localUsers]);
});

test('uses the local password hash for a matching account', () => {
    const remoteUsers = [
        { id: 'remote-1', email: 'person@example.com', password: 'old-remote-hash', name: 'Remote name' }
    ];
    const localUsers = [
        { id: 'local-1', email: ' PERSON@example.com ', password: 'new-local-hash' }
    ];

    assert.deepEqual(mergeUsers(remoteUsers, localUsers), [
        { ...remoteUsers[0], ...localUsers[0] }
    ]);
});

test('matches email addresses case-insensitively and ignores duplicate local accounts', () => {
    const remoteUsers = [{ id: 'same-id', email: 'person@example.com' }];
    const localUsers = [
        { id: 'same-id', email: 'PERSON@example.com', password: 'local-hash' },
        { id: 'other-id', email: ' Person@example.com ', password: 'duplicate-hash' }
    ];

    assert.deepEqual(mergeUsers(remoteUsers, localUsers), [
        { ...remoteUsers[0], ...localUsers[0] }
    ]);
    assert.equal(normalizeEmail(' Person@Example.com '), 'person@example.com');
});
