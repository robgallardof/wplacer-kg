// --- Global error handler for listen EACCES ---
process.on('uncaughtException', (err) => {
    if (err && err.code === 'EACCES' && /listen/i.test(err.message)) {
        // Try to extract port from error message
        let port = '';
        const match = err.message.match(/:(\d+)/);
        if (match) port = match[1];
        console.error(`\n❌ Permission denied for port${port ? ' ' + port : ''}.\nYou do not have permission to bind to this port.${port ? ' (' + port + ')' : ''}\nPlease use a different port (e.g., 3000) or run with elevated privileges.\n`);
        process.exit(1);
    }
    throw err;
});
import { existsSync, readFileSync, writeFileSync, mkdirSync, createWriteStream, unlinkSync } from 'node:fs';
import { Image, createCanvas } from 'canvas';
import { execSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CookieJar } from 'tough-cookie';
import gradient from 'gradient-string';
import express from 'express';
import { Impit } from 'impit';
import path from 'node:path';
import cors from 'cors';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { MAX_PIXELS_PER_REQUEST, buildPaintChunks, runPaintChunks } from './src/paint-engine.js';

// --- WebSocket for logs ---
import { WebSocketServer } from 'ws';
import { watch } from 'node:fs';

// ---------- Runtime constants ----------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_HOST = '0.0.0.0';
const APP_PRIMARY_PORT = Number(process.env.PORT) || 80;
const APP_FALLBACK_PORTS = [
    3000,
    5173,
    8080,
    8000,
    5000,
    7000,
    4200,
    5500,
    ...Array.from({ length: 50 }, (_, i) => 3001 + i),
];

const WPLACE_BASE = 'https://backend.wplace.live';
const WPLACE_FILES = `${WPLACE_BASE}/files/s0`;
const WPLACE_ME = `${WPLACE_BASE}/me`;
const WPLACE_PIXEL = (tx, ty) => `${WPLACE_BASE}/s0/pixel/${tx}/${ty}`;
const WPLACE_PURCHASE = `${WPLACE_BASE}/purchase`;
const TILE_URL = (tx, ty) => `${WPLACE_FILES}/tiles/${tx}/${ty}.png`;

const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const TEMPLATES_PATH = path.join(DATA_DIR, 'templates.json');
const AUTO_LOGIN_DIR = path.join(__dirname, 'AUTO_LOGIN');
const AUTO_LOGIN_REQUIREMENTS = path.join(AUTO_LOGIN_DIR, 'requirements.txt');
const AUTO_LOGIN_PROXIES = path.join(AUTO_LOGIN_DIR, 'proxies.txt');
const AUTO_LOGIN_WEBSHARE_CONFIG = path.join(AUTO_LOGIN_DIR, 'webshare_config.json');
const AUTO_LOGIN_PROXY_DB = path.join(AUTO_LOGIN_DIR, 'proxy_pool.db');
const CAMOUFOX_FLEET_SCRIPT = path.join(AUTO_LOGIN_DIR, 'camoufox_fleet.py');

const JSON_LIMIT = '50mb';

const MS = {
    QUARTER_SEC: 250,
    TWO_SEC: 2_000,
    THIRTY_SEC: 30_000,
    TWO_MIN: 120_000,
    FIVE_MIN: 300_000,
    FORTY_SEC: 40_000,
    ONE_HOUR: 3600_000,
};

const HTTP_STATUS = {
    OK: 200,
    BAD_REQ: 400,
    UNAUTH: 401,
    FORBIDDEN: 403,
    TOO_MANY: 429,
    UNAVAILABLE_LEGAL: 451,
    SRV_ERR: 500,
    BAD_GATEWAY: 502,
    CONFLICT: 409,
};

// ---------- FS bootstrap ----------

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
const LOGS_FILE = path.join(DATA_DIR, 'logs.log');
const ERRORS_FILE = path.join(DATA_DIR, 'errors.log');
for (const file of [LOGS_FILE, ERRORS_FILE]) {
    if (!existsSync(file)) writeFileSync(file, '', { flag: 'w' });
}

// Async write streams avoid blocking the event loop per log write.
const logsStream = createWriteStream(LOGS_FILE, { flags: 'a' });
const errorsStream = createWriteStream(ERRORS_FILE, { flags: 'a' });

/**
 * Structured logger.
 * Uses async streams for better runtime performance under heavy logging.
 */
const log = async (id, name, data, error) => {
    const ts = new Date().toLocaleString();
    const who = `(${name}#${id})`;
    if (error) {
        const line = `[${ts}] ${who} ${data}: ${error.stack || error.message}\n`;
        console.error(`[${ts}] ${who} ${data}:`, error);
        errorsStream.write(line);
    } else {
        const line = `[${ts}] ${who} ${data}\n`;
        console.log(`[${ts}] ${who} ${data}`);
        logsStream.write(line);
    }
};

// --- WebSocket broadcast helpers ---
let wsLogServer = null;
let wsClients = { logs: new Set(), errors: new Set() };

function broadcastLog(type, line) {
    for (const ws of wsClients[type]) {
        if (ws.readyState === ws.OPEN) {
            ws.send(line);
        }
    }
}

// ---------- Small utilities ----------


/** Human-readable duration. */
const duration = (ms) => {
    if (ms <= 0) return '0s';
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60) % 60;
    const h = Math.floor(s / 3600);
    return [h ? `${h}h` : '', m ? `${m}m` : '', `${s % 60}s`].filter(Boolean).join(' ');
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Errors ----------

class SuspensionError extends Error {
    constructor(message, durationMs) {
        super(message);
        this.name = 'SuspensionError';
        this.durationMs = durationMs;
        this.suspendedUntil = Date.now() + durationMs;
    }
}
class NetworkError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NetworkError';
    }
}

// ---------- palette ----------

const palette = {
    '0,0,0': 1, '60,60,60': 2, '120,120,120': 3, '210,210,210': 4, '255,255,255': 5,
    '96,0,24': 6, '237,28,36': 7, '255,127,39': 8, '246,170,9': 9, '249,221,59': 10,
    '255,250,188': 11, '14,185,104': 12, '19,230,123': 13, '135,255,94': 14, '12,129,110': 15,
    '16,174,166': 16, '19,225,190': 17, '40,80,158': 18, '64,147,228': 19, '96,247,242': 20,
    '107,80,246': 21, '153,177,251': 22, '120,12,153': 23, '170,56,185': 24, '224,159,249': 25,
    '203,0,122': 26, '236,31,128': 27, '243,141,169': 28, '104,70,52': 29, '149,104,42': 30,
    '248,178,119': 31, '170,170,170': 32, '165,14,30': 33, '250,128,114': 34, '228,92,26': 35,
    '214,181,148': 36, '156,132,49': 37, '197,173,49': 38, '232,212,95': 39, '74,107,58': 40,
    '90,148,74': 41, '132,197,115': 42, '15,121,159': 43, '187,250,242': 44, '125,199,255': 45,
    '77,49,184': 46, '74,66,132': 47, '122,113,196': 48, '181,174,241': 49, '219,164,99': 50,
    '209,128,81': 51, '255,197,165': 52, '155,82,73': 53, '209,128,120': 54, '250,182,164': 55,
    '123,99,82': 56, '156,132,107': 57, '51,57,65': 58, '109,117,141': 59, '179,185,209': 60,
    '109,100,63': 61, '148,140,107': 62, '205,197,158': 63,
};
const VALID_COLOR_IDS = new Set([-1, 0, ...Object.values(palette)]);
const COLOR_NAMES = {
    1: 'Black', 2: 'Dark Gray', 3: 'Gray', 4: 'Light Gray', 5: 'White',
    6: 'Dark Red', 7: 'Red', 8: 'Orange', 9: 'Light Orange', 10: 'Yellow', 11: 'Light Yellow',
    12: 'Dark Green', 13: 'Green', 14: 'Light Green', 15: 'Dark Teal', 16: 'Teal', 17: 'Light Teal',
    18: 'Dark Blue', 19: 'Blue', 20: 'Light Blue', 21: 'Indigo', 22: 'Periwinkle',
    23: 'Dark Purple', 24: 'Purple', 25: 'Lavender', 26: 'Dark Pink', 27: 'Pink', 28: 'Light Pink',
    29: 'Dark Brown', 30: 'Brown', 31: 'Light Brown',
    32: '★ Gray', 33: '★ Maroon', 34: '★ Salmon', 35: '★ Burnt Orange', 36: '★ Tan',
    37: '★ Dark Gold', 38: '★ Gold', 39: '★ Light Gold', 40: '★ Olive', 41: '★ Forest Green',
    42: '★ Lime Green', 43: '★ Dark Aqua', 44: '★ Cyan', 45: '★ Sky Blue', 46: '★ Royal Blue',
    47: '★ Navy', 48: '★ Light Purple', 49: '★ Lilac', 50: '★ Ochre', 51: '★ Terracotta',
    52: '★ Peach', 53: '★ Dark Rose', 54: '★ Rose', 55: '★ Light Rose', 56: '★ Taupe',
    57: '★ Light Taupe', 58: '★ Charcoal', 59: '★ Slate', 60: '★ Light Slate', 61: '★ Khaki',
    62: '★ Light Khaki', 63: '★ Beige'
};

// ---------- Charge prediction cache ----------

const ChargeCache = {
    _m: new Map(),
    REGEN_MS: 30_000,
    SYNC_MS: 8 * 60_000,

    _intFromAny(...candidates) {
        for (const value of candidates) {
            const n = Number(value);
            if (Number.isFinite(n) && n >= 0) return Math.floor(n);
        }
        return null;
    },

    _extractFromUserInfo(userInfo) {
        const charges = userInfo?.charges;
        const count = this._intFromAny(
            charges?.count,
            charges?.available,
            charges?.current,
            charges?.value,
            userInfo?.chargeCount,
            userInfo?.chargesCount,
            userInfo?.availableCharges,
            typeof charges === 'number' ? charges : null
        ) ?? 0;

        const max = this._intFromAny(
            charges?.max,
            charges?.capacity,
            charges?.maxCount,
            userInfo?.chargeMax,
            userInfo?.maxCharges,
            userInfo?.chargesMax,
            userInfo?.maxCharge
        ) ?? 0;

        let sanitizedMax = max;
        if (sanitizedMax <= 0 && count > 0) sanitizedMax = count;
        if (sanitizedMax <= 0) sanitizedMax = 1;

        let sanitizedCount = count;
        if (count > sanitizedMax) {
            console.log(`[ChargeCache] Correcting optimistic charge count for user ${userInfo?.id}. Server sent ${count}, capping to max ${sanitizedMax}.`);
            sanitizedCount = sanitizedMax;
        }

        return { count: sanitizedCount, max: sanitizedMax };
    },

    _key(id) {
        return String(id);
    },
    has(id) {
        return this._m.has(this._key(id));
    },
    stale(id, now = Date.now()) {
        const u = this._m.get(this._key(id));
        if (!u) return true;
        return now - u.lastSync > this.SYNC_MS;
    },
    markFromUserInfo(userInfo, now = Date.now()) {
        if (!userInfo?.id) return;
        const k = this._key(userInfo.id);
        const parsed = this._extractFromUserInfo(userInfo);
        this._m.set(k, { base: parsed.count, max: parsed.max, lastSync: now });
    },
    predict(id, now = Date.now()) {
        const u = this._m.get(this._key(id));
        if (!u) return null;
        const grown = Math.floor((now - u.lastSync) / this.REGEN_MS);
        const count = Math.min(u.max, u.base + Math.max(0, grown));
        return { count, max: u.max, cooldownMs: this.REGEN_MS };
    },
    consume(id, n = 1, now = Date.now()) {
        const k = this._key(id);
        const u = this._m.get(k);
        if (!u) return;
        const grown = Math.floor((now - u.lastSync) / this.REGEN_MS);
        const avail = Math.min(u.max, u.base + Math.max(0, grown));
        const newCount = Math.max(0, avail - n);
        u.base = newCount;
        // align to last regen tick
        u.lastSync = now - ((now - u.lastSync) % this.REGEN_MS);
        this._m.set(k, u);
    },
    forceResync(id, newCount = 0, now = Date.now()) {
        const k = this._key(id);
        const u = this._m.get(k) || { max: 0 }; // Get existing or create a shell
        u.base = newCount;
        u.lastSync = now; // Reset the timer from this exact moment
        this._m.set(k, u);
    },
};

// ---------- Proxy loader ----------

let loadedProxies = [];

const loadProxies = () => {
    const proxyPath = path.join(DATA_DIR, 'proxies.txt');
    if (!existsSync(proxyPath)) {
        writeFileSync(proxyPath, '');
        console.log('[SYSTEM] `data/proxies.txt` not found, created an empty one.');
        loadedProxies = [];
        return;
    }

    const raw = readFileSync(proxyPath, 'utf8');
    const lines = raw
        .split(/\r?\n/)
        .map((l) => l.replace(/\s+#.*$|\s+\/\/.*$|^\s*#.*$|^\s*\/\/.*$/g, '').trim())
        .filter(Boolean);

    const protoMap = new Map([
        ['http', 'http'],
        ['https', 'https'],
        ['socks4', 'socks4'],
        ['socks5', 'socks5'],
    ]);

    const inRange = (p) => Number.isInteger(p) && p >= 1 && p <= 65535;
    const looksHostname = (h) => !!h && /^[a-z0-9-._[\]]+$/i.test(h);

    const parseOne = (line) => {
        // url-like: scheme://user:pass@host:port
        const urlLike = line.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.+)$/);
        if (urlLike) {
            const scheme = urlLike[1].toLowerCase();
            const protocol = protoMap.get(scheme);
            if (!protocol) return null;
            try {
                const u = new URL(line);
                const host = u.hostname;
                const port = u.port ? parseInt(u.port, 10) : NaN;
                const username = decodeURIComponent(u.username || '');
                const password = decodeURIComponent(u.password || '');
                if (!looksHostname(host) || !inRange(port)) return null;
                return { protocol, host, port, username, password };
            } catch {
                return null;
            }
        }
        // user:pass@host:port
        const authHost = line.match(/^([^:@\s]+):([^@\s]+)@(.+)$/);
        if (authHost) {
            const username = authHost[1],
                password = authHost[2],
                rest = authHost[3];
            const m6 = rest.match(/^\[([^\]]+)\]:(\d+)$/),
                m4 = rest.match(/^([^:\s]+):(\d+)$/);
            let host = '',
                port = NaN;
            if (m6) {
                host = m6[1];
                port = parseInt(m6[2], 10);
            } else if (m4) {
                host = m4[1];
                port = parseInt(m4[2], 10);
            } else return null;
            if (!looksHostname(host) || !inRange(port)) return null;
            return { protocol: 'http', host, port, username, password };
        }
        // [ipv6]:port
        const bare6 = line.match(/^\[([^\]]+)\]:(\d+)$/);
        if (bare6) {
            const host = bare6[1],
                port = parseInt(bare6[2], 10);
            if (!inRange(port)) return null;
            return { protocol: 'http', host, port, username: '', password: '' };
        }
        // host:port
        const bare = line.match(/^([^:\s]+):(\d+)$/);
        if (bare) {
            const host = bare[1],
                port = parseInt(bare[2], 10);
            if (!looksHostname(host) || !inRange(port)) return null;
            return { protocol: 'http', host, port, username: '', password: '' };
        }
        // user:pass:host:port
        const uphp = line.split(':');
        if (uphp.length === 4 && /^\d+$/.test(uphp[3])) {
            const [username, password, host, portStr] = uphp;
            const port = parseInt(portStr, 10);
            if (looksHostname(host) && inRange(port)) return { protocol: 'http', host, port, username, password };
        }
        return null;
    };

    const seen = new Set();
    const proxies = [];
    for (const line of lines) {
        const p = parseOne(line);
        if (!p) {
            console.log(`[SYSTEM] ⚠️ WARNING: Invalid proxy skipped: "${line}"`);
            continue;
        }
        const key = `${p.protocol}://${p.username}:${p.password}@${p.host}:${p.port}`;
        if (seen.has(key)) continue;
        seen.add(key);
        proxies.push(p);
    }
    loadedProxies = proxies;
};

