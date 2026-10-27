import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeStories, toSupabaseStory } from './story-store.js';

test('preserves local stories alongside remote stories', () => {
    const remote = [{ id: 'remote', timestamp: '2026-01-01T00:00:00.000Z' }];
    const local = [{ id: 'local', timestamp: '2026-01-02T00:00:00.000Z' }];

    assert.deepEqual(mergeStories(remote, local), [local[0], remote[0]]);
});

test('does not duplicate stories that are already remote', () => {
    const remote = [{ id: 'same', title: 'Remote version' }];
    const local = [{ id: 'same', title: 'Local version' }];

    assert.deepEqual(mergeStories(remote, local), remote);
});

test('only sends supported story columns to Supabase', () => {
    assert.deepEqual(
        toSupabaseStory({ id: 'one', title: 'A story', videoUrl: 'data:video', location: { name: 'Here' } }),
        { id: 'one', title: 'A story' }
    );
});
