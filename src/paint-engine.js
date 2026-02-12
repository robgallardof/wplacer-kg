export const MAX_PIXELS_PER_REQUEST = 120;

export const groupPixelsByTile = (pixels) => {
    const byTile = new Map();

    for (const pixel of pixels) {
        const key = `${pixel.tx},${pixel.ty}`;
        if (!byTile.has(key)) {
            byTile.set(key, { tx: pixel.tx, ty: pixel.ty, colors: [], coords: [] });
        }
        const tile = byTile.get(key);
        tile.colors.push(pixel.color);
        tile.coords.push(pixel.px, pixel.py);
    }

    return [...byTile.values()];
};

export const chunkTilePayload = (tilePayload, maxPixelsPerRequest = MAX_PIXELS_PER_REQUEST) => {
    const chunks = [];

    for (let i = 0; i < tilePayload.colors.length; i += maxPixelsPerRequest) {
        const colors = tilePayload.colors.slice(i, i + maxPixelsPerRequest);
        const coords = tilePayload.coords.slice(i * 2, (i + colors.length) * 2);
        chunks.push({ tx: tilePayload.tx, ty: tilePayload.ty, colors, coords });
    }

    return chunks;
};

export const buildPaintChunks = (pixels, maxPixelsPerRequest = MAX_PIXELS_PER_REQUEST) =>
    groupPixelsByTile(pixels).flatMap((tilePayload) => chunkTilePayload(tilePayload, maxPixelsPerRequest));


export const runPaintChunks = async ({
    chunks,
    token,
    fingerprint,
    executePaint,
    onTokenRefresh,
    onNoCharges,
    onInterrupted,
}) => {
    let total = 0;

    for (const chunk of chunks) {
        const body = { colors: chunk.colors, coords: chunk.coords, t: token };
        if (fingerprint) body.fp = fingerprint;

        let result;
        try {
            result = await executePaint(chunk.tx, chunk.ty, body);
        } catch (error) {
            if (error?.message === 'REFRESH_TOKEN') {
                onTokenRefresh?.();
                return { total, status: 'token_refresh' };
            }
            if (total > 0) {
                onInterrupted?.(total, error);
                return { total, status: 'interrupted' };
            }
            throw error;
        }

        if (!result.success && result.reason === 'NO_CHARGES') {
            onNoCharges?.();
            return { total, status: 'no_charges' };
        }

        total += result.painted;
        if (result.partial) return { total, status: 'partial' };
    }

    return { total, status: 'completed' };
};