let nextProxyIndex = 0;
const getNextProxy = () => {
    const { proxyEnabled, proxyRotationMode } = currentSettings;
    if (!proxyEnabled || loadedProxies.length === 0) return null;
    let proxy;
    if (proxyRotationMode === 'random') {
        proxy = loadedProxies[Math.floor(Math.random() * loadedProxies.length)];
    } else {
        proxy = loadedProxies[nextProxyIndex];
        nextProxyIndex = (nextProxyIndex + 1) % loadedProxies.length;
    }
    let proxyUrl = `${proxy.protocol}://`;
    if (proxy.username && proxy.password) {
        proxyUrl += `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@`;
    }
    proxyUrl += `${proxy.host}:${proxy.port}`;
    return proxyUrl;
};

const pickProxyForIndex = (idx) => {
    if (!currentSettings.proxyEnabled || loadedProxies.length === 0) return null;
    const selected = currentSettings.proxyRotationMode === 'random'
        ? loadedProxies[Math.floor(Math.random() * loadedProxies.length)]
        : loadedProxies[idx % loadedProxies.length];

    let proxyUrl = `${selected.protocol}://`;
    if (selected.username && selected.password) {
        proxyUrl += `${encodeURIComponent(selected.username)}:${encodeURIComponent(selected.password)}@`;
    }
    proxyUrl += `${selected.host}:${selected.port}`;
    return proxyUrl;
};

const makeCamoufoxCookie = (cookie) => {
    if (!cookie || !cookie.name || !cookie.value) return null;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    let expires = Number.isFinite(cookie.expirationDate)
        ? Math.floor(cookie.expirationDate > 10_000_000_000 ? cookie.expirationDate / 1000 : cookie.expirationDate)
        : nowInSeconds + 365 * 24 * 60 * 60;

    if (expires <= nowInSeconds) expires = nowInSeconds + 365 * 24 * 60 * 60;

    return {
        name: String(cookie.name),
        value: String(cookie.value),
        domain: cookie.domain || '.wplace.live',
        path: cookie.path || '/',
        secure: cookie.secure !== false,
        httpOnly: cookie.httpOnly !== false,
        sameSite: cookie.sameSite || 'Lax',
        expires,
    };
};

const makeCamoufoxFleetPayload = (userIds) => {
    const unique = [...new Set(userIds)].filter((uid) => users[uid]);
    return unique.map((uid, idx) => ({
        userId: uid,
        name: users[uid]?.name || uid,
        proxy: pickProxyForIndex(idx),
        cookies: (users[uid]?.cookieObjects || normalizeCookiesForJar(users[uid]?.cookies || [])).map(makeCamoufoxCookie).filter(Boolean),
    }));
};

class CamoufoxFleetManager {
    constructor() {
        this.proc = null;
        this.userKey = '';
        this.payloadPath = null;
    }

    _cleanupPayload() {
        if (!this.payloadPath) return;
        try { unlinkSync(this.payloadPath); } catch {}
        this.payloadPath = null;
    }

    async stop() {
        if (!this.proc) return;
        const proc = this.proc;
        this.proc = null;
        this.userKey = '';
        this._cleanupPayload();

        await new Promise((resolve) => {
            const timer = setTimeout(() => {
                try { proc.kill('SIGKILL'); } catch {}
                resolve();
            }, 3000);

            proc.once('exit', () => {
                clearTimeout(timer);
                resolve();
            });

            try { proc.kill('SIGTERM'); } catch {
                clearTimeout(timer);
                resolve();
            }
        });

        log('SYSTEM', 'Camoufox', '🛑 Camoufox fleet stopped.');
    }

    async ensureForUsers(userIds) {
        const payload = makeCamoufoxFleetPayload(userIds);
        const key = payload.map((u) => `${u.userId}|${u.proxy || '-'}`).sort().join(',');

        if (!payload.length) {
            await this.stop();
            return;
        }

        if (!existsSync(CAMOUFOX_FLEET_SCRIPT)) {
            log('SYSTEM', 'Camoufox', `⚠️ Camoufox script missing: ${CAMOUFOX_FLEET_SCRIPT}`);
            return;
        }

        if (this.proc && this.userKey === key && !this.proc.killed) return;

        await this.stop();

        const payloadPath = path.join(os.tmpdir(), `wplacer-camoufox-${randomUUID()}.json`);
        writeFileSync(payloadPath, JSON.stringify({ users: payload }, null, 2));
        this.payloadPath = payloadPath;

        const proc = spawn('python', [CAMOUFOX_FLEET_SCRIPT, '--payload', payloadPath], {
            stdio: ['ignore', 'pipe', 'pipe'],
            cwd: __dirname,
        });

        proc.stdout.on('data', (chunk) => {
            const text = String(chunk).trim();
            if (text) log('SYSTEM', 'Camoufox', text);
        });
        proc.stderr.on('data', (chunk) => {
            const text = String(chunk).trim();
            if (text) log('SYSTEM', 'Camoufox', `stderr: ${text}`);
        });
        proc.on('exit', (code) => {
            const unexpected = this.proc === proc;
            if (unexpected) {
                this.proc = null;
                this.userKey = '';
                this._cleanupPayload();
            }
            log('SYSTEM', 'Camoufox', `Fleet process exited with code ${code}.`);
        });

        this.proc = proc;
        this.userKey = key;
        log('SYSTEM', 'Camoufox', `🚀 Camoufox fleet started for ${payload.length} user(s).`);
    }
}

const camoufoxFleetManager = new CamoufoxFleetManager();

const getActiveTemplateUserIds = () => {
    const ids = [];
    for (const templateId in templates) {
        if (!templates[templateId]?.running) continue;
        ids.push(...templates[templateId].userIds);
    }
    return [...new Set(ids)];
};

const refreshCamoufoxFleetForActiveTemplates = async () => {
    const activeUserIds = getActiveTemplateUserIds();
    await camoufoxFleetManager.ensureForUsers(activeUserIds);
};

// Get the color ordoring for a given template, or global default.
const getColorOrderForTemplate = (templateId) => {
    if (templateId && colorOrdering.templates[templateId]) {
        return colorOrdering.templates[templateId];
    }
    return colorOrdering.global;
};

// ---------- HTTP client wrapper ----------

// ---------- Cookie helpers ----------

const DEFAULT_COOKIE_EXPIRATION = 13416346659.24397;

const tokenToBackendCookie = (token, expirationDate = DEFAULT_COOKIE_EXPIRATION) => ({
    name: 'j',
    path: '/',
    value: String(token),
    domain: '.backend.wplace.live',
    secure: true,
    session: false,
    storeId: 'Default',
    hostOnly: true,
    httpOnly: true,
    sameSite: 'Strict',
    expirationDate,
});

const normalizeCookiesForJar = (cookiesInput) => {
    if (!cookiesInput) return [];

    if (Array.isArray(cookiesInput)) {
        return cookiesInput
            .filter((c) => c && c.name && c.value)
            .map((c) => ({ ...c, name: String(c.name), value: String(c.value) }));
    }

    if (cookiesInput && typeof cookiesInput === 'object' && cookiesInput.name && cookiesInput.value) {
        return [{ ...cookiesInput, name: String(cookiesInput.name), value: String(cookiesInput.value) }];
    }

    if (cookiesInput && typeof cookiesInput === 'object') {
        return Object.entries(cookiesInput)
            .filter(([k, v]) => k && v != null)
            .map(([k, v]) => ({ name: String(k), value: String(v), path: '/', domain: '.backend.wplace.live' }));
    }

    return [];
};

const buildCookieJarFromInput = (cookiesInput) => {
    const jar = new CookieJar();
    const cookies = normalizeCookiesForJar(cookiesInput);

    for (const cookie of cookies) {
        const domain = cookie.domain || '.backend.wplace.live';
        const path = cookie.path || '/';
        const secure = cookie.secure ? '; Secure' : '';
        const httpOnly = cookie.httpOnly ? '; HttpOnly' : '';
        const sameSite = cookie.sameSite ? `; SameSite=${cookie.sameSite}` : '';
        const expires = Number.isFinite(cookie.expirationDate) ? `; Expires=${new Date(cookie.expirationDate * 1000).toUTCString()}` : '';
        const header = `${cookie.name}=${cookie.value}; Domain=${domain}; Path=${path}${secure}${httpOnly}${sameSite}${expires}`;
        jar.setCookieSync(header, WPLACE_BASE);
    }

    return jar;
};

const getUserCookiesForLogin = (user) => user?.cookieObjects?.length ? user.cookieObjects : user?.cookies;


/**
 * Minimal WPlacer client for authenticated calls.
 * Holds cookie jar, optional proxy, and Impit fetch context.
 */
class WPlacer {
    constructor({ template, coords, globalSettings, templateSettings, templateName }) {
        this.template = template;
        this.templateName = templateName;
        this.coords = coords;
        this.globalSettings = globalSettings;
        this.templateSettings = templateSettings || {};
        this.cookies = null;
        this.browser = null;
        this.userInfo = null;
        this.tiles = new Map();
        this.token = null;
        this.pawtect = null;
    }

