// --- Constants ---
const RELOAD_FLAG = 'kglacer_reload_in_progress';
const OVERLAY_ID = 'kglacer-overlay-root';
const LAUNCHER_ID = 'kglacer-overlay-launcher';
const OVERLAY_CLOSED_FLAG = 'kglacer_overlay_closed';
const OVERLAY_HEALTHCHECK_MS = 2500;

// --- Main Logic ---
console.log('✅ kglacer: Content script loaded.');

// --- Turnstile token bridge ---
const TURNSTILE_REQUEST_TYPE = 'WPLACER_TURNSTILE_REQUEST';
const TURNSTILE_TOKEN_TYPE = 'WPLACER_TURNSTILE_TOKEN';
const PAWTECT_REQUEST_TYPE = 'WPLACER_PAWTECT_REQUEST';
const PAWTECT_TOKEN_TYPE = 'WPLACER_PAWTECT_TOKEN';

let turnstileInjected = false;
let pawtectInjected = false;
let pendingTokenDispatch = null;

const injectPageScript = (scriptFile) => {
    try {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(scriptFile);
        script.async = false;
        (document.head || document.documentElement).appendChild(script);
        script.onload = () => script.remove();
        script.onerror = () => {
            console.error(`kglacer: Failed to inject ${scriptFile}`);
            try { script.remove(); } catch {}
        };
        return true;
    } catch (error) {
        console.error(`kglacer: Could not inject ${scriptFile}:`, error);
        return false;
    }
};

const ensureTurnstileBridge = () => {
    if (turnstileInjected) return;
    turnstileInjected = injectPageScript('turnstile_inject.js');
};

const ensurePawtectBridge = () => {
    if (pawtectInjected) return;
    pawtectInjected = injectPageScript('pawtect_inject.js');
};

const randomHex = (bytes) => {
    const array = new Uint8Array(bytes);
    crypto.getRandomValues(array);
    return Array.from(array, (value) => value.toString(16).padStart(2, '0')).join('');
};

const buildPawtectPayload = (turnstileToken) => {
    const fp = randomHex(16);
    const px = Math.floor(Math.random() * 1000);
    const py = Math.floor(Math.random() * 1000);

    return {
        url: 'https://backend.wplace.live/s0/pixel/1/1',
        body: {
            colors: [0],
            coords: [px, py],
            fp,
            t: turnstileToken
        },
        fp
    };
};

const sendTokenPayload = ({ t, pawtect = null, fp = null }) => {
    chrome.runtime.sendMessage({ action: 'tokenPairReceived', t, pawtect, fp }, () => {
        if (chrome.runtime.lastError) {
            console.warn('kglacer: Failed to deliver token payload:', chrome.runtime.lastError.message);
        }
    });
};

