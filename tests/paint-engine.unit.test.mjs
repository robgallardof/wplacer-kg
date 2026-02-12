import test from 'node:test';
import assert from 'node:assert/strict';

import { MAX_PIXELS_PER_REQUEST, groupPixelsByTile, chunkTilePayload, buildPaintChunks } from '../src/paint-engine.js';

test('groupPixelsByTile agrupa pixeles por tile y preserva orden', () => {
    const grouped = groupPixelsByTile([
        { tx: 1, ty: 2, px: 10, py: 11, color: 7 },
        { tx: 1, ty: 2, px: 12, py: 13, color: 8 },
        { tx: 3, ty: 4, px: 20, py: 21, color: 9 },
    ]);

    assert.equal(grouped.length, 2);
    assert.deepEqual(grouped[0], {
        tx: 1,
        ty: 2,
        colors: [7, 8],
        coords: [10, 11, 12, 13],
    });
    assert.deepEqual(grouped[1], {
        tx: 3,
        ty: 4,
        colors: [9],
        coords: [20, 21],
    });
});

test('chunkTilePayload fragmenta colores y coords de forma consistente', () => {
    const chunks = chunkTilePayload(
        {
            tx: 4,
            ty: 5,
            colors: [1, 2, 3, 4, 5],
            coords: [0, 0, 1, 0, 2, 0, 3, 0, 4, 0],
        },
        2
    );

    assert.deepEqual(chunks, [
        { tx: 4, ty: 5, colors: [1, 2], coords: [0, 0, 1, 0] },
        { tx: 4, ty: 5, colors: [3, 4], coords: [2, 0, 3, 0] },
        { tx: 4, ty: 5, colors: [5], coords: [4, 0] },
    ]);
});

test('MAX_PIXELS_PER_REQUEST se mantiene dentro de un rango seguro', () => {
    assert.ok(Number.isInteger(MAX_PIXELS_PER_REQUEST));
    assert.ok(MAX_PIXELS_PER_REQUEST > 0);
    assert.ok(MAX_PIXELS_PER_REQUEST <= 200);
});

test('buildPaintChunks produce chunks listos para ejecutar', () => {
    const chunks = buildPaintChunks(
        [
            { tx: 9, ty: 9, px: 1, py: 1, color: 10 },
            { tx: 9, ty: 9, px: 2, py: 1, color: 11 },
            { tx: 8, ty: 9, px: 1, py: 1, color: 12 },
        ],
        1
    );

    assert.deepEqual(chunks, [
        { tx: 9, ty: 9, colors: [10], coords: [1, 1] },
        { tx: 9, ty: 9, colors: [11], coords: [2, 1] },
        { tx: 8, ty: 9, colors: [12], coords: [1, 1] },
    ]);
});