    async _fetch(url, options) {
        try {
            // Add a default timeout and browser-like defaults to reduce CF challenges
            const defaultHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                // Referer helps some CF setups; safe default for this backend
                'Referer': 'https://wplace.live/'
            };
            const mergedHeaders = { ...(defaultHeaders), ...(options?.headers || {}) };
            const optsWithTimeout = { timeout: 30000, ...options, headers: mergedHeaders };
            return await this.browser.fetch(url, optsWithTimeout);
        } catch (error) {
            if (error.code === 'InvalidArg') {
                throw new NetworkError(`Internal fetch error (InvalidArg) for URL: ${url}. This may be a temporary network issue or a problem with a proxy.`);
            }
            // Re-throw other errors
            throw error;
        }
    }

    async login(cookies) {
        this.cookies = cookies;
        const jar = buildCookieJarFromInput(this.cookies);
        const sleepTime = Math.floor(Math.random() * MS.TWO_SEC) + MS.QUARTER_SEC;
        await sleep(sleepTime);

        const buildBrowser = (proxyUrl = null) => {
            const opts = { cookieJar: jar, browser: 'chrome', ignoreTlsErrors: true };
            if (proxyUrl) {
                opts.proxyUrl = proxyUrl;
                if (currentSettings.logProxyUsage) log('SYSTEM', 'wplacer', `Using proxy: ${proxyUrl.split('@').pop()}`);
            }
            return new Impit(opts);
        };

        const proxyUrl = getNextProxy();
        this.browser = buildBrowser(proxyUrl);

        try {
            await this.loadUserInfo();
        } catch (error) {
            const message = String(error?.message || '').toLowerCase();
            const isInvalidIp = message.includes('client_connect_invalid_ip');
            if (!proxyUrl || !isInvalidIp) throw error;

            log('SYSTEM', 'wplacer', '⚠️ Detected client_connect_invalid_ip while using proxy. Retrying login without proxy.');
            this.browser = buildBrowser(null);
            await this.loadUserInfo();
        }

        return this.userInfo;
    }

    async switchUser(cookies) {
        this.cookies = cookies;
        this.browser.cookieJar = buildCookieJarFromInput(this.cookies);
        await this.loadUserInfo();
        return this.userInfo;
    }

    async loadUserInfo() {
        const me = await this._fetch(WPLACE_ME);
        const bodyText = await me.text();

        if (bodyText.trim().startsWith('<!DOCTYPE html>')) throw new NetworkError('Cloudflare interruption detected.');

        try {
            const userInfo = JSON.parse(bodyText);
            if (userInfo.error === 'Unauthorized')
                throw new NetworkError('(401) Unauthorized. The cookie may be invalid or the current IP/proxy is rate-limited.');
            if (userInfo.error) throw new Error(`(500) Auth failed: "${userInfo.error}".`);
            if (userInfo.id && userInfo.name) {
                const suspendedUntil = users[userInfo.id]?.suspendedUntil; // Grab suspendedUntil property from config files
                const isStillSuspended = suspendedUntil > new Date();

                // And create a new property in UserInfo
                userInfo["ban"] = {
                    status: isStillSuspended,
                    until: suspendedUntil
                };

                this.userInfo = userInfo;
                ChargeCache.markFromUserInfo(userInfo);
                return true;
            }
            throw new Error(`Unexpected /me response: ${JSON.stringify(userInfo)}`);
        } catch (e) {
            if (e instanceof NetworkError) throw e;
            if (bodyText.includes('Error 1015')) throw new NetworkError('(1015) Rate-limited.');
            if (bodyText.includes('502') && bodyText.includes('gateway')) throw new NetworkError(`(502) Bad Gateway.`);
            throw new Error(`Failed to parse server response: "${bodyText.substring(0, 150)}..."`);
        }
    }

    async post(url, body) {
        const headers = {
            'Content-Type': 'text/plain;charset=UTF-8',
            'Accept': '*/*',
            'x-pawtect-variant': 'koala',
        };
        if (this.pawtect) headers['x-pawtect-token'] = this.pawtect;
        const req = await this._fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        const data = await req.json();
        return { status: req.status, data };
    }

    /*
     * Load all tiles intersecting the template bounding box into memory.
     * Converts to palette IDs for quick mismatch checks.
    */
    async loadTiles() {
        this.tiles.clear();
        const [tx, ty, px, py] = this.coords;
        const endPx = px + this.template.width;
        const endPy = py + this.template.height;
        const endTx = tx + Math.floor(endPx / 1000);
        const endTy = ty + Math.floor(endPy / 1000);

        const promises = [];
        for (let X = tx; X <= endTx; X++) {
            for (let Y = ty; Y <= endTy; Y++) {
                const p = this._fetch(`${TILE_URL(X, Y)}?t=${Date.now()}`)
                    .then(async (r) => (r.ok ? Buffer.from(await r.arrayBuffer()) : null))
                    .then((buf) => {
                        if (!buf) return null;
                        const image = new Image();
                        image.src = buf; // node-canvas accepts Buffer
                        const canvas = createCanvas(image.width, image.height);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(image, 0, 0);
                        const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const tile = {
                            width: canvas.width,
                            heigh: canvas.height,
                            data: Array.from({ length: canvas.width }, () => Array(canvas.height)),
                        };
                        for (let x = 0; x < canvas.width; x++) {
                            for (let y = 0; y < canvas.height; y++) {
                                const i = (y * canvas.width + x) * 4;
                                const r = d.data[i],
                                    g = d.data[i + 1],
                                    b = d.data[i + 2],
                                    a = d.data[i + 3];
                                tile.data[x][y] = a === 255 ? palette[`${r},${g},${b}`] || 0 : 0;
                            }
                        }
                        return tile;
                    })
                    .then((tileData) => {
                        if (tileData) {
                            this.tiles.set(`${X}_${Y}`, tileData);
                        }
                    });
                promises.push(p);
            }
        }
        await Promise.all(promises);
        return true;
    }

    hasColor(id) {
        if (id < 32) return true;
        return !!(this.userInfo.extraColorsBitmap & (1 << (id - 32)));
    }

    _updateTileCacheFromBody(tx, ty, body, paintedCount = body.colors.length) {
        const tile = this.tiles.get(`${tx}_${ty}`);
        if (!tile) return;
        const limit = Math.max(0, Math.min(paintedCount, body.colors.length));
        for (let i = 0; i < limit; i++) {
            const px = body.coords[i * 2];
            const py = body.coords[i * 2 + 1];
            const color = body.colors[i];
            if (tile.data[px]) tile.data[px][py] = color;
        }
    }

    async _executePaint(tx, ty, body) {
        if (body.colors.length === 0) return { painted: 0, success: true };

        let response;
        try {
            response = await this.post(WPLACE_PIXEL(tx, ty), body);
        } catch (error) {
            throw new NetworkError(`Paint request failed for tile ${tx},${ty}: ${error?.message || error}`);
        }

        const painted = Number(response?.data?.painted ?? 0);

        // Successful full or partial paint (server can legally return partial progress).
        if (painted > 0) {
            const paintedCount = Math.min(painted, body.colors.length);
            this._updateTileCacheFromBody(tx, ty, body, paintedCount);
            log(
                this.userInfo.id,
                this.userInfo.name,
                `[${this.templateName}] 🎨 Painted ${paintedCount}/${body.colors.length} px at ${tx},${ty}.`
            );
            return { painted: paintedCount, success: true, partial: paintedCount < body.colors.length };
        }

        if (response.data?.painted === 0 && body.colors.length > 0) {
            return { painted: 0, success: false, reason: 'NO_CHARGES' };
        }

        // classify other errors
        if (response.status === HTTP_STATUS.UNAUTH && response.data?.error === 'Unauthorized')
            throw new NetworkError('(401) Unauthorized during paint. The cookie may be invalid or the current IP/proxy is rate-limited.');
        if (
            response.status === HTTP_STATUS.FORBIDDEN &&
            (response.data?.error === 'refresh' || response.data?.error === 'Unauthorized')
        )
            throw new Error('REFRESH_TOKEN');
        if (response.status === HTTP_STATUS.UNAVAILABLE_LEGAL && response.data?.suspension)
            throw new SuspensionError(`Account is suspended.`, response.data.durationMs || 0);
        if (response.status === HTTP_STATUS.SRV_ERR) {
            log(this.userInfo.id, this.userInfo.name, `[${this.templateName}] ⏱️ Server error (500). Wait 40s.`);
            await sleep(MS.FORTY_SEC);
            return { painted: 0, success: true }; // Treat as temporary server issue
        }
        if (
            response.status === HTTP_STATUS.TOO_MANY ||
            (response.data?.error && response.data.error.includes('Error 1015'))
        )
            throw new NetworkError('(1015) Rate-limited.');

        throw new Error(`Unexpected response for tile ${tx},${ty}: ${JSON.stringify(response)}`);
    }

    /**
     * Natural paint order: serpentine in small vertical bands + tiny local jitter.
     * This avoids overly rigid straight-line behavior while remaining efficient.
     */
    _sortNaturalPixels(pixels) {
        const bandHeight = 6;
        const bands = new Map();

        for (const px of pixels) {
            const band = Math.floor(px.localY / bandHeight);
            if (!bands.has(band)) bands.set(band, []);
            bands.get(band).push(px);
        }

        const orderedBands = [...bands.keys()].sort((a, b) => a - b);
        const out = [];

        for (let i = 0; i < orderedBands.length; i++) {
            const band = orderedBands[i];
            const inBand = bands.get(band);

            // Alternate direction per band (human-like back-and-forth movement).
            const leftToRight = i % 2 === 0;
            inBand.sort((a, b) => {
                if (a.localY !== b.localY) return a.localY - b.localY;

                const ax = leftToRight ? a.localX : -a.localX;
                const bx = leftToRight ? b.localX : -b.localX;

                // Tiny jitter to reduce perfect machine-like regularity.
                const jitter = (Math.random() - 0.5) * 0.35;
                return (ax - bx) + jitter;
            });

            out.push(...inBand);
        }

        return out;
    }


    /**
     * Spiral ordering inspired by userscript-style strategies.
     * When `toCenter` is false, starts from center and expands outwards.
     * When true, reverses to draw from border to center.
     */
    _sortSpiralPixels(pixels, toCenter = false) {
        if (!pixels.length) return pixels;

        const byPos = new Map();
        for (const px of pixels) byPos.set(`${px.localX},${px.localY}`, px);

        const width = this.template.width;
        const height = this.template.height;
        const total = width * height;

        let x = Math.floor(width / 2);
        let y = Math.floor(height / 2);
        const dirs = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
        ];
        let dirIndex = 0;
        let steps = 1;

        const collected = [];
        const seen = new Set();
        const inBounds = (xx, yy) => xx >= 0 && xx < width && yy >= 0 && yy < height;

        const tryPush = (xx, yy) => {
            const key = `${xx},${yy}`;
            if (seen.has(key)) return;
            seen.add(key);
            const p = byPos.get(key);
            if (p) collected.push(p);
        };

        while (seen.size < total) {
            for (let t = 0; t < 2; t++) {
                for (let i = 0; i < steps; i++) {
                    if (inBounds(x, y)) tryPush(x, y);
                    x += dirs[dirIndex][0];
                    y += dirs[dirIndex][1];
                }
                dirIndex = (dirIndex + 1) % 4;
            }
            steps++;
            if (steps > total + 2) break;
        }

        return toCenter ? collected.reverse() : collected;
    }

    /**
     * Build a fast wavefront paint plan.
     *
     * Previous prototype used iterative candidate reselection and could become
     * expensive for very large templates. This version is O(n log n):
     * - cluster by tile+color to reduce switching,
     * - prioritize groups with stronger frontier signal,
     * - keep local ordering compact and deterministic.
     */
    _buildWavefrontPlan(pixels) {
        if (pixels.length <= 2) return pixels;

        const groups = new Map();
        let sumX = 0;
        let sumY = 0;

        for (const p of pixels) {
            sumX += p.localX;
            sumY += p.localY;
            const key = `${p.tx},${p.ty}|${p.color}`;
            if (!groups.has(key)) {
                groups.set(key, {
                    key,
                    tx: p.tx,
                    ty: p.ty,
                    color: p.color,
                    pixels: [],
                    frontierSum: 0,
                    minX: p.localX,
                    minY: p.localY,
                });
            }
            const g = groups.get(key);
            g.pixels.push(p);
            g.frontierSum += p.neighborMatches + (p.isEdge ? 0.25 : 0);
            if (p.localX < g.minX) g.minX = p.localX;
            if (p.localY < g.minY) g.minY = p.localY;
        }

        const cx = sumX / pixels.length;
        const cy = sumY / pixels.length;

        const orderedGroups = [...groups.values()].sort((a, b) => {
            const aFrontier = a.frontierSum / a.pixels.length;
            const bFrontier = b.frontierSum / b.pixels.length;
            if (aFrontier !== bFrontier) return bFrontier - aFrontier;

            const aDx = a.minX - cx;
            const aDy = a.minY - cy;
            const bDx = b.minX - cx;
            const bDy = b.minY - cy;
            const aCenterDist = aDx * aDx + aDy * aDy;
            const bCenterDist = bDx * bDx + bDy * bDy;
            if (aCenterDist !== bCenterDist) return aCenterDist - bCenterDist;

            if (a.pixels.length !== b.pixels.length) return a.pixels.length - b.pixels.length;
            return a.key.localeCompare(b.key);
        });

        const out = [];
        for (const group of orderedGroups) {
            group.pixels.sort((a, b) => {
                if (a.neighborMatches !== b.neighborMatches) return b.neighborMatches - a.neighborMatches;
                if (a.isEdge !== b.isEdge) return a.isEdge ? -1 : 1;

                if (a.localY !== b.localY) return a.localY - b.localY;
                const rowParity = a.localY % 2 === 0;
                return rowParity ? a.localX - b.localX : b.localX - a.localX;
            });
            out.push(...group.pixels);
        }

        return out;
    }

    /** Compute pixels needing change, honoring modes. */
    _getMismatchedPixels(currentSkip = 1, colorFilter = null) {
        const [startX, startY, startPx, startPy] = this.coords;
        const out = [];

        for (let y = 0; y < this.template.height; y++) {
            for (let x = 0; x < this.template.width; x++) {
                if ((x + y) % currentSkip !== 0) continue;

                const tplColor = this.template.data[x][y];
                if (colorFilter !== null && tplColor !== colorFilter) continue;

                const globalPx = startPx + x,
                    globalPy = startPy + y;

                const targetTx = startX + Math.floor(globalPx / 1000);
                const targetTy = startY + Math.floor(globalPy / 1000);
                const localPx = globalPx % 1000,
                    localPy = globalPy % 1000;

                const tile = this.tiles.get(`${targetTx}_${targetTy}`);
                if (!tile || !tile.data[localPx]) continue;

                const canvasColor = tile.data[localPx][localPy];
                const neighbors = [
                    this.template.data[x - 1]?.[y],
                    this.template.data[x + 1]?.[y],
                    this.template.data[x]?.[y - 1],
                    this.template.data[x]?.[y + 1],
                ];
                const isEdge = neighbors.some((n) => n === 0 || n === undefined);
                let neighborMatches = 0;
                if (this.template.data[x - 1]?.[y] > 0 && tile.data[localPx - 1]?.[localPy] === this.template.data[x - 1][y]) neighborMatches++;
                if (this.template.data[x + 1]?.[y] > 0 && tile.data[localPx + 1]?.[localPy] === this.template.data[x + 1][y]) neighborMatches++;
                if (this.template.data[x]?.[y - 1] > 0 && tile.data[localPx]?.[localPy - 1] === this.template.data[x][y - 1]) neighborMatches++;
                if (this.template.data[x]?.[y + 1] > 0 && tile.data[localPx]?.[localPy + 1] === this.template.data[x][y + 1]) neighborMatches++;

                // erase non-template
                if (this.templateSettings.eraseMode && tplColor === 0 && canvasColor !== 0) {
                    out.push({
                        tx: targetTx,
                        ty: targetTy,
                        px: localPx,
                        py: localPy,
                        color: 0,
                        isEdge: false,
                        neighborMatches,
                        localX: x,
                        localY: y,
                    });
                    continue;
                }
                // treat -1 as "clear if filled"
                if (tplColor === -1 && canvasColor !== 0) {
                    out.push({
                        tx: targetTx,
                        ty: targetTy,
                        px: localPx,
                        py: localPy,
                        color: 0,
                        isEdge,
                        neighborMatches,
                        localX: x,
                        localY: y,
                    });
                    continue;
                }
                // positive colors
                if (tplColor > 0 && this.hasColor(tplColor)) {
                    const shouldPaint = this.templateSettings.skipPaintedPixels
                        ? canvasColor === 0
                        : tplColor !== canvasColor;
                    if (shouldPaint) {
                        out.push({
                            tx: targetTx,
                            ty: targetTy,
                            px: localPx,
                            py: localPy,
                            color: tplColor,
                            isEdge,
                            neighborMatches,
                            localX: x,
                            localY: y,
                        });
                    }
                }
            }
        }
        return out;
    }

    async paint(currentSkip = 1, colorFilter = null) {
        if (this.tiles.size === 0) await this.loadTiles();
        if (!this.token) throw new Error('Token not provided.');

        let mismatched = this._getMismatchedPixels(currentSkip, colorFilter);
        if (mismatched.length === 0) return 0;

        log(this.userInfo.id, this.userInfo.name, `[${this.templateName}] Found ${mismatched.length} paintable pixels.`);

        // outline
        if (this.templateSettings.outlineMode) {
            const edge = mismatched.filter((p) => p.isEdge);
            if (edge.length > 0) mismatched = edge;
        }

        // legacy directions still exist, but wavefront is now the default strategy.
        switch (this.globalSettings.drawingDirection) {
            case 'wavefront':
                mismatched = this._buildWavefrontPlan(mismatched);
                break;
            case 'down':
            case 'ttb':
                mismatched.sort((a, b) => a.localY - b.localY);
                break;
            case 'up':
            case 'btt':
                mismatched.sort((a, b) => b.localY - a.localY);
                break;
            case 'left':
            case 'ltr':
                mismatched.sort((a, b) => a.localX - b.localX);
                break;
            case 'right':
            case 'rtl':
                mismatched.sort((a, b) => b.localX - a.localX);
                break;
            case 'spiral_from_center':
            case 'center_out':
                mismatched = this._sortSpiralPixels(mismatched, false);
                break;
            case 'spiral_to_center':
                mismatched = this._sortSpiralPixels(mismatched, true);
                break;
            case 'natural':
                mismatched = this._buildWavefrontPlan(mismatched);
                break;
            case 'random': {
                for (let i = mismatched.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [mismatched[i], mismatched[j]] = [mismatched[j], mismatched[i]];
                }
                break;
            }
            default:
                mismatched.sort((a, b) => a.localY - b.localY);
                break;
        }

        const parsedCharges = ChargeCache._extractFromUserInfo(this.userInfo);
        const chargesNow = parsedCharges.count;
        const pixelsThisTurn = capTurnPixels(chargesNow);
        const todo = mismatched.slice(0, pixelsThisTurn);

        if (todo.length === 0) {
            log(this.userInfo.id, this.userInfo.name, `[${this.templateName}] ⚠️ No paintable pixels selected this turn (charges=${chargesNow}). Refreshing charge cache.`);
            ChargeCache.forceResync(this.userInfo.id, 0);
            return 0;
        }

        // Keep paint payloads bounded to avoid oversized requests and improve reliability.
        const chunks = buildPaintChunks(todo, MAX_PIXELS_PER_REQUEST);

        const { total, status } = await runPaintChunks({
            chunks,
            fingerprint: globalThis.__wplacer_last_fp,
            executePaint: (tx, ty, body) => this._executePaint(tx, ty, { ...body, t: this.token }),
            onTokenRefresh: () => {
                log(this.userInfo.id, this.userInfo.name, `[${this.templateName}] 🔄 Token expired mid-batch. Keeping progress and rotating token.`);
                TokenManager.invalidateToken('mid-batch refresh from pixel endpoint');
            },
            onNoCharges: () => {
                log(this.userInfo.id, this.userInfo.name, `[${this.templateName}] ⚠️ Prediction mismatch. Server reports no charges. Resyncing cache.`);
                ChargeCache.forceResync(this.userInfo.id, 0);
            },
            onInterrupted: (painted, error) => {
                log(this.userInfo.id, this.userInfo.name, `[${this.templateName}] ⚠️ Paint interrupted after ${painted} px. Will retry next cycle. (${error?.message || error})`);
            },
        });

        if (status === 'token_refresh' && total === 0) {
            throw new Error('REFRESH_TOKEN');
        }

        return total;
    }

    async buyProduct(productId, amount) {
        const res = await this.post(WPLACE_PURCHASE, { product: { id: productId, amount } });
        if (res.data.success) {
            let msg = `Purchase ok product #${productId} amount ${amount}`;
            if (productId === 80) msg = `Bought ${amount * 30} pixels for ${amount * 500} droplets`;
            else if (productId === 70) msg = `Bought ${amount} Max Charge for ${amount * 500} droplets`;
            log(this.userInfo.id, this.userInfo.name, `[${this.templateName}] 💰 ${msg}`);
            return true;
        }
        if (res.status === HTTP_STATUS.TOO_MANY || (res.data.error && res.data.error.includes('Error 1015')))
            throw new NetworkError('(1015) Rate-limited during purchase.');
        throw new Error(`Unexpected purchase response: ${JSON.stringify(res)}`);
    }
}

// ---------- Persistence helpers ----------

const loadJSON = (filename) =>
    existsSync(filename) ? JSON.parse(readFileSync(filename, 'utf8')) : {};
const saveJSON = (filename, data) => writeFileSync(filename, JSON.stringify(data, null, 2));

const users = loadJSON(USERS_FILE);
const saveUsers = () => saveJSON(USERS_FILE, users);

let templates = {}; // id -> TemplateManager

// ---------- Compact template codec ----------