const handleTurnstileToken = (token) => {
    if (!token || typeof token !== 'string') return;

    if (pendingTokenDispatch?.timeoutId) {
        clearTimeout(pendingTokenDispatch.timeoutId);
    }

    const payload = buildPawtectPayload(token);
    const reqId = `pawtect-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    pendingTokenDispatch = {
        reqId,
        t: token,
        fp: payload.fp,
        timeoutId: setTimeout(() => {
            if (!pendingTokenDispatch || pendingTokenDispatch.reqId !== reqId) return;
            console.warn('kglacer: Pawtect generation timed out, sending Turnstile token only.');
            sendTokenPayload({ t: token });
            pendingTokenDispatch = null;
        }, 3500)
    };

    ensurePawtectBridge();
    window.postMessage({ type: PAWTECT_REQUEST_TYPE, reqId, url: payload.url, body: payload.body }, '*');
};

window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data) return;

    if (data.type === PAWTECT_TOKEN_TYPE) {
        if (!pendingTokenDispatch || data.reqId !== pendingTokenDispatch.reqId) return;
        clearTimeout(pendingTokenDispatch.timeoutId);

        if (data.token && typeof data.token === 'string') {
            sendTokenPayload({
                t: pendingTokenDispatch.t,
                pawtect: data.token,
                fp: data.fp || pendingTokenDispatch.fp
            });
        } else {
            console.warn('kglacer: Pawtect generator did not return a token, sending Turnstile only.');
            sendTokenPayload({ t: pendingTokenDispatch.t });
        }

        pendingTokenDispatch = null;
        return;
    }

    if (data.type !== TURNSTILE_TOKEN_TYPE) return;

    if (data.token && typeof data.token === 'string') {
        handleTurnstileToken(data.token);
    } else if (data.error) {
        console.warn('kglacer: Turnstile generator returned an error:', data.error);
    }
});

ensureTurnstileBridge();
ensurePawtectBridge();

// --- Overlay UI (full-page) ---
// --- Overlay UI (full-page) ---
(() => {
    const on = (el, evt, fn, opts) => el && el.addEventListener(evt, fn, opts || false);

    const getServerConfig = () => new Promise((resolve) => {
        try {
            chrome.storage.local.get(['kglacerHost', 'wplacerHost', 'kglacerPort', 'wplacerPort'], (result) => {
                resolve({
                    host: result?.kglacerHost || result?.wplacerHost || 'localhost',
                    port: result?.kglacerPort || result?.wplacerPort || 80
                });
            });
        } catch {
            resolve({ host: 'localhost', port: 80 });
        }
    });

    const getOverlayUrls = async () => {
        const { host, port } = await getServerConfig();
        const normalizedHost = host === '127.0.0.1' ? 'localhost' : host;
        const candidateHosts = Array.from(new Set([
            normalizedHost,
            'localhost',
            '127.0.0.1'
        ]));
        const candidatePorts = Array.from(new Set([
            Number(port) || 80,
            80,
            3000,
            8080,
            5000
        ]));

        const urls = [];
        for (const candidate of candidateHosts) {
            for (const candidatePort of candidatePorts) {
                urls.push(`http://${candidate}:${candidatePort}`);
            }
        }
        return urls;
    };

    const findReachableOverlayUrl = async () => {
        const candidates = await getOverlayUrls();

        for (const base of candidates) {
            try {
                const response = await fetch(`${base}/token-needed`, {
                    method: 'GET',
                    cache: 'no-store'
                });
                if (response.ok) return base;
            } catch {}
        }

        return candidates[0] || 'http://localhost:80';
    };

    // Move checkOverlayEnabled to the top level of the closure
    const checkOverlayEnabled = async () => {
        try {
            return new Promise((resolve) => {
                chrome.storage.local.get(['enableOverlay'], (result) => {
                    // Default to false so overlay does not open full-screen by default
                    const enabled = result.enableOverlay !== undefined ? result.enableOverlay : false;
                    console.log('kglacer: Overlay enabled from extension settings:', enabled);
                    resolve(enabled);
                });
            });
        } catch (e) {
            console.log('kglacer: Could not check overlay settings, defaulting to disabled', e);
            return false; // Default to disabled if there's an error
        }
    };

    const createLauncher = () => {
        if (document.getElementById(LAUNCHER_ID)) return;
        const btn = document.createElement('button');
        btn.id = LAUNCHER_ID;
        btn.textContent = 'Open kglacer';
        btn.style.cssText = [
            'position:fixed',
            'bottom: 20px',
            'left: 80px',
            'z-index:2147483646',
            'padding:10px 16px',
            'border-radius:10px',
            'border:none',
            'background:linear-gradient(135deg, #ff7a1a, #ff5f1a)',
            'color:#fff',
            'font:600 14px/1 "Segoe UI",sans-serif',
            'box-shadow:0 6px 18px rgba(255, 122, 26, 0.4)',
            'cursor:pointer',
            'transition:all 0.3s ease',
            'outline:none'
        ].join(';');
        
        on(btn, 'mouseover', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 8px 20px rgba(255, 122, 26, 0.5)';
        });
        
        on(btn, 'mouseout', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 6px 18px rgba(255, 122, 26, 0.4)';
        });
        btn.title = 'Open kglacer overlay (Ctrl+Shift+W)';
        on(btn, 'click', () => {
            checkOverlayEnabled().then(enabled => {
                if (enabled) {
                    sessionStorage.removeItem(OVERLAY_CLOSED_FLAG);
                    ensureOverlay(true);
                } else {
                    console.log('kglacer: Overlay is disabled in settings, not showing');
                }
            });
        });
        document.body.appendChild(btn);
    };

    const removeLauncher = () => {
        const el = document.getElementById(LAUNCHER_ID);
        if (el) try { el.remove(); } catch {}
    };

    const showOverlay = () => {
        const root = document.getElementById(OVERLAY_ID);
        if (root) root.style.display = 'block';
        removeLauncher();
    };

    const hideOverlay = () => {
        const root = document.getElementById(OVERLAY_ID);
        if (root) root.style.display = 'none';
        createLauncher();
    };

    const removeOverlay = () => {
        const root = document.getElementById(OVERLAY_ID);
        if (root) {
            try {
                if (typeof root.__kglacerCleanup === 'function') {
                    root.__kglacerCleanup();
                }
                root.remove();
            } catch {}
        }
        createLauncher();
    };

    const createOverlay = async () => {
        if (document.getElementById(OVERLAY_ID)) return;
        let overlayBaseUrl = await findReachableOverlayUrl();
        let overlayUrl = `${overlayBaseUrl}/`;
        let reconnectTimer = null;
        let reconnectAttempts = 0;

        const clearReconnectTimer = () => {
            if (!reconnectTimer) return;
            clearInterval(reconnectTimer);
            reconnectTimer = null;
        };

        const updateConnectionBadge = (badgeEl, message, isOnline) => {
            if (!badgeEl) return;
            badgeEl.textContent = message;
            badgeEl.style.background = isOnline ? 'rgba(46,204,113,.25)' : 'rgba(255,95,95,.22)';
            badgeEl.style.borderColor = isOnline ? 'rgba(46,204,113,.55)' : 'rgba(255,95,95,.45)';
            badgeEl.style.color = isOnline ? '#beffd6' : '#ffd3d3';
        };

        const overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:50000',
            'background:#0b0b0f',
            'display:block',
            'box-shadow:0 0 20px rgba(0,0,0,0.5)',
            'transition:all 0.3s ease'
        ].join(';');

        const bar = document.createElement('div');
        bar.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'right:0',
            'height:40px',
            'display:flex',
            'align-items:center',
            'justify-content:space-between',
            'padding:0 15px',
            'background:linear-gradient(to right, #1a1a2e, #16213e)',
            'color:#fff',
            'font:600 14px/1 "Segoe UI",sans-serif',
            'border-bottom:1px solid rgba(255,255,255,0.15)',
            'box-shadow:0 2px 5px rgba(0,0,0,0.2)'
        ].join(';');
        const title = document.createElement('div');
        title.textContent = 'kglacer overlay';
        const statusBadge = document.createElement('div');
        statusBadge.style.cssText = [
            'margin-left:12px',
            'padding:4px 8px',
            'border-radius:999px',
            'font:500 12px/1 "Segoe UI",sans-serif',
            'border:1px solid rgba(255,255,255,.2)',
            'white-space:nowrap'
        ].join(';');
        updateConnectionBadge(statusBadge, 'Connecting...', false);

        const titleWrap = document.createElement('div');
        titleWrap.style.cssText = 'display:flex;align-items:center;';
        titleWrap.appendChild(title);
        titleWrap.appendChild(statusBadge);

        const controls = document.createElement('div');

        const btnStyle = [
            'margin-left:10px',
            'padding:6px 12px',
            'border-radius:6px',
            'border:1px solid rgba(255,255,255,0.3)',
            'background:rgba(255,255,255,0.1)',
            'color:#fff',
            'cursor:pointer',
            'font-weight:500',
            'transition:all 0.2s ease',
            'outline:none'
        ].join(';');
        
        const btnHoverStyle = [
            'background:rgba(255,255,255,0.2)',
            'border-color:rgba(255,255,255,0.4)'
        ].join(';');

        const minimizeBtn = document.createElement('button');
        minimizeBtn.textContent = 'Minimize';
        minimizeBtn.style.cssText = btnStyle;
        on(minimizeBtn, 'click', () => hideOverlay());
        on(minimizeBtn, 'mouseover', () => minimizeBtn.style.cssText = btnStyle + ';' + btnHoverStyle);
        on(minimizeBtn, 'mouseout', () => minimizeBtn.style.cssText = btnStyle);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = btnStyle;
        on(closeBtn, 'click', () => {
            sessionStorage.setItem(OVERLAY_CLOSED_FLAG, '1');
            removeOverlay();
        });
        on(closeBtn, 'mouseover', () => closeBtn.style.cssText = btnStyle + ';' + btnHoverStyle);
        on(closeBtn, 'mouseout', () => closeBtn.style.cssText = btnStyle);

        controls.appendChild(minimizeBtn);
        controls.appendChild(closeBtn);
        bar.appendChild(titleWrap);
        bar.appendChild(controls);

        const iframe = document.createElement('iframe');
        iframe.src = overlayUrl;
        iframe.style.cssText = [
            'position:absolute',
            'top:40px',
            'left:0',
            'right:0',
            'bottom:0',
            'width:100%',
            'height:calc(100% - 40px)',
            'border:0',
            'background:#0b0b0f'
        ].join(';');

        const fallback = document.createElement('div');
        fallback.style.cssText = [
            'position:absolute',
            'top:40px',
            'left:0',
            'right:0',
            'bottom:0',
            'display:none',
            'align-items:center',
            'justify-content:center',
            'color:#fff',
            'font:500 13px/1.4 "Segoe UI",sans-serif',
            'padding:20px',
            'text-align:center'
        ].join(';');
        fallback.innerHTML = `
            <div>
                <div style="opacity:.9;margin-bottom:10px;">Local UI is not reachable yet. If your instance started after opening this tab, it will reconnect automatically.</div>
                <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                    <button id="kglacer-retry-overlay" style="padding:8px 12px;border:1px solid rgba(255,255,255,.3);border-radius:8px;background:rgba(255,255,255,.1);color:#fff;cursor:pointer;">Retry now</button>
                    <a href="${overlayUrl}" target="_blank" rel="noopener noreferrer" style="padding:8px 12px;border:1px solid rgba(255,154,77,.6);border-radius:8px;color:#ffb073;text-decoration:none;">Open kglacer in a new tab</a>
                </div>
            </div>
        `;

        const retryIframeLoad = () => {
            reconnectAttempts += 1;
            updateConnectionBadge(statusBadge, `Reconnecting… (${reconnectAttempts})`, false);
            iframe.src = `${overlayUrl}?_kglacer=${Date.now()}`;
        };

        const startReconnectLoop = () => {
            if (reconnectTimer) return;
            reconnectTimer = setInterval(retryIframeLoad, OVERLAY_HEALTHCHECK_MS);
        };

        const handleIframeUnavailable = async () => {
            overlayBaseUrl = await findReachableOverlayUrl();
            overlayUrl = `${overlayBaseUrl}/`;
            fallback.style.display = 'flex';
            updateConnectionBadge(statusBadge, 'Offline', false);
            startReconnectLoop();
        };

        on(iframe, 'error', handleIframeUnavailable);
        on(iframe, 'load', () => {
            reconnectAttempts = 0;
            clearReconnectTimer();
            updateConnectionBadge(statusBadge, 'Connected', true);
            fallback.style.display = 'none';
        });

        const retryBtn = fallback.querySelector('#kglacer-retry-overlay');
        on(retryBtn, 'click', retryIframeLoad);

        // Ensure overlay recovers when local instance starts after extension/page was already open.
        startReconnectLoop();

        overlay.__kglacerCleanup = () => {
            clearReconnectTimer();
        };

        overlay.appendChild(bar);
        overlay.appendChild(iframe);
        overlay.appendChild(fallback);
        document.documentElement.appendChild(overlay);
    };

    const ensureOverlay = async (forceShow) => {
        // Only on wplace.live pages
        if (!location.hostname.endsWith('wplace.live')) return;
        
        // Check if overlay is enabled in extension settings first
        const enabled = await checkOverlayEnabled();
        
        if (!enabled) {
            console.log('kglacer: Overlay is disabled in settings, destroying overlay if it exists');
            // If overlay exists and setting is disabled, destroy it completely
            const existingOverlay = document.getElementById(OVERLAY_ID);
            if (existingOverlay) {
                try {
                    if (typeof existingOverlay.__kglacerCleanup === 'function') {
                        existingOverlay.__kglacerCleanup();
                    }
                    existingOverlay.remove();
                } catch {}
                console.log('kglacer: Existing overlay destroyed due to disabled setting');
            }
            return;
        }
        
        // If user closed this session and not forcing, show launcher
        if (!forceShow && sessionStorage.getItem(OVERLAY_CLOSED_FLAG) === '1') {
            createLauncher();
            return;
        }
        
        // Avoid opening the full-screen overlay automatically.
        if (!forceShow) {
            createLauncher();
            return;
        }

        // Create and show overlay only on explicit user action.
        await createOverlay();
        showOverlay();
    };

    // Keep launcher available on page load (no auto-open full-screen overlay).
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ensureOverlay(false);
        });
    } else {
        ensureOverlay(false);
    }

    // Keyboard toggle Ctrl+Shift+W
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'W' || e.key === 'w')) {
            const root = document.getElementById(OVERLAY_ID);
            if (root && root.style.display !== 'none') {
                hideOverlay();
            } else {
                checkOverlayEnabled().then(enabled => {
                    if (enabled) {
                        ensureOverlay(true);
                    } else {
                        console.log('kglacer: Overlay is disabled in settings, not showing');
                        createLauncher();
                    }
                });
            }
        }
    }, true);
})()

// Handle reload commands from the background worker.
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'reloadForToken') {
        console.log('kglacer: Received reload command from background script. Reloading now...');
        sessionStorage.setItem(RELOAD_FLAG, 'true');
        location.reload();
        return;
    }

    if (request.action === 'generateTurnstileToken') {
        ensureTurnstileBridge();
        window.postMessage({ type: TURNSTILE_REQUEST_TYPE }, '*');
    }
});

// Check if this load was triggered by our extension
if (sessionStorage.getItem(RELOAD_FLAG)) {
    sessionStorage.removeItem(RELOAD_FLAG);
    console.log('kglacer: Page reloaded from extension command.');
}
