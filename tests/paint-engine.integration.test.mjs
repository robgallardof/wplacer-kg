import test from 'node:test';
import assert from 'node:assert/strict';

import { runPaintChunks } from '../src/paint-engine.js';

test('runPaintChunks conserva progreso y rota token cuando expira en mitad del lote', async () => {
    const events = [];
    const result = await runPaintChunks({
        chunks: [
            { tx: 1, ty: 1, colors: [1], coords: [0, 0] },
            { tx: 1, ty: 1, colors: [2], coords: [1, 0] },
        ],
        token: 'abc',
        executePaint: async (_tx, _ty, body) => {
            if (body.colors[0] === 1) return { painted: 1, success: true };
            throw new Error('REFRESH_TOKEN');
        },
        onTokenRefresh: () => events.push('token_refresh'),
    });

    assert.equal(result.total, 1);
    assert.equal(result.status, 'token_refresh');
    assert.deepEqual(events, ['token_refresh']);
});

test('runPaintChunks detiene el flujo al recibir no_charges', async () => {
    const events = [];
    const result = await runPaintChunks({
        chunks: [{ tx: 2, ty: 3, colors: [9], coords: [3, 7] }],
        token: 'abc',
        executePaint: async () => ({ painted: 0, success: false, reason: 'NO_CHARGES' }),
        onNoCharges: () => events.push('no_charges'),
    });

    assert.equal(result.total, 0);
    assert.equal(result.status, 'no_charges');
    assert.deepEqual(events, ['no_charges']);
});