const Base64URL = {
    enc: (u8) => Buffer.from(u8).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    dec: (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64'),
};

function varintWrite(n, out) {
    n = Number(n);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) throw new Error('varint invalid');
    while (n >= 0x80) {
        out.push((n & 0x7f) | 0x80);
        n >>>= 7;
    }
    out.push(n);
}
function varintRead(u8, i) {
    let n = 0,
        shift = 0,
        b;
    do {
        b = u8[i++];
        n |= (b & 0x7f) << shift;
        shift += 7;
    } while (b & 0x80);
    return [n >>> 0, i];
}
function rleEncode(a) {
    if (!a?.length) return [];
    const o = [];
    let p = a[0],
        c = 1;
    for (let i = 1; i < a.length; i++) {
        const v = a[i];
        if (v === p) c++;
        else {
            o.push([p, c]);
            p = v;
            c = 1;
        }
    }
    o.push([p, c]);
    return o;
}
function normPix(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error('pixel invalid');
    if (n === -1) return -1;
    if (n < 0 || n > 255) throw new Error('pixel out of range');
    return n >>> 0;
}
function flatten2D_XMajor(cols) {
    const w = cols.length,
        h = cols[0]?.length ?? 0;
    const flat = new Array(w * h);
    let k = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) flat[k++] = cols[x][y];
    return { flat, w, h };
}
function reshape_XMajor(flat, w, h) {
    const cols = Array.from({ length: w }, () => Array(h));
    let k = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) cols[x][y] = flat[k++];
    return cols;
}
function transposeToXMajor(mat) {
    const h = mat.length,
        w = mat[0]?.length ?? 0;
    const out = Array.from({ length: w }, () => Array(h));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[x][y] = mat[y][x];
    return out;
}
function ensureXMajor(data, w, h) {
    if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('bad matrix');
    if (data.length === w && data[0].length === h) return data; // already x-major
    if (data.length === h && data[0].length === w) return transposeToXMajor(data); // transpose
    throw new Error(`matrix dims mismatch: got ${data.length}x${data[0].length}, want ${w}x${h}`);
}
function sanitizePalette2D(matrix) {
    for (let x = 0; x < matrix.length; x++) {
        const col = matrix[x];
        if (!Array.isArray(col)) continue;
        for (let y = 0; y < col.length; y++) if (!VALID_COLOR_IDS.has(col[y])) col[y] = 0;
    }
}
function buildShareBytes(width, height, data2D) {
    const w = Number(width) >>> 0,
        h = Number(height) >>> 0;
    if (!w || !h) throw new Error('zero dimension');
    const xmaj = ensureXMajor(data2D, w, h).map((col) => col.map(normPix));
    const { flat } = flatten2D_XMajor(xmaj);
    const runs = rleEncode(flat);
    const bytes = [];
    bytes.push(0x57, 0x54, 0x01);
    varintWrite(w, bytes);
    varintWrite(h, bytes);
    varintWrite(runs.length, bytes);
    for (const [val, cnt] of runs) {
        const vb = val === -1 ? 255 : val;
        bytes.push(vb & 0xff);
        varintWrite(cnt, bytes);
    }
    return Uint8Array.from(bytes);
}
function parseShareBytes(u8) {
    if (u8.length < 3 || u8[0] !== 0x57 || u8[1] !== 0x54 || u8[2] !== 0x01) throw new Error('bad magic/version');
    let i = 3;
    let w;
    [w, i] = varintRead(u8, i);
    let h;
    [h, i] = varintRead(u8, i);
    let rc;
    [rc, i] = varintRead(u8, i);

    const flat = [];
    for (let r = 0; r < rc; r++) {
        const raw = u8[i++];
        let cnt;
        [cnt, i] = varintRead(u8, i);
        const v = raw === 255 ? -1 : raw;
        while (cnt--) flat.push(v);
    }
    if (flat.length !== w * h) throw new Error(`size mismatch ${flat.length} != ${w * h}`);
    const data = reshape_XMajor(flat, w, h);
    sanitizePalette2D(data);
    return { width: w, height: h, data };
}
const shareCodeFromTemplate = (t) => Base64URL.enc(buildShareBytes(t.width, t.height, t.data));
const templateFromShareCode = (code) => {
    const decoded = parseShareBytes(new Uint8Array(Base64URL.dec(code)));
    sanitizePalette2D(decoded.data);
    return decoded;
};

// ---------- Template load/save ----------

function loadTemplatesFromDisk() {
    if (!existsSync(TEMPLATES_PATH)) {
        templates = {};
        return;
    }
    const raw = JSON.parse(readFileSync(TEMPLATES_PATH, 'utf8'));
    const out = {};
    for (const id in raw) {
        const e = raw[id] || {};
        const te = e.template || {};
        let { width, height, data, shareCode } = te;

        try {
            if (!data && shareCode) {
                const dec = templateFromShareCode(shareCode);
                width = dec.width;
                height = dec.height;
                data = dec.data;
            }
            if (!width || !height || !Array.isArray(data)) throw new Error('missing data');

            out[id] = {
                ...e,
                template: {
                    width,
                    height,
                    data,
                    shareCode: shareCode || shareCodeFromTemplate({ width, height, data }),
                },
            };
        } catch (err) {
            console.error(`[templates] ⚠️ skip ${id}: ${err.message}`);
        }
    }
    templates = out;
}
loadTemplatesFromDisk();

function saveTemplatesCompressed() {
    const toSave = {};
    for (const id in templates) {
        try {
            const t = templates[id];
            const { width, height, data } = t.template;
            const shareCode = t.template.shareCode || shareCodeFromTemplate({ width, height, data });
            toSave[id] = {
                name: t.name,
                coords: t.coords,
                canBuyCharges: t.canBuyCharges,
                canBuyMaxCharges: t.canBuyMaxCharges,
                antiGriefMode: t.antiGriefMode,
                eraseMode: t.eraseMode,
                outlineMode: t.outlineMode,
                skipPaintedPixels: t.skipPaintedPixels,
                enableAutostart: t.enableAutostart,
                userIds: t.userIds,
                template: { width, height, shareCode }, // compact on disk
            };
        } catch (e) {
            console.error(`[templates] ⚠️ skip ${id}: ${e.message}`);
        }
    }
    writeFileSync(TEMPLATES_PATH, JSON.stringify(toSave, null, 2));
}
const saveTemplates = saveTemplatesCompressed;

// ---------- Settings ----------

let currentSettings = {
    accountCooldown: 20_000,
    purchaseCooldown: 5_000,
    maxPixelsPerTurn: 0,
    readyChargeThreshold: 1,
    keepAliveCooldown: MS.ONE_HOUR,
    dropletReserve: 0,
    antiGriefStandby: 600_000,
    drawingDirection: 'wavefront',
    drawingOrder: 'linear',
    chargeThreshold: 0.5,
    pixelSkip: 1,
    proxyEnabled: false,
    proxyRotationMode: 'sequential', // 'sequential' | 'random'
    logProxyUsage: false,
};
if (existsSync(SETTINGS_FILE)) {
    currentSettings = { ...currentSettings, ...loadJSON(SETTINGS_FILE) };
    // Sanitize keepAliveCooldown to prevent issues from old/bad settings files
    if (currentSettings.keepAliveCooldown < MS.FIVE_MIN) {
        console.log(
            `[SYSTEM] WARNING: keepAliveCooldown is set to a very low value (${duration(
                currentSettings.keepAliveCooldown
            )}). Adjusting to 1 hour.`
        );
        currentSettings.keepAliveCooldown = MS.ONE_HOUR;
    }
}
const saveSettings = () => saveJSON(SETTINGS_FILE, currentSettings);

const getReadyChargeThreshold = (predictedMax) => {
    const maxSafe = Math.max(1, Number.parseInt(predictedMax, 10) || 1);
    const absolute = Number.parseInt(currentSettings.readyChargeThreshold, 10);
    if (Number.isFinite(absolute) && absolute > 0) {
        return Math.min(maxSafe, absolute);
    }

    // Backward compatibility for older settings files that only define a percentage threshold.
    return Math.max(1, Math.floor(maxSafe * (Number(currentSettings.chargeThreshold) || 0.5)));
};

const capTurnPixels = (availableCharges) => {
    const charges = Math.max(0, Math.floor(Number(availableCharges) || 0));
    const configured = Number.parseInt(currentSettings.maxPixelsPerTurn, 10);
    if (!Number.isFinite(configured) || configured <= 0) return charges;
    return Math.min(charges, configured);
};

// ---------- Server state ----------

const activeBrowserUsers = new Set();
// Cache last-known user status to avoid 409s when user is briefly busy
const STATUS_CACHE_TTL = 10 * 60_000; // 10 minutes
const statusCache = new Map(); // id -> { data, ts }
const setStatusCache = (id, data) => {
    try { statusCache.set(String(id), { data, ts: Date.now() }); } catch {}
};
const getStatusCache = (id) => {
    const e = statusCache.get(String(id));
    if (!e) return null;
    if (Date.now() - e.ts > STATUS_CACHE_TTL) {
        statusCache.delete(String(id));
        return null;
    }
    return e.data;
};
const waitForNotBusy = async (id, timeoutMs = 5_000) => {
    const t0 = Date.now();
    while (activeBrowserUsers.has(id) && Date.now() - t0 < timeoutMs) {
        await sleep(200);
    }
    return !activeBrowserUsers.has(id);
};
const activeTemplateUsers = new Set();
const templateQueue = [];

const describeTemplateUsers = (manager) => manager.userIds.map((uid) => `${users[uid]?.name || 'Unknown'}(${uid})`).join(', ');
const describeBusyUsers = (manager) => manager.userIds
    .filter((uid) => activeTemplateUsers.has(uid))
    .map((uid) => `${users[uid]?.name || 'Unknown'}(${uid})`)
    .join(', ');
let activePaintingTasks = 0;

// ---------- Token manager ----------

const TokenManager = {
    tokenQueue: [],
    tokenPromise: null,
    resolvePromise: null,
    isTokenNeeded: false,
    waitStartedAt: null,
    waitingTemplateName: null,
    TOKEN_EXPIRATION_MS: MS.TWO_MIN,

    _purgeExpiredTokens() {
        const now = Date.now();
        const size0 = this.tokenQueue.length;
        this.tokenQueue = this.tokenQueue.filter((t) => now - t.receivedAt < this.TOKEN_EXPIRATION_MS);
        const removed = size0 - this.tokenQueue.length;
        if (removed > 0) log('SYSTEM', 'wplacer', `TOKEN_MANAGER: 🗑️ Discarded ${removed} expired token(s).`);
    },
    getToken(templateName = 'Unknown') {
        this._purgeExpiredTokens();
        if (this.tokenQueue.length > 0) {
            const queued = this.tokenQueue.shift().token;
            log('SYSTEM', 'wplacer', `TOKEN_MANAGER: 📦 Serving cached token to template "${templateName}". Remaining queue=${this.tokenQueue.length}.`);
            return Promise.resolve(queued);
        }
        if (!this.tokenPromise) {
            this.waitStartedAt = Date.now();
            this.waitingTemplateName = templateName;
            log('SYSTEM', 'wplacer', `TOKEN_MANAGER: ⏳ Template "${templateName}" is waiting for a token.`);
            this.isTokenNeeded = true;
            this.tokenPromise = new Promise((resolve) => {
                this.resolvePromise = resolve;
            });
        } else {
            const waitMs = this.waitStartedAt ? Date.now() - this.waitStartedAt : 0;
            log('SYSTEM', 'wplacer', `TOKEN_MANAGER: 🔁 Reusing pending token wait (template="${this.waitingTemplateName || templateName}", waited=${duration(waitMs)}).`);
        }
        return this.tokenPromise;
    },
    setToken(t) {
        const newToken = { token: t, receivedAt: Date.now() };
        const tokenTail = typeof t === 'string' ? t.slice(-8) : 'unknown';
        if (this.resolvePromise) {
            const waitMs = this.waitStartedAt ? Date.now() - this.waitStartedAt : 0;
            log('SYSTEM', 'wplacer', `TOKEN_MANAGER: ✅ Token received (…${tokenTail}), immediately consumed by waiting task after ${duration(waitMs)}.`);
            this.resolvePromise(newToken.token);
            this.tokenPromise = null;
            this.resolvePromise = null;
            this.waitStartedAt = null;
            this.waitingTemplateName = null;
            this.isTokenNeeded = false;
        } else {
            this.tokenQueue.push(newToken);
            log('SYSTEM', 'wplacer', `TOKEN_MANAGER: ✅ Token received (…${tokenTail}). Queue size: ${this.tokenQueue.length}`);
        }
    },
    invalidateToken(reason = 'refresh requested by backend') {
        const dropped = this.tokenQueue.length;
        this.tokenQueue = [];
        this.waitStartedAt = Date.now();
        this.isTokenNeeded = true;
        log('SYSTEM', 'wplacer', `TOKEN_MANAGER: 🔄 Invalidating token cache (${reason}). Dropped ${dropped} queued token(s).`);
    },
};

// ---------- Error logging helper ----------

function logUserError(error, id, name, context) {
    const message = error?.message || 'Unknown error.';
    if (
        error?.name === 'NetworkError' ||
        message.includes('(500)') ||
        message.includes('(1015)') ||
        message.includes('(502)') ||
        error?.name === 'SuspensionError'
    ) {
        log(id, name, `❌ Failed to ${context}: ${message}`);
    } else {
        log(id, name, `❌ Failed to ${context}`, error);
    }
}

// ---------- TemplateManager ----------

class TemplateManager {
    constructor({
        templateId,
        name,
        templateData,
        coords,
        canBuyCharges,
        canBuyMaxCharges,
        antiGriefMode,
        eraseMode,
        outlineMode,
        skipPaintedPixels,
        enableAutostart,
        userIds,
    }) {
        this.templateId = templateId;
        this.name = name;
        this.template = templateData;
        this.coords = coords;
        this.canBuyCharges = canBuyCharges;
        this.canBuyMaxCharges = canBuyMaxCharges;
        this.antiGriefMode = antiGriefMode;
        this.eraseMode = eraseMode;
        this.outlineMode = outlineMode;
        this.skipPaintedPixels = skipPaintedPixels;
        this.enableAutostart = enableAutostart;
        this.userIds = userIds;

        this.running = false;
        this.status = 'Waiting to be started.';
        this.masterId = this.userIds[0];
        this.masterName = users[this.masterId]?.name || 'Unknown';
        this.sleepAbortController = null;

        this.totalPixels = this.template.data.flat().filter((p) => p !== 0).length;
        this.pixelsRemaining = this.totalPixels;
        this.currentPixelSkip = currentSettings.pixelSkip;

        this.initialRetryDelay = MS.THIRTY_SEC;
        this.maxRetryDelay = MS.FIVE_MIN;
        this.currentRetryDelay = this.initialRetryDelay;

        this.userQueue = [...this.userIds];
    }

