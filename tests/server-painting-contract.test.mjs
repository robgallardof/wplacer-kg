import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MAX_PIXELS_PER_REQUEST } from '../src/paint-engine.js';

const serverSource = readFileSync(new URL('../server.js', import.meta.url), 'utf8');

const countOccurrences = (source, needle) => source.split(needle).length - 1;

test('token endpoints support both /t and /token', () => {
    assert.match(serverSource, /app\.post\('\/t'/, 'Missing /t endpoint');
    assert.match(serverSource, /app\.post\('\/token'/, 'Missing /token endpoint alias');
});

test('paint batching uses a bounded chunk size', () => {
    const chunkSize = MAX_PIXELS_PER_REQUEST;
    assert.ok(Number.isInteger(chunkSize) && chunkSize > 0, 'Chunk size must be a positive integer');
    assert.ok(chunkSize <= 200, 'Chunk size should stay safely bounded to avoid oversized paint payloads');
});

test('charge consumption happens once per completed paint turn', () => {
    const consumeCalls = countOccurrences(serverSource, 'ChargeCache.consume(');
    assert.equal(consumeCalls, 1, 'Expected a single ChargeCache.consume call to avoid double-consumption bugs');
});

test('mid-batch token refresh keeps progress and rotates token', () => {
    assert.match(
        serverSource,
        /Token expired mid-batch\. Keeping progress and rotating token\./,
        'Expected explicit mid-batch refresh handling log'
    );
    assert.match(serverSource, /TokenManager\.invalidateToken\(\);/, 'Expected token invalidation when refresh is required');
});

test('paint requests include turnstile token in the payload', () => {
    assert.match(
        serverSource,
        /executePaint:\s*\(tx, ty, body\)\s*=>\s*this\._executePaint\(tx, ty,\s*\{\s*\.\.\.body,\s*t:\s*this\.token\s*\}\)/,
        'Expected paint payloads to include the current turnstile token (t)'
    );
});