    /* Sleep that can be interrupted when settings change. */
    cancellableSleep(ms) {
        return new Promise((resolve) => {
            const controller = new AbortController();
            this.sleepAbortController = controller;
            const timeout = setTimeout(() => {
                if (this.sleepAbortController === controller) this.sleepAbortController = null;
                resolve();
            }, ms);
            controller.signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                if (this.sleepAbortController === controller) this.sleepAbortController = null;
                resolve();
            });
        });
    }
    interruptSleep() {
        if (this.sleepAbortController) {
            log('SYSTEM', 'wplacer', `[${this.name}] ⚙️ Settings changed, waking.`);
            this.sleepAbortController.abort();
        }
    }

    /* Optional purchase of max-charge upgrades. */
    async handleUpgrades(wplacer) {
        if (!this.canBuyMaxCharges) return;
        await wplacer.loadUserInfo();
        const affordableDroplets = wplacer.userInfo.droplets - currentSettings.dropletReserve;
        const amountToBuy = Math.floor(affordableDroplets / 500);
        if (amountToBuy > 0) {
            try {
                await wplacer.buyProduct(70, amountToBuy);
                await sleep(currentSettings.purchaseCooldown);
                await wplacer.loadUserInfo();
            } catch (error) {
                logUserError(error, wplacer.userInfo.id, wplacer.userInfo.name, 'purchase max charge upgrades');
            }
        }
    }

    async handleChargePurchases(wplacer) {
        if (!this.canBuyCharges) return;
        const userInfo = wplacer.userInfo;
        const affordableDroplets = userInfo.droplets - currentSettings.dropletReserve;

        if (affordableDroplets < 500) {
            return;
        }
        
        const amountToBuy = Math.floor(affordableDroplets / 500);

        if (amountToBuy > 0) {
            try {
                log(userInfo.id, userInfo.name, `[${this.name}] 💰 Attempting to buy ${amountToBuy} charge pack(s) based on available droplets...`);
                await wplacer.buyProduct(80, amountToBuy);
                await sleep(currentSettings.purchaseCooldown);
                await wplacer.loadUserInfo(); 
            } catch (error) {
                logUserError(error, userInfo.id, userInfo.name, 'purchase charges');
            }
        }
    }

    async _performPaintTurn(wplacer, colorFilter = null) {
        let paintedTotal = 0;
        let done = false;
        let refreshRetries = 0;
        while (!done && this.running) {
            try {
                log(wplacer.userInfo.id, wplacer.userInfo.name, `[${this.name}] 🔐 Requesting token from TokenManager (color=${colorFilter === null ? 'ALL' : (COLOR_NAMES[colorFilter] || `ID:${colorFilter}`)}, pixelSkip=${this.currentPixelSkip}).`);
                wplacer.token = await TokenManager.getToken(this.name);
                // Pull latest pawtect token if available
                wplacer.pawtect = globalThis.__wplacer_last_pawtect || null;
                log(wplacer.userInfo.id, wplacer.userInfo.name, `[${this.name}] 🧩 Token ready (pawtect=${wplacer.pawtect ? 'yes' : 'no'}). Starting paint request(s).`);
                const painted = await wplacer.paint(this.currentPixelSkip, colorFilter);
                paintedTotal += painted;
                log(wplacer.userInfo.id, wplacer.userInfo.name, `[${this.name}] 🎨 Paint request cycle completed with ${painted} painted pixels.`);
                done = true;
                refreshRetries = 0;
            } catch (error) {
                if (error.name === 'SuspensionError') {
                    const until = new Date(error.suspendedUntil).toLocaleString();
                    
                    // Difference between a BAN and a SUSPENSION of the account.
                    if (error.durationMs > 0) log(wplacer.userInfo.id, wplacer.userInfo.name, `[${this.name}] 🛑 Account suspended until ${until}.`);
                    else log(wplacer.userInfo.id, wplacer.userInfo.name, `[${this.name}] 🛑 Account BANNED PERMANENTLY, banned due to ${error.reason}.`)
                    
                    /*
                    
                    If a BAN has been issued, instead of setting suspendedUntil to wpalcer's suspendedUntil (current date in ms),
                    set it to a HUGE number to avoid modifying any logic in the rest of the code, and still perform properly with
                    the banned account.
                    
                    */
                    users[wplacer.userInfo.id].suspendedUntil = error.durationMs > 0 ? error.suspendedUntil : Number.MAX_SAFE_INTEGER;
                    saveUsers();
                    throw error;
                }
                if (error.message === 'REFRESH_TOKEN') {
                    refreshRetries++;
                    log(wplacer.userInfo.id, wplacer.userInfo.name, `[${this.name}] 🔄 Token expired. Next token...`);
                    TokenManager.invalidateToken('paint endpoint requested token refresh');
                    if (refreshRetries >= 5) {
                        throw new NetworkError('Too many consecutive token refresh requests. Validate extension token bridge (turnstile/pawtect/fp).');
                    }
                    await sleep(1000);
                } else {
                    throw error;
                }
            }
        }
        if (wplacer?.userInfo?.id && paintedTotal > 0) ChargeCache.consume(wplacer.userInfo.id, paintedTotal);
        return paintedTotal;
    }

    async _findWorkingUserAndCheckPixels() {
        log('SYSTEM', 'wplacer', `[${this.name}] 🔎 User rotation for pixel check: ${this.userQueue.map((id) => users[id]?.name || id).join(' -> ')}`);
        // Iterate through all users in the queue to find one that works.
        for (let i = 0; i < this.userQueue.length; i++) {
            const userId = this.userQueue.shift();
            this.userQueue.push(userId); // Immediately cycle user to the back of the queue.

            if (!users[userId] || (users[userId].suspendedUntil && Date.now() < users[userId].suspendedUntil)) {
                if (!users[userId]) log('SYSTEM', 'wplacer', `[${this.name}] ⚠️ Skipping missing user id ${userId} during check cycle.`);
                else log('SYSTEM', 'wplacer', `[${this.name}] ⏸️ Skipping suspended user ${users[userId].name} (${userId}).`);
                continue; // Skip suspended or non-existent users.
            }

            const wplacer = new WPlacer({
                template: this.template,
                coords: this.coords,
                globalSettings: currentSettings,
                templateSettings: {
                    eraseMode: this.eraseMode,
                    outlineMode: this.outlineMode,
                    skipPaintedPixels: this.skipPaintedPixels,
                },
                templateName: this.name,
            });

            try {
                log('SYSTEM', 'wplacer', `[${this.name}] Checking template status with user ${users[userId].name}...`);
                await wplacer.login(getUserCookiesForLogin(users[userId]));
                await wplacer.loadTiles();
                const mismatchedPixels = wplacer._getMismatchedPixels(1, null); // Check all pixels, no skip, no color filter.
                log('SYSTEM', 'wplacer', `[${this.name}] Check complete. Found ${mismatchedPixels.length} mismatched pixels.`);
                return { wplacer, mismatchedPixels }; // Success
            } catch (error) {
                logUserError(error, userId, users[userId].name, 'cycle pixel check');
                log('SYSTEM', 'wplacer', `[${this.name}] ⚠️ User ${users[userId]?.name || userId} failed pixel-check login/load; trying next user.`);
                // This user failed, loop will continue to the next one.
            }
        }
        log('SYSTEM', 'wplacer', `[${this.name}] ❌ No users could complete pixel-check cycle. Queue snapshot: ${this.userQueue.join(', ')}`);
        return null; // No working users were found in the entire queue.
    }

    async start() {
        this.running = true;
        this.status = 'Started.';
        refreshCamoufoxFleetForActiveTemplates().catch((e) => log('SYSTEM', 'Camoufox', 'Error refreshing fleet in template start', e));
        log('SYSTEM', 'wplacer', `▶️ Starting template "${this.name}"...`);
        activePaintingTasks++;

        try {
            while (this.running) {
                this.status = 'Checking for pixels...';
                log('SYSTEM', 'wplacer', `[${this.name}] 💓 Starting new check cycle...`);

                const checkResult = await this._findWorkingUserAndCheckPixels();
                if (!checkResult) {
                    log('SYSTEM', 'wplacer', `[${this.name}] ❌ No working users found for pixel check. Retrying in 30s.`);
                    await this.cancellableSleep(30_000);
                    continue;
                }

                this.pixelsRemaining = checkResult.mismatchedPixels.length;

                if (this.pixelsRemaining === 0) {
                    if (this.antiGriefMode) {
                        this.status = 'Monitoring for changes.';
                        log('SYSTEM', 'wplacer', `[${this.name}] 🖼️ Template complete. Monitoring... Recheck in ${duration(currentSettings.antiGriefStandby)}.`);
                        await this.cancellableSleep(currentSettings.antiGriefStandby);
                        continue;
                    } else {
                        log('SYSTEM', 'wplacer', `[${this.name}] ✅ Template finished.`);
                        this.status = 'Finished.';
                        this.running = false;
                        break;
                    }
                }

                this.currentRetryDelay = this.initialRetryDelay;

                let colorsToPaint;
                const drawingOrder = currentSettings.drawingOrder;
                const isColorMode = drawingOrder === 'color' || drawingOrder === 'randomColor';

                if (isColorMode) {
                    const mismatchedColors = new Set(checkResult.mismatchedPixels.map(p => p.color));
                    const allTemplateColors = this.template.data.flat().filter(c => c > 0);
                    const colorCounts = allTemplateColors.reduce((acc, color) => ({ ...acc, [color]: (acc[color] || 0) + 1 }), {});

                    const customOrder = getColorOrderForTemplate(this.templateId);
                    let sortedColors = [...new Set(allTemplateColors)];

                    if (customOrder && customOrder.length > 0 && drawingOrder !== 'randomColor') {
                        const orderMap = new Map(customOrder.map((id, index) => [id, index]));
                        sortedColors.sort((a, b) => (orderMap.get(a) ?? 999) - (orderMap.get(b) ?? 999));
                    } else {
                        sortedColors.sort((a, b) => (a === 1 ? -1 : b === 1 ? 1 : colorCounts[a] - colorCounts[b]));
                    }

                    colorsToPaint = sortedColors.filter(c => mismatchedColors.has(c));
                    if (drawingOrder === 'randomColor') {
                        for (let i = colorsToPaint.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [colorsToPaint[i], colorsToPaint[j]] = [colorsToPaint[j], colorsToPaint[i]];
                        }
                    }
                    if (this.eraseMode && mismatchedColors.has(0)) {
                        colorsToPaint.push(0);
                    }
                } else {
                    colorsToPaint = [null];
                }
                log('SYSTEM', 'wplacer', `[${this.name}] 🎯 Paint plan prepared. drawingOrder=${drawingOrder}, colors=${colorsToPaint.map((c) => c === null ? 'ALL' : (COLOR_NAMES[c] || `ID:${c}`)).join(', ')}.`);

                let needsLongCooldown = false;

                for (const color of colorsToPaint) {
                    if (!this.running) break;

                    const passPixels = checkResult.mismatchedPixels.filter(p => color === null || p.color === color);
                    if (passPixels.length === 0) continue;

                    const safePixelSkip = Math.max(1, Number.parseInt(currentSettings.pixelSkip, 10) || 1);
                    const passSkips = [];
                    for (let skip = safePixelSkip; skip >= 1; skip = Math.floor(skip / 2)) {
                        passSkips.push(skip);
                        if (skip === 1) break;
                    }

                    for (let passIndex = 0; passIndex < passSkips.length; passIndex++) {
                        this.currentPixelSkip = passSkips[passIndex];
                        if (!this.running) break;

                        const pixelsInThisPass = passPixels.filter(p => (p.localX + p.localY) % this.currentPixelSkip === 0);
                        if (pixelsInThisPass.length === 0) continue;

                        log('SYSTEM', 'wplacer', `[${this.name}] Starting pass (${passIndex + 1}/${passSkips.length}) for color ${isColorMode ? (COLOR_NAMES[color] || 'Erase') : 'All'} | pixelSkip=${this.currentPixelSkip} | targetedPixels=${pixelsInThisPass.length}.`);

                        let passComplete = false;
                        while (this.running && !passComplete) {
                            if (this.userQueue.length === 0) {
                                log('SYSTEM', 'wplacer', `[${this.name}] ⏳ No valid users in queue. Waiting...`);
                                await this.cancellableSleep(5000);
                                this.userQueue = [...this.userIds];
                                continue;
                            }

                            const readyUsers = [];
                            const now = Date.now();

                            for (const userId of this.userQueue) {
                                if (!users[userId] || (users[userId].suspendedUntil && now < users[userId].suspendedUntil)) {
                                    continue;
                                }

                                if (ChargeCache.stale(userId, now)) {
                                    if (!activeBrowserUsers.has(userId)) {
                                        activeBrowserUsers.add(userId);
                                        const w = new WPlacer({});
                                        try { 
                                            const info = await w.login(getUserCookiesForLogin(users[userId]));
                                            users[userId].droplets = info.droplets;
                                        } catch (e) { 
                                            logUserError(e, userId, users[userId].name, 'opportunistic resync'); 
                                        } finally { 
                                            activeBrowserUsers.delete(userId); 
                                        }
                                    }
                                }

                                const predicted = ChargeCache.predict(userId, now);
                                if (!predicted) continue;

                                const threshold = getReadyChargeThreshold(predicted.max);
                                let potentialCharges = predicted.count;

                                // Factor in purchasable charges
                                if (this.canBuyCharges && users[userId].droplets) {
                                    const affordableDroplets = users[userId].droplets - currentSettings.dropletReserve;
                                    if (affordableDroplets >= 500) {
                                        const purchasable = Math.floor(affordableDroplets / 500) * 30;
                                        potentialCharges += purchasable;
                                    }
                                }
                                
                                if (potentialCharges >= threshold) {
                                    readyUsers.push({ userId, potentialCharges: Math.min(predicted.max, potentialCharges) });
                                }
                            }
                            log('SYSTEM', 'wplacer', `[${this.name}] 👥 Ready users for this pass: ${readyUsers.length > 0 ? readyUsers.map((u) => `${users[u.userId]?.name || u.userId}:${u.potentialCharges}`).join(', ') : 'none'}. Queue=${this.userQueue.length}.`);

                            let bestUser = null;
                            if (readyUsers.length > 0) {
                                readyUsers.sort((a, b) => b.potentialCharges - a.potentialCharges);
                                bestUser = readyUsers[0];
                            }
                            
                            if (bestUser) {
                                const { userId } = bestUser;
                                activeBrowserUsers.add(userId);
                                const wplacer = new WPlacer({ template: this.template, coords: this.coords, globalSettings: currentSettings, templateSettings: this, templateName: this.name });
                                
                                try {
                                    const userInfo = await wplacer.login(getUserCookiesForLogin(users[userId]));
                                    this.status = `Running user ${userInfo.name} | Pass (${passIndex + 1}/${passSkips.length})`;

                                    await this.handleChargePurchases(wplacer);

                                    const chargesBeforePaint = ChargeCache._extractFromUserInfo(wplacer.userInfo);
                                    log(userInfo.id, userInfo.name, `[${this.name}] 🔋 Best user selected. Ready with charges: ${chargesBeforePaint.count}/${chargesBeforePaint.max}.`);

                                    const paintedTurn = await this._performPaintTurn(wplacer, color);
                                    log(userInfo.id, userInfo.name, `[${this.name}] ✅ Paint turn finished. Painted ${paintedTurn} px (color=${color === null ? 'ALL' : (COLOR_NAMES[color] || `ID:${color}`)}).`);
                                    await this.handleUpgrades(wplacer);

                                    users[userId].droplets = wplacer.userInfo.droplets;

                                } catch (error) {
                                    if (error.name !== 'SuspensionError') logUserError(error, userId, users[userId].name, 'perform paint turn');
                                } finally {
                                    activeBrowserUsers.delete(userId);
                                    const queueIdx = this.userQueue.indexOf(userId);
                                    if (queueIdx > -1) this.userQueue.push(this.userQueue.splice(queueIdx, 1)[0]);
                                }

                                const postPaintCheck = await this._findWorkingUserAndCheckPixels();
                                if (postPaintCheck) {
                                    const remainingPassPixels = postPaintCheck.mismatchedPixels.filter(p => (color === null || p.color === color) && (p.localX + p.localY) % this.currentPixelSkip === 0);
                                    if (remainingPassPixels.length === 0) {
                                        log('SYSTEM', 'wplacer', `[${this.name}] ✅ Pass (${passIndex + 1}/${passSkips.length}) complete.`);
                                        passComplete = true;
                                    } else {
                                        log('SYSTEM', 'wplacer', `[${this.name}] 🔁 Pass (${passIndex + 1}/${passSkips.length}) still has ${remainingPassPixels.length} pixels pending for ${color === null ? 'all colors' : (COLOR_NAMES[color] || `ID:${color}`)}.`);
                                    }
                                } else {
                                    log('SYSTEM', 'wplacer', `[${this.name}] ⚠️ Post-paint verification failed due to user/login issues. Will retry.`);
                                }
                                if (this.running && !passComplete && currentSettings.accountCooldown > 0) {
                                    log('SYSTEM', 'wplacer', `[${this.name}] ⏱️ Waiting for cooldown (${duration(currentSettings.accountCooldown)}).`);
                                    await this.cancellableSleep(currentSettings.accountCooldown);
                                }

                            } else {
                                const cooldowns = this.userQueue.map(id => {
                                    const p = ChargeCache.predict(id, now);
                                    if (!p || p.count >= p.max) return Infinity;
                                    const th = getReadyChargeThreshold(p.max);

                                    if (p.count >= th) {
                                        return Math.max(0, (p.max - p.count)) * (p.cooldownMs ?? 30_000);
                                    }
                                    return Math.max(0, (th - p.count) * (p.cooldownMs ?? 30_000));
                                });

                                const finiteCooldowns = cooldowns.filter((ms) => Number.isFinite(ms));
                                let waitTime = (finiteCooldowns.length > 0 ? Math.min(...finiteCooldowns) : 60_000) + 2000;
                                if (!Number.isFinite(waitTime) || waitTime <= 0) waitTime = 60_000;
                                if (waitTime < currentSettings.accountCooldown) {
                                    log('SYSTEM', 'wplacer', `[${this.name}] ⚠️ Calculated wait time (${duration(waitTime)}) is unusually short. Defaulting to account cooldown to prevent rapid looping.`);
                                    waitTime = currentSettings.accountCooldown;
                                }

                                this.status = 'Waiting for charges.';
                                log('SYSTEM', 'wplacer', `[${this.name}] ⏳ No users ready. Waiting ~${duration(waitTime)}.`);
                                await this.cancellableSleep(waitTime);
                                log('SYSTEM', 'wplacer', `[${this.name}] 🫃 Woke up. Re-evaluating...`);
                                needsLongCooldown = true;
                                break;
                            }
                        }
                        if (needsLongCooldown) break;
                    }
                    if (needsLongCooldown) break;
                }
            }
        } finally {
            activePaintingTasks--;
            if (this.status !== 'Finished.') this.status = 'Stopped.';
            this.userIds.forEach((id) => activeTemplateUsers.delete(id));
            log('SYSTEM', 'wplacer', `[${this.name}] 🧹 Template loop finished. running=${this.running}, status="${this.status}". Releasing users: ${describeTemplateUsers(this)}.`);
            refreshCamoufoxFleetForActiveTemplates().catch((e) => log('SYSTEM', 'Camoufox', 'Error refreshing fleet after template finish', e));
            processQueue();
        }
    }
}



const normalizeProxyUrl = (raw) => {
    if (!raw) return null;
    let v = String(raw).trim();
    if (!v) return null;
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(v)) v = `http://${v}`;
    return v;
};

const loadAutoLoginWebshareConfig = () => {
    if (!existsSync(AUTO_LOGIN_WEBSHARE_CONFIG)) return { apiKey: '', username: '', password: '', pageSize: 100 };
    try {
        const cfg = JSON.parse(readFileSync(AUTO_LOGIN_WEBSHARE_CONFIG, 'utf8'));
        return {
            apiKey: cfg.apiKey || '',
            username: cfg.username || '',
            password: cfg.password || '',
            pageSize: Number(cfg.pageSize) || 100,
        };
    } catch {
        return { apiKey: '', username: '', password: '', pageSize: 100 };
    }
};

const saveAutoLoginWebshareConfig = (cfg) => {
    const next = {
        apiKey: cfg.apiKey || '',
        username: cfg.username || '',
        password: cfg.password || '',
        pageSize: Math.max(25, Math.min(100, Number(cfg.pageSize) || 100)),
    };
    writeFileSync(AUTO_LOGIN_WEBSHARE_CONFIG, JSON.stringify(next, null, 2));
    return next;
};

const fetchWebshareProxies = async (apiKey, pageSize = 100) => {
    const headers = { Authorization: `Token ${apiKey}` };
    let url = `https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page=1&page_size=${pageSize}`;
    const all = [];
    while (url) {
        const imp = new Impit({ ignoreTlsErrors: true });
        const r = await imp.fetch(url, { method: 'GET', headers });
        if (!r.ok) {
            const txt = await r.text();
            throw new Error(`Webshare error ${r.status}: ${txt.slice(0, 240)}`);
        }
        const data = await r.json();
        for (const p of data.results || []) {
            const host = p.proxy_address || p.ip_address || p.ip;
            const port = p.port;
            const user = p.username;
            const pass = p.password;
            if (!host || !port) continue;
            const auth = user && pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
            all.push(`http://${auth}${host}:${port}`);
        }
        url = data.next;
    }
    return [...new Set(all)];
};

const readAutoLoginProxyStatus = async () => {
    if (!existsSync(AUTO_LOGIN_PROXY_DB)) return { available: 0, occupied: 0, total: 0, proxies: [] };
    const py = [
        'import sqlite3, json',
        `db = sqlite3.connect(r"${AUTO_LOGIN_PROXY_DB}")`,
        'rows = db.execute("SELECT proxy_url, status, last_used_by, updated_at FROM proxies ORDER BY status DESC, updated_at DESC").fetchall()',
        'db.close()',
        'proxies = [{"proxy": r[0], "status": r[1], "account": r[2], "updatedAt": r[3]} for r in rows]',
        'occupied = len([p for p in proxies if p.get("status") == "occupied"])',
        'print(json.dumps({"available": len(proxies)-occupied, "occupied": occupied, "total": len(proxies), "proxies": proxies}))',
    ].join('; ');
    try {
        const out = execSync(`python -c '${py.replace(/'/g, "'\''")}'`, { encoding: 'utf8' });
        return JSON.parse(out || '{}');
    } catch {
        return { available: 0, occupied: 0, total: 0, proxies: [] };
    }
};

// ---------- Express setup ----------

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json({ limit: JSON_LIMIT }));

// Autostart cache
const autostartedTemplates = [];

// ---------- Queue processor ----------

const processQueue = () => {
    if (templateQueue.length === 0) {
        log('SYSTEM', 'wplacer', '[Queue] processQueue called with an empty queue.');
        return;
    }
    log('SYSTEM', 'wplacer', `[Queue] Processing ${templateQueue.length} queued template(s): ${templateQueue.join(', ')}`);
    for (let i = 0; i < templateQueue.length; i++) {
        const templateId = templateQueue[i];
        const manager = templates[templateId];
        if (!manager) {
            log('SYSTEM', 'wplacer', `[Queue] Removing template ${templateId} from queue because it no longer exists.`);
            templateQueue.splice(i, 1);
            i--;
            continue;
        }
        const busy = manager.userIds.some((id) => activeTemplateUsers.has(id));
        if (!busy) {
            templateQueue.splice(i, 1);
            manager.userIds.forEach((id) => activeTemplateUsers.add(id));
            log('SYSTEM', 'wplacer', `[Queue] Starting queued template "${manager.name}" (${templateId}) with users: ${describeTemplateUsers(manager)}.`);
            refreshCamoufoxFleetForActiveTemplates().catch((e) => log('SYSTEM', 'Camoufox', 'Error refreshing fleet for queued template', e));
            manager.start().catch((e) => log(templateId, manager.masterName, 'Error starting queued template', e));
            break;
        } else {
            log('SYSTEM', 'wplacer', `[Queue] Template "${manager.name}" (${templateId}) still blocked by active users: ${describeBusyUsers(manager)}.`);
        }
    }
};

// --- Color Ordering ---

// Default color order sorted by id
let defaultColorOrder = Object.values(palette).sort((a, b) => a - b);

// Store color orders - initialize from disk
let colorOrdering = loadColorOrdering();

// Extract unique colors from template data
function getColorsInTemplate(templateData) {
    if (!templateData?.data) return [];

    const uniqueColors = new Set();

    // Flatten and filter in one pass
    templateData.data.flat().forEach(colorId => {
        if (colorId > 0) uniqueColors.add(colorId);
    });

    return Array.from(uniqueColors).sort((a, b) => a - b);
}

// Load color ordering from disk
function loadColorOrdering() {
    const orderingPath = path.join(DATA_DIR, 'color_ordering.json');

    if (existsSync(orderingPath)) {
        try {
            const data = JSON.parse(readFileSync(orderingPath, 'utf8'));
            return {
                global: data.global || [...defaultColorOrder],
                templates: data.templates || {}
            };
        } catch (e) {
            console.error('Error loading color ordering:', e.message);
        }
    }

    return {
        global: [...defaultColorOrder],
        templates: {}
    };
}

// Save color ordering to disk
function saveColorOrdering() {
    const orderingPath = path.join(DATA_DIR, 'color_ordering.json');

    try {
        writeFileSync(orderingPath, JSON.stringify(colorOrdering, null, 2));
        console.log('Color ordering saved successfully');
    } catch (e) {
        console.error('Error saving color ordering:', e.message);
        throw e; // Re-throw so calling code knows it failed
    }
}

// Helper to get color order for specific context
function getColorOrder(templateId = null) {
    return templateId && colorOrdering.templates[templateId]
        ? colorOrdering.templates[templateId]
        : colorOrdering.global;
}

// Helper to set color order for specific context
function setColorOrder(order, templateId = null) {
    if (templateId) {
        colorOrdering.templates[templateId] = [...order];
    } else {
        colorOrdering.global = [...order];
    }
    saveColorOrdering();
}

const validateColorIds = (order) => {
    const validIds = new Set(Object.values(palette));
    return order.filter(id => Number.isInteger(id) && validIds.has(id));
};

// ---------- API ----------

// --- Logs API ---
import { createReadStream, statSync } from 'node:fs';

// Helper: stream file from offset
function streamLogFile(res, filePath, lastSize) {
    try {
        const stats = statSync(filePath);
        const size = stats.size;
        if (lastSize && lastSize < size) {
            // Send only new data
            const stream = createReadStream(filePath, { start: lastSize });
            stream.pipe(res);
        } else {
            // Send whole file
            const stream = createReadStream(filePath);
            stream.pipe(res);
        }
    } catch (e) {
        res.status(500).end();
    }
}

// Simple polling endpoint for logs (returns full file, or new data if client provides lastSize)
app.get('/logs', (req, res) => {
    const filePath = LOGS_FILE
    const lastSize = req.query.lastSize ? parseInt(req.query.lastSize, 10) : 0;
    streamLogFile(res, filePath, lastSize);
});

app.get('/errors', (req, res) => {
    const filePath = ERRORS_FILE
    const lastSize = req.query.lastSize ? parseInt(req.query.lastSize, 10) : 0;
    streamLogFile(res, filePath, lastSize);
});

let lastTokenNeededState = null;
app.get('/token-needed', (_req, res) => {
    if (lastTokenNeededState !== TokenManager.isTokenNeeded) {
        log('SYSTEM', 'wplacer', `[TokenBridge] token-needed state changed -> ${TokenManager.isTokenNeeded ? 'NEEDED' : 'NOT_NEEDED'}. queue=${TokenManager.tokenQueue.length}.`);
        lastTokenNeededState = TokenManager.isTokenNeeded;
    }
    res.json({ needed: TokenManager.isTokenNeeded });
});
app.get('/bridge/config', (_req, res) => res.json({
    primaryPort: APP_PRIMARY_PORT,
    fallbackPorts: APP_FALLBACK_PORTS,
    host: APP_HOST,
}));

const normalizeBridgeTokenPayload = (body = {}) => {
    const candidate = body?.t ?? body?.token ?? body?.turnstileToken ?? body?.turnstile ?? body?.data?.t ?? body?.data?.token ?? null;
    const pawtect = body?.pawtect ?? body?.pawtectToken ?? body?.data?.pawtect ?? null;
    const fp = body?.fp ?? body?.fingerprint ?? body?.data?.fp ?? null;
    return {
        t: typeof candidate === 'string' ? candidate : null,
        pawtect: typeof pawtect === 'string' ? pawtect : null,
        fp: typeof fp === 'string' ? fp : null,
    };
};
app.post('/t', (req, res) => {
    const { t, pawtect, fp } = normalizeBridgeTokenPayload(req.body || {});
    if (!t) {
        log('SYSTEM', 'wplacer', `[TokenBridge] Rejected token payload on /t. Keys: ${Object.keys(req.body || {}).join(', ') || 'none'}.`);
        return res.status(HTTP_STATUS.BAD_REQ).json({ error: 'Missing turnstile token field (expected t/token).' });
    }

    TokenManager.setToken(t);
    try {
        if (pawtect) globalThis.__wplacer_last_pawtect = pawtect;
        if (fp) globalThis.__wplacer_last_fp = fp;
    } catch {}

    log('SYSTEM', 'wplacer', `[TokenBridge] Accepted token on /t (len=${t.length}, pawtect=${pawtect ? 'yes' : 'no'}, fp=${fp ? 'yes' : 'no'}, ip=${req.ip || 'unknown'}).`);
    res.status(HTTP_STATUS.OK).json({ ok: true });
});
app.post('/token', (req, res) => {
    const { t, pawtect, fp } = normalizeBridgeTokenPayload(req.body || {});
    if (!t) {
        log('SYSTEM', 'wplacer', `[TokenBridge] Rejected token payload on /token. Keys: ${Object.keys(req.body || {}).join(', ') || 'none'}.`);
        return res.status(HTTP_STATUS.BAD_REQ).json({ error: 'Missing turnstile token field (expected t/token).' });
    }

    TokenManager.setToken(t);
    try {
        if (pawtect) globalThis.__wplacer_last_pawtect = pawtect;
        if (fp) globalThis.__wplacer_last_fp = fp;
    } catch {}

    log('SYSTEM', 'wplacer', `[TokenBridge] Accepted token on /token (len=${t.length}, pawtect=${pawtect ? 'yes' : 'no'}, fp=${fp ? 'yes' : 'no'}, ip=${req.ip || 'unknown'}).`);
    res.status(HTTP_STATUS.OK).json({ ok: true });
});


// Users
app.get('/users', (_req, res) => res.json(users));

/**
 * Batch imports JWT tokens as users.
 * Each token is converted to a full cookie-object and validated via /me.
 * Uses bounded concurrency to improve throughput without overwhelming backend.
 */
app.post('/users/import', async (req, res) => {
    const input = Array.isArray(req.body?.tokens) ? req.body.tokens : [];
    if (!input.length) return res.status(HTTP_STATUS.BAD_REQ).json({ error: 'tokens[] is required' });

    const cleanTokens = [...new Set(input.map((t) => String(t || '').trim()).filter(Boolean))];
    if (!cleanTokens.length) return res.status(HTTP_STATUS.BAD_REQ).json({ error: 'No valid tokens provided' });

    const existing = new Set(Object.values(users).map((u) => u?.cookies?.j).filter(Boolean));
    const queue = cleanTokens.filter((token) => !existing.has(token));
    const skipped = cleanTokens.length - queue.length;

    let imported = 0;
    const errors = [];
    const importedUsers = [];

    const worker = async (token) => {
        const wplacer = new WPlacer({});
        try {
            const cookieObjects = [tokenToBackendCookie(token)];
            const userInfo = await wplacer.login(cookieObjects);
            const banned = users[userInfo.id]?.suspendedUntil;

            users[userInfo.id] = {
                name: userInfo.name,
                cookies: { j: token },
                cookieObjects,
                expirationDate: Date.now() + (365 * 24 * 60 * 60 * 1000),
            };
            if (banned && banned > Date.now()) users[userInfo.id].suspendedUntil = banned;

            imported++;
            importedUsers.push({ id: userInfo.id, name: userInfo.name });
        } catch (error) {
            errors.push({ tokenPreview: `${token.slice(0, 8)}...`, error: error?.message || 'Unknown error' });
        }
    };

    const MAX_CONCURRENT = 5;
    for (let i = 0; i < queue.length; i += MAX_CONCURRENT) {
        const chunk = queue.slice(i, i + MAX_CONCURRENT);
        await Promise.all(chunk.map(worker));
    }

    saveUsers();
    return res.json({
        success: true,
        total: cleanTokens.length,
        imported,
        skipped,
        failed: errors.length,
        importedUsers,
        errors,
    });
});


app.post('/user', async (req, res) => {
    const incomingCookies = req.body?.cookieObjects || req.body?.cookies;
    const normalized = normalizeCookiesForJar(incomingCookies);
    const jCookie = normalized.find((c) => c.name === 'j');
    if (!jCookie) return res.sendStatus(HTTP_STATUS.BAD_REQ);
    const wplacer = new WPlacer({});
    try {
        const userInfo = await wplacer.login(normalized);
        let banned = users[userInfo.id]?.suspendedUntil; // Save any previous suspendedUntil property
        users[userInfo.id] = {
            name: userInfo.name,
            cookies: { j: jCookie.value },
            cookieObjects: normalized,
            expirationDate: req.body.expirationDate,
        };

        if (banned && banned > new Date())
            users[userInfo.id].suspendedUntil = banned // Restore the suspsendedUntil property from users file if is still suspended

        saveUsers();
        res.json(userInfo);
    } catch (error) {
        logUserError(error, 'NEW_USER', 'N/A', 'add new user');
        res.status(HTTP_STATUS.SRV_ERR).json({ error: error.message });
    }
});

app.delete('/user/:id', async (req, res) => {
    const userId = req.params.id;
    if (!userId || !users[userId]) return res.sendStatus(HTTP_STATUS.BAD_REQ);

    const deletedName = users[userId].name;
    delete users[userId];
    saveUsers();
    log('SYSTEM', 'Users', `🗑️ Deleted user ${deletedName}#${userId}.`);

    let templatesModified = false;
    for (const templateId in templates) {
        const manager = templates[templateId];
        const before = manager.userIds.length;
        manager.userIds = manager.userIds.filter((id) => id !== userId);
        manager.userQueue = manager.userQueue.filter((id) => id !== userId);
        if (manager.userIds.length < before) {
            templatesModified = true;
            log('SYSTEM', 'Templates', `🗑️ Removed user ${deletedName}#${userId} from template "${manager.name}".`);
            if (manager.masterId === userId) {
                manager.masterId = manager.userIds[0] || null;
                manager.masterName = manager.masterId ? users[manager.masterId].name : null;
            }
            if (manager.userIds.length === 0 && manager.running) {
                manager.running = false;
                log('SYSTEM', 'wplacer', `[${manager.name}] 🛑 Template stopped, no users left.`);
            }
        }
    }
    if (templatesModified) saveTemplates();
    res.sendStatus(HTTP_STATUS.OK);
});

app.get('/user/status/:id', async (req, res) => {
    const { id } = req.params;
    if (!users[id]) return res.status(HTTP_STATUS.CONFLICT).json({ error: 'User not found' });

    // If busy, wait briefly; if still busy, try to return cached status
    if (activeBrowserUsers.has(id)) {
        const ok = await waitForNotBusy(id, 5_000);
        if (!ok) {
            const cached = getStatusCache(id);
            if (cached) return res.status(HTTP_STATUS.OK).json({ ...cached, cached: true });
            return res.status(HTTP_STATUS.CONFLICT).json({ error: 'User is busy' });
        }
    }

    activeBrowserUsers.add(id);
    const wplacer = new WPlacer({});
    try {
        const userInfo = await wplacer.login(getUserCookiesForLogin(users[id]));
        setStatusCache(id, userInfo);
        res.status(HTTP_STATUS.OK).json(userInfo);
    } catch (error) {
        logUserError(error, id, users[id].name, 'validate cookie');
        res.status(HTTP_STATUS.SRV_ERR).json({ error: error.message });
    } finally {
        activeBrowserUsers.delete(id);
    }
});

app.post('/users/status', async (_req, res) => {
    const userIds = Object.keys(users);
    const results = {};

    const USER_TIMEOUT_MS = MS.THIRTY_SEC;
    const withTimeout = (p, ms, label) =>
        Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout`)), ms))]);

    const checkUser = async (id) => {
        if (activeBrowserUsers.has(id)) {
            results[id] = { success: false, error: 'User is busy.' };
            return;
        }
        activeBrowserUsers.add(id);
        const wplacer = new WPlacer({});
        try {
            const userInfo = await wplacer.login(getUserCookiesForLogin(users[id]));
            setStatusCache(id, userInfo);
            results[id] = { success: true, data: userInfo };
        } catch (error) {
            logUserError(error, id, users[id].name, 'bulk check');
            results[id] = { success: false, error: error.message };
        } finally {
            activeBrowserUsers.delete(id);
        }
    };

    for (const uid of userIds) {
        try {
            await withTimeout(checkUser(uid), USER_TIMEOUT_MS, `user ${uid}`);
        } catch (err) {
            results[uid] = { success: false, error: err.message };
        }
    }
    res.json(results);
});

// Templates
app.get('/templates', (req, res) => {
    const templateList = {};

    for (const id in templates) {
        const manager = templates[id];
        try {
            // Create a safe share code
            let shareCode;
            try {
                shareCode = manager.template.shareCode || shareCodeFromTemplate(manager.template);
            } catch (shareCodeError) {
                console.warn(`Could not generate share code for template ${id}: ${shareCodeError.message}`);
                shareCode = null; // Don't include invalid share code
            }

            templateList[id] = {
                id: id,
                name: manager.name,
                coords: manager.coords,
                canBuyCharges: manager.canBuyCharges,
                canBuyMaxCharges: manager.canBuyMaxCharges,
                antiGriefMode: manager.antiGriefMode,
                eraseMode: manager.eraseMode,
                outlineMode: manager.outlineMode,
                skipPaintedPixels: manager.skipPaintedPixels,
                enableAutostart: manager.enableAutostart,
                userIds: manager.userIds,
                running: manager.running,
                status: manager.status,
                masterId: manager.masterId,
                masterName: manager.masterName,
                totalPixels: manager.totalPixels,
                pixelsRemaining: manager.pixelsRemaining,
                currentPixelSkip: manager.currentPixelSkip,
                template: {
                    width: manager.template.width,
                    height: manager.template.height,
                    data: manager.template.data,
                    shareCode: shareCode
                }
            };
        } catch (error) {
            console.warn(`Error processing template ${id} for API response: ${error.message}`);
        }
    }

    res.json(templateList);
});

app.post('/templates/import', (req, res) => {
    const { id, name, coords, code } = req.body || {};
    if (!id || !code) return res.status(HTTP_STATUS.BAD_REQ).json({ error: 'id and code required' });
    const tmpl = templateFromShareCode(code);
    templates[id] = {
        templateId: id,
        name: name || `Template ${id}`,
        coords: coords || [0, 0],
        canBuyCharges: false,
        canBuyMaxCharges: false,
        antiGriefMode: false,
        eraseMode: false,
        outlineMode: false,
        skipPaintedPixels: false,
        enableAutostart: false,
        userIds: [],
        template: { ...tmpl, shareCode: code },
        running: false,
        status: 'idle',
        pixelsRemaining: tmpl.width * tmpl.height,
        totalPixels: tmpl.width * tmpl.height,
    };
    saveTemplatesCompressed();
    res.json({ ok: true });
});

app.post('/template', (req, res) => {
    const {
        templateName,
        template,
        coords,
        userIds,
        canBuyCharges,
        canBuyMaxCharges,
        antiGriefMode,
        eraseMode,
        outlineMode,
        skipPaintedPixels,
        enableAutostart,
    } = req.body || {};
    if (!templateName || !template || !coords || !userIds || !userIds.length)
        return res.sendStatus(HTTP_STATUS.BAD_REQ);
    if (Object.values(templates).some((t) => t.name === templateName))
        return res.status(HTTP_STATUS.CONFLICT).json({ error: 'A template with this name already exists.' });

    const templateId = Date.now().toString();
    templates[templateId] = new TemplateManager({
        templateId: templateId,
        name: templateName,
        templateData: template,
        coords,
        canBuyCharges,
        canBuyMaxCharges,
        antiGriefMode,
        eraseMode,
        outlineMode,
        skipPaintedPixels,
        enableAutostart,
        userIds,
    });
    saveTemplates();
    res.status(HTTP_STATUS.OK).json({ id: templateId });
});

app.delete('/template/:id', (req, res) => {
    const { id } = req.params;
    if (!id || !templates[id] || templates[id].running) return res.sendStatus(HTTP_STATUS.BAD_REQ);
    delete templates[id];
    saveTemplates();
    res.sendStatus(HTTP_STATUS.OK);
});

app.put('/template/edit/:id', (req, res) => {
    const { id } = req.params;
    if (!templates[id]) return res.sendStatus(HTTP_STATUS.BAD_REQ);
    const manager = templates[id];
    const {
        templateName,
        coords,
        userIds,
        canBuyCharges,
        canBuyMaxCharges,
        antiGriefMode,
        eraseMode,
        outlineMode,
        skipPaintedPixels,
        enableAutostart,
        template,
    } = req.body || {};

    manager.name = templateName;
    manager.coords = coords;
    manager.userIds = userIds;
    manager.userQueue = [...userIds];
    manager.canBuyCharges = canBuyCharges;
    manager.canBuyMaxCharges = canBuyMaxCharges;
    manager.antiGriefMode = antiGriefMode;
    manager.eraseMode = eraseMode;
    manager.outlineMode = outlineMode;
    manager.skipPaintedPixels = skipPaintedPixels;
    manager.enableAutostart = enableAutostart;

    if (template) {
        manager.template = template;
        manager.totalPixels = manager.template.data.flat().filter((p) => p > 0).length;
    }
    manager.masterId = manager.userIds[0];
    manager.masterName = users[manager.masterId].name;
    saveTemplatesCompressed();
    res.sendStatus(HTTP_STATUS.OK);
});

app.put('/template/:id', (req, res) => {
    const { id } = req.params;
    if (!id || !templates[id]) return res.sendStatus(HTTP_STATUS.BAD_REQ);
    const manager = templates[id];

    log('SYSTEM', 'wplacer', `[API] Template toggle requested for "${manager.name}" (${id}). running=${Boolean(req.body.running)} currentRunning=${manager.running}. queueSize=${templateQueue.length}.`);

    if (req.body.running && !manager.running) {
        // STARTING a template
        const busy = manager.userIds.some((uid) => activeTemplateUsers.has(uid));
        if (busy) {
            if (!templateQueue.includes(id)) {
                templateQueue.push(id);
                manager.status = 'Queued';
                log('SYSTEM', 'wplacer', `[${manager.name}] ⏳ Template queued as its users are busy. Busy users: ${describeBusyUsers(manager)}.`);
                log('SYSTEM', 'wplacer', `[Queue] Queue is now: ${templateQueue.join(', ')}`);
            } else {
                log('SYSTEM', 'wplacer', `[${manager.name}] ℹ️ Start requested but template is already queued. Queue: ${templateQueue.join(', ')}`);
            }
        } else {
            manager.userIds.forEach((uid) => activeTemplateUsers.add(uid));
            log('SYSTEM', 'wplacer', `[${manager.name}] ▶️ Starting immediately. Reserved users: ${describeTemplateUsers(manager)}.`);
            refreshCamoufoxFleetForActiveTemplates().catch((e) => log('SYSTEM', 'Camoufox', 'Error refreshing fleet on start', e));
            manager.start().catch((e) => log(id, manager.masterName, 'Error starting template', e));
        }
    } else if (!req.body.running && manager.running) {
        // STOPPING a template
        log('SYSTEM', 'wplacer', `[${manager.name}] 🛑 Template stopped by user.`);
        manager.running = false;
        const idx = templateQueue.indexOf(id);
        if (idx > -1) {
            templateQueue.splice(idx, 1);
            log('SYSTEM', 'wplacer', `[Queue] Removed "${manager.name}" (${id}) from queue on stop.`);
        }

        manager.userIds.forEach((uid) => activeTemplateUsers.delete(uid));
        log('SYSTEM', 'wplacer', `[${manager.name}] 🔓 Released users on stop: ${describeTemplateUsers(manager)}.`);
        refreshCamoufoxFleetForActiveTemplates().catch((e) => log('SYSTEM', 'Camoufox', 'Error refreshing fleet on stop', e));
        processQueue(); // Always process queue after stopping
    } else {
        log('SYSTEM', 'wplacer', `[API] No state transition needed for "${manager.name}" (${id}).`);
    }
    res.sendStatus(HTTP_STATUS.OK);
});

// Settings
app.get('/settings', (_req, res) => res.json({ ...currentSettings, proxyCount: loadedProxies.length }));
app.put('/settings', (req, res) => {
    const prev = { ...currentSettings };
    currentSettings = { ...prev, ...req.body };

    currentSettings.accountCooldown = Math.max(0, Number.parseInt(currentSettings.accountCooldown, 10) || 0);
    currentSettings.purchaseCooldown = Math.max(0, Number.parseInt(currentSettings.purchaseCooldown, 10) || 0);
    currentSettings.readyChargeThreshold = Math.max(1, Number.parseInt(currentSettings.readyChargeThreshold, 10) || 1);
    currentSettings.maxPixelsPerTurn = Math.max(0, Number.parseInt(currentSettings.maxPixelsPerTurn, 10) || 0);

    saveSettings();

    const schedulingChanged = (
        prev.chargeThreshold !== currentSettings.chargeThreshold
        || prev.readyChargeThreshold !== currentSettings.readyChargeThreshold
        || prev.maxPixelsPerTurn !== currentSettings.maxPixelsPerTurn
    );
    if (schedulingChanged) {
        for (const id in templates) if (templates[id].running) templates[id].interruptSleep();
    }
    res.sendStatus(HTTP_STATUS.OK);
});

// Proxies
app.post('/reload-proxies', (_req, res) => {
    loadProxies();
    res.status(HTTP_STATUS.OK).json({ success: true, count: loadedProxies.length });
});


app.get('/autologin/webshare-config', (_req, res) => {
    const cfg = loadAutoLoginWebshareConfig();
    res.json({ ...cfg, hasApiKey: Boolean(cfg.apiKey) });
});

app.put('/autologin/webshare-config', (req, res) => {
    try {
        const cfg = saveAutoLoginWebshareConfig(req.body || {});
        res.json({ success: true, ...cfg, hasApiKey: Boolean(cfg.apiKey) });
    } catch (e) {
        res.status(HTTP_STATUS.BAD_REQ).json({ error: e.message });
    }
});

app.post('/autologin/webshare-test', async (_req, res) => {
    try {
        const cfg = loadAutoLoginWebshareConfig();
        if (!cfg.apiKey) return res.status(HTTP_STATUS.BAD_REQ).json({ error: 'Missing API key' });
        const imp = new Impit({ ignoreTlsErrors: true });
        const r = await imp.fetch('https://proxy.webshare.io/api/v2/profile/', {
            headers: { Authorization: `Token ${cfg.apiKey}` },
        });
        if (!r.ok) {
            const txt = await r.text();
            return res.status(r.status).json({ error: `Auth failed: ${txt.slice(0, 240)}` });
        }
        const data = await r.json();
        res.json({ success: true, profile: data });
    } catch (e) {
        res.status(HTTP_STATUS.SRV_ERR).json({ error: e.message });
    }
});

app.post('/autologin/webshare-sync-proxies', async (_req, res) => {
    try {
        const cfg = loadAutoLoginWebshareConfig();
        if (!cfg.apiKey) return res.status(HTTP_STATUS.BAD_REQ).json({ error: 'Missing API key' });
        const proxyList = await fetchWebshareProxies(cfg.apiKey, cfg.pageSize || 100);
        const normalized = proxyList.map(normalizeProxyUrl).filter(Boolean);
        const payload = normalized.join('\n') + (normalized.length ? '\n' : '');
        writeFileSync(AUTO_LOGIN_PROXIES, payload);
        writeFileSync(path.join(DATA_DIR, 'proxies.txt'), payload);
        loadProxies();
        res.json({ success: true, count: normalized.length });
    } catch (e) {
        res.status(HTTP_STATUS.SRV_ERR).json({ error: e.message });
    }
});

app.post('/autologin/prepare-python', (_req, res) => {
    try {
        if (!existsSync(AUTO_LOGIN_REQUIREMENTS)) {
            return res.status(HTTP_STATUS.BAD_REQ).json({ error: 'AUTO_LOGIN/requirements.txt not found' });
        }
        const output = execSync(`python -m pip install -r "${AUTO_LOGIN_REQUIREMENTS}"`, { encoding: 'utf8' });
        res.json({ success: true, output: String(output || '').slice(-2000) });
    } catch (e) {
        res.status(HTTP_STATUS.SRV_ERR).json({ error: e.message, output: String(e.stdout || e.stderr || '').slice(-2000) });
    }
});

app.get('/autologin/proxy-status', async (_req, res) => {
    const status = await readAutoLoginProxyStatus();
    res.json(status);
});

// Canvas proxy (returns data URI)
// Return raw PNG; short cache for smoother previews in the UI
app.get('/canvas', async (req, res) => {
    const { tx, ty } = req.query;
    if (isNaN(parseInt(tx)) || isNaN(parseInt(ty))) return res.sendStatus(HTTP_STATUS.BAD_REQ);
    try {
        const proxyUrl = getNextProxy();
        const imp = new Impit({ ignoreTlsErrors: true, ...(proxyUrl ? { proxyUrl } : {}) });
        const r = await imp.fetch(TILE_URL(tx, ty));
        if (!r.ok) return res.sendStatus(r.status);
        const buffer = Buffer.from(await r.arrayBuffer());
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=30');
        res.send(buffer);
    } catch (error) {
        res.status(HTTP_STATUS.SRV_ERR).json({ error: error.message });
    }
});

// Palette API for UI to stay in sync with server palette and names
// Used by the UI to sync palette on startup
app.get('/palette', (_req, res) => {
    try {
        const colors = Object.entries(palette).map(([rgb, id]) => ({
            id,
            rgb,
            name: COLOR_NAMES[id] || null,
        }));
        res.json({ colors });
    } catch (e) {
        console.warn('[palette] failed:', e?.message || e);
        res.status(HTTP_STATUS.SRV_ERR).json({ error: 'Failed to get palette' });
    }
});

// Color ordering endpoints
// Get color ordering
app.get('/color-ordering', (req, res) => {
    const { templateId } = req.query;

    if (templateId && templates[templateId]) {
        const availableColors = getColorsInTemplate(templates[templateId].template);
        const currentOrder = getColorOrder(templateId).filter(id => availableColors.includes(id));
        res.json({ order: currentOrder, availableColors, filteredByTemplate: true });
    } else {
        res.json({
            order: colorOrdering.global,
            availableColors: Object.values(palette),
            filteredByTemplate: false
        });
    }
});

// Update global color ordering
app.put('/color-ordering/global', (req, res) => {
    const validOrder = validateColorIds(req.body.order || []);

    if (!validOrder.length) {
        return res.status(400).json({ error: 'No valid color IDs provided' });
    }

    setColorOrder(validOrder);
    res.json({ success: true });
});

// Update template-specific color ordering
app.put('/color-ordering/template/:templateId', (req, res) => {
    const { templateId } = req.params;
    const template = templates[templateId];

    if (!template) {
        return res.status(400).json({ error: 'Template not found' });
    }

    const validOrder = validateColorIds(req.body.order || []);
    if (!validOrder.length) {
        return res.status(400).json({ error: 'No valid color IDs provided' });
    }

    setColorOrder(validOrder, templateId);
    log('SYSTEM', 'color-ordering', `Template "${template.name}" color order updated (${validOrder.length} colors)`);
    res.json({ success: true });
});

// Reset template color ordering
app.delete('/color-ordering/template/:templateId', (req, res) => {
    const { templateId } = req.params;

    if (colorOrdering.templates[templateId]) {
        delete colorOrdering.templates[templateId];
        saveColorOrdering();

        const templateName = templates[templateId]?.name || 'Unknown';
        log('SYSTEM', 'color-ordering', `Template "${templateName}" color order reset to global`);
    }

    res.json({ success: true });
});

// Get template colors
app.get('/template/:id/colors', (req, res) => {
    const template = templates[req.params.id];

    if (!template) {
        return res.status(400).json({ error: 'Template not found' });
    }

    const colorsInTemplate = getColorsInTemplate(template.template);
    const colorInfo = colorsInTemplate.map(colorId => ({
        id: colorId,
        name: COLOR_NAMES[colorId] || `Color ${colorId}`,
        rgb: Object.keys(palette).find(key => palette[key] === colorId) || null
    }));

    res.json({
        templateId: req.params.id,
        templateName: template.name,
        colors: colorInfo,
        totalUniqueColors: colorsInTemplate.length
    });
});

// ---------- One-time migration: old -> compressed ----------

function migrateOldTemplatesIfNeeded() {
    if (!existsSync(TEMPLATES_PATH)) return;
    let raw;
    try {
        raw = JSON.parse(readFileSync(TEMPLATES_PATH, 'utf8'));
    } catch {
        return;
    }

    let changed = false;
    const out = {};
    for (const id in raw) {
        const e = raw[id] || {};
        const te = e.template || {};
        try {
            if (!te.data || te.shareCode) {
                out[id] = e;
                continue;
            } // already new or missing data
            const width = te.width,
                height = te.height,
                data = te.data;
            const code = shareCodeFromTemplate({ width, height, data });
            out[id] = { ...e, template: { width, height, shareCode: code } };
            changed = true;
            console.log(`[migrate] compressed template ${id} (${e.name || 'unnamed'})`);
        } catch (err) {
            console.error(`[migrate] ⚠️ skip ${id}: ${err.message}`);
            out[id] = e;
        }
    }
    if (changed) {
        writeFileSync(TEMPLATES_PATH, JSON.stringify(out, null, 2));
        console.log(`[migrate] ✅ templates.json updated to compressed format`);
    }
}

// ---------- Keep-Alive System ----------
const runKeepAlive = async () => {
    log('SYSTEM', 'KeepAlive', '🔄 Starting hourly keep-alive check...');

    const trulyActiveUserIds = new Set();
    for (const templateId in templates) {
        const manager = templates[templateId];
        if (manager.running && manager.status !== 'Monitoring for changes.') {
            manager.userIds.forEach((id) => trulyActiveUserIds.add(id));
        }
    }

    const allUserIds = Object.keys(users);
    const usersToCheck = allUserIds.filter((id) => !trulyActiveUserIds.has(id));

    if (usersToCheck.length === 0) {
        log('SYSTEM', 'KeepAlive', '✅ No idle or anti-grief users to check. All users are in active painting cycles.');
        return;
    }

    log('SYSTEM', 'KeepAlive', `Found ${usersToCheck.length} idle or anti-grief users to check out of ${allUserIds.length} total users.`);

    let successCount = 0;
    let failCount = 0;

    for (const id of usersToCheck) {
        if (users[id].suspendedUntil && Date.now() < users[id].suspendedUntil) {
            log(id, users[id].name, '🚫 Keep-alive check skipped (account suspended).');
            continue;
        }
        const wplacer = new WPlacer({});
        try {
            // The login method performs a /me request, which is what we need.
            await wplacer.login(getUserCookiesForLogin(users[id]));
            log(id, users[id].name, '✔️ Keep-alive check successful.');
            successCount++;
        } catch (error) {
            logUserError(error, id, users[id].name, 'keep-alive check');
            failCount++;
        }
        await sleep(2000); // Stagger requests to avoid rate-limiting
    }

    log('SYSTEM', 'KeepAlive', `✅ Keep-alive check finished. Successful: ${successCount}, Failed: ${failCount}.`);
};

// ---------- Startup ----------
const diffVer = (v1, v2) => {
  const [a1, b1, c1] = v1.split(".").map(Number);
  const [a2, b2, c2] = v2.split(".").map(Number);
  return a1 !== a2 ? (a1 - a2) * 100 : b1 !== b2 ? (b1 - b2) * 10 : c1 - c2;
};
(async () => {
    console.clear();
    const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
    console.log(gradient(["#5B7CFA", "#4A63D9", "#2947BE"])(`╔═════════════════════════════════╗
║ _  _____      _                 ║
║| |/ / __|_ __| |__ _ __ ___ _ _ ║
║| ' < (_ | '_ \\ / _\` / _/ -_) '_|║
║|_|\\_\\___| .__/_\\__,_\\__\\___|_|  ║
║         |_|                     ║
╚═════════════════════════════════╝
              v${version}`));
    // check versions (dont delete this ffs)
    try {
        const githubPackage = await fetch("https://raw.githubusercontent.com/wplacer/wplacer/refs/heads/main/package.json");
        const githubVersion = (await githubPackage.json()).version;
        const diff = diffVer(version, githubVersion);
        if (diff !== 0) console.warn(`${diff < 0 ? "⚠️ Outdated version! Please update using \"git pull\"." : "🤖 Unreleased."}\n  GitHub: ${githubVersion}\n  Local: ${version} (${diff})`);
    } catch {
        console.warn("⚠️ Could not check for updates.");
    };

    migrateOldTemplatesIfNeeded();

    // normalize template entries so memory always has {width,height,data,shareCode}
    const ensureTemplateData = (te) => {
        if (te?.data && Array.isArray(te.data)) {
            const w = Number(te.width) >>> 0,
                h = Number(te.height) >>> 0;
            if (!w || !h) throw new Error('invalid template dimensions');
            const data = ensureXMajor(te.data, w, h);
            sanitizePalette2D(data);
            return {
                width: w,
                height: h,
                data,
                shareCode: te.shareCode ?? shareCodeFromTemplate({ width: w, height: h, data }),
            };
        };
        if (te?.shareCode) {
            const dec = templateFromShareCode(te.shareCode);
            return { width: dec.width, height: dec.height, data: dec.data, shareCode: te.shareCode };
        };
        throw new Error('template missing data/shareCode');
    };

    const loadedTemplates = loadJSON(TEMPLATES_PATH);
    templates = {};

    for (const id in loadedTemplates) {
        try {
            const t = loadedTemplates[id];
            const templateData = ensureTemplateData(t.template);
            if (t.userIds.every((uid) => users[uid])) {
                templates[id] = new TemplateManager({
                    templateId: id,
                    name: t.name,
                    templateData,
                    coords: t.coords,
                    canBuyCharges: t.canBuyCharges,
                    canBuyMaxCharges: t.canBuyMaxCharges,
                    antiGriefMode: t.antiGriefMode,
                    eraseMode: t.eraseMode,
                    outlineMode: t.outlineMode,
                    skipPaintedPixels: t.skipPaintedPixels,
                    enableAutostart: t.enableAutostart,
                    userIds: t.userIds,
                });
                if (t.enableAutostart) autostartedTemplates.push(id);
            } else console.warn(`⚠️ Template "${t.name}" not loaded because assigned user(s) are missing.`);
        } catch (e) {
            console.error(`⚠️ Skipping template ${id}: ${e.message}`);
        };
    };

    //Load color ordering on startup
    colorOrdering = loadColorOrdering();

    loadProxies();
    console.log(`✅ Loaded ${Object.keys(templates).length} templates, ${Object.keys(users).length} users, ${loadedProxies.length} proxies.`);

    const probe = Array.from(new Set([APP_PRIMARY_PORT, ...APP_FALLBACK_PORTS]));
    function tryListen(idx = 0) {
        if (idx >= probe.length) {
            console.error('❌ No available port found.');
            process.exit(1);
        }
        const port = probe[idx];
        const server = app.listen(port, APP_HOST);
            // --- Attach WebSocket server for logs ---
            if (!wsLogServer) {
                wsLogServer = new WebSocketServer({ server, path: '/ws-logs' });

                wsLogServer.on('connection', (ws, req) => {
                    // URL: ws://host/ws-logs?type=logs|errors
                    const url = new URL(req.url, `http://${req.headers.host}`);
                    const type = url.searchParams.get('type') === 'errors' ? 'errors' : 'logs';
                    wsClients[type].add(ws);
                    // Send initial log history (last 200 lines)
                    try {
                        const file = path.join(DATA_DIR, type + '.log');
                        const data = readFileSync(file, 'utf8');
                        const lines = data.split(/\r?\n/).filter(Boolean);
                        ws.send(JSON.stringify({ initial: lines.slice(-200) }));
                    } catch {}
                    ws.on('close', () => wsClients[type].delete(ws));
                });

                // Watch logs.log and errors.log for changes
                const logFiles = [
                    { file: LOGS_FILE, type: 'logs' },
                    { file: ERRORS_FILE, type: 'errors' }
                ];
                for (const { file, type } of logFiles) {
                    let lastSize = 0;
                    try { lastSize = statSync(file).size; } catch {}
                    watch(file, { persistent: false }, (event) => {
                        if (event === 'change') {
                            try {
                                const stats = statSync(file);
                                // Handle truncation/rotation
                                if (stats.size < lastSize) lastSize = 0;
                                if (stats.size > lastSize) {
                                    const start = lastSize;
                                    const endSize = stats.size;
                                    const stream = createReadStream(file, { start });
                                    let buffer = '';
                                    stream.on('data', (chunk) => { buffer += chunk.toString(); });
                                    stream.on('end', () => {
                                        buffer.split(/\r?\n/).filter(Boolean).forEach((line) => broadcastLog(type, line));
                                        lastSize = endSize;
                                    });
                                    stream.on('error', (err) => {
                                        console.warn('[logs] tail error:', err?.message || err);
                                    });
                                }
                            } catch {}
                        }
                    });
                }
            }
        server.on('listening', () => {
            const url = `http://localhost:${port}`;
            console.log(`✅ Server listening on ${url}`);
            console.log('   Open the web UI in your browser to start.');

            setInterval(runKeepAlive, currentSettings.keepAliveCooldown);
            log('SYSTEM', 'KeepAlive', `🔄 User session keep-alive started. Interval: ${duration(currentSettings.keepAliveCooldown)}.`);

            autostartedTemplates.forEach((id) => {
                const manager = templates[id];
                if (!manager) return;
                log('SYSTEM', 'wplacer', `[${manager.name}] 🚀 Autostarting template...`);
                if (manager.antiGriefMode) {
                    log('SYSTEM', 'wplacer', `[${manager.name}] 🤖 Autostart anti-grief mode enabled; starting immediately.`);
                    refreshCamoufoxFleetForActiveTemplates().catch((e) => log('SYSTEM', 'Camoufox', 'Error refreshing fleet on autostart', e));
                    manager.start().catch((e) => log(id, manager.masterName, 'Error autostarting template', e));
                } else {
                    const busy = manager.userIds.some((uid) => activeTemplateUsers.has(uid));
                    if (busy) {
                        if (!templateQueue.includes(id)) {
                            templateQueue.push(id);
                            manager.status = 'Queued';
                            log('SYSTEM', 'wplacer', `[${manager.name}] ⏳ Autostart queued; busy users: ${describeBusyUsers(manager)}.`);
                            log('SYSTEM', 'wplacer', `[Queue] Queue is now: ${templateQueue.join(', ')}`);
                        }
                    } else {
                        manager.userIds.forEach((uid) => activeTemplateUsers.add(uid));
                        log('SYSTEM', 'wplacer', `[${manager.name}] 🚀 Autostart proceeding with users: ${describeTemplateUsers(manager)}.`);
                        refreshCamoufoxFleetForActiveTemplates().catch((e) => log('SYSTEM', 'Camoufox', 'Error refreshing fleet on autostart', e));
                        manager.start().catch((e) => log(id, manager.masterName, 'Error autostarting template', e));
                    };
                };
            });
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${port} in use. Trying ${probe[idx + 1]}...`);
                tryListen(idx + 1);
            } else if (err.code === 'EACCES') {
                const nextIdx = Math.max(idx + 1, probe.indexOf(APP_FALLBACK_PORTS[0]));
                console.error(`❌ Permission denied on ${port}. Trying ${probe[nextIdx]}...`);
                tryListen(nextIdx);
            } else {
                console.error('❌ Server error:', err);
                process.exit(1);
            };
        });
    };
    tryListen(0);
})();
