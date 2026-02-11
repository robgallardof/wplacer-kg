// --- Constants ---
const TOKEN_WAIT_THRESHOLD_MS = 30000; // 30 seconds threshold for token waiting
const POLL_ALARM_NAME = 'wplacer-poll';
const COOKIE_ALARM_NAME = 'wplacer-cookie';
const POLL_INTERVAL_MS = 30000; // 30 seconds for more responsive polling

// --- State Variables ---
let tokenWaitStartTime = null;
let autoReloadEnabled = true;
let autoClearEnabled = true;
let isReloading = false; // Prevent multiple simultaneous reloads

// --- Core Functions ---
const getSettings = async () => {
    const result = await chrome.storage.local.get(['kglacerPort', 'wplacerPort', 'autoReload', 'autoClear']);
    // Update global settings
    autoReloadEnabled = result.autoReload !== undefined ? result.autoReload : true;
    autoClearEnabled = result.autoClear !== undefined ? result.autoClear : true;
    
    console.log("kglacer: Settings loaded - Auto-reload:", autoReloadEnabled, "Auto-clear:", autoClearEnabled);
    
    return {
        port: result.kglacerPort || result.wplacerPort || 80,
        host: result.wplacerHost || 'localhost',
        autoReload: autoReloadEnabled,
        autoClear: autoClearEnabled
    };
};

const getServerUrls = async (path = '') => {
    const { host, port } = await getSettings();
    const normalizedHost = host === '127.0.0.1' ? 'localhost' : host;

    const candidateHosts = Array.from(new Set([
        normalizedHost,
        'localhost',
        '127.0.0.1'
    ]));

    return candidateHosts.map((candidate) => `http://${candidate}:${port}${path}`);
};

const fetchFromLocalServer = async (path, options = {}) => {
    const urls = await getServerUrls(path);
    let lastError = null;

    for (const url of urls) {
        try {
            const response = await fetch(url, options);
            if (response.ok || response.status < 500) {
                return response;
            }
            lastError = new Error(`Server responded with status: ${response.status} (${url})`);
        } catch (error) {
            lastError = error;
            console.warn(`kglacer: Connection failed for ${url}: ${error.message}`);
        }
    }

    throw lastError || new Error('Could not connect to local server.');
};

// --- Token Refresh Logic ---
const pollForTokenRequest = async () => {
    console.log("kglacer: Polling server for token request...");
    try {
        // Get latest settings
        const settings = await getSettings();
        
        const response = await fetchFromLocalServer("/token-needed", {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            console.warn(`kglacer: Server poll failed with status: ${response.status}`);
            return;
        }
        
        const data = await response.json();
        console.log("kglacer: Server response:", data);
        
        if (data.needed) {
            console.log("kglacer: Server requires a token.");
            
            // Start tracking token wait time if not already tracking
            if (!tokenWaitStartTime) {
                tokenWaitStartTime = Date.now();
                console.log("kglacer: Started tracking token wait time.");
                
                // Notify popup about token waiting status
                chrome.runtime.sendMessage({
                    action: "tokenStatusChanged",
                    waiting: true,
                    waitTime: 0
                }).catch(() => {});
                
                // Immediately initiate reload if auto-reload is enabled
                if (settings.autoReload && !isReloading) {
                    console.log("kglacer: Token requested by server. Auto-reload enabled. Initiating immediate reload.");
                    await initiateReload();
                }
            } else {
                // Check if we've been waiting too long for a token
                const waitTime = Date.now() - tokenWaitStartTime;
                const waitTimeSeconds = Math.floor(waitTime / 1000);
                
                console.log(`kglacer: Token still needed. Wait time: ${waitTimeSeconds}s`);
                
                // Update popup with current wait time
                chrome.runtime.sendMessage({
                    action: "tokenStatusChanged",
                    waiting: true,
                    waitTime: waitTimeSeconds
                }).catch(() => {});
                
                // Clear cache if we've been waiting too long and auto-clear is enabled
                if (waitTime > TOKEN_WAIT_THRESHOLD_MS && settings.autoClear) {
                    console.log(`kglacer: Token wait time exceeded threshold (${waitTime}ms). Clearing pawtect cache.`);
                    await clearPawtectCache();
                    tokenWaitStartTime = Date.now(); // Reset the timer
                }
                
                // Don't reload again immediately if we just reloaded
                // Instead, wait for the next polling cycle
            }
        } else {
            // Reset token wait timer if no token is needed
            if (tokenWaitStartTime) {
                console.log("kglacer: Token no longer needed. Resetting wait timer.");
                tokenWaitStartTime = null;
                isReloading = false; // Reset reload flag
                
                // Notify popup that token is no longer needed
                chrome.runtime.sendMessage({
                    action: "tokenStatusChanged",
                    waiting: false
                }).catch(() => {});
            }
        }
    } catch (error) {
        console.error("kglacer: Could not connect to the server to poll for tokens.", error.message);
    }
};

const initiateReload = async () => {
    if (isReloading) {
        console.log("kglacer: Reload already in progress, skipping.");
        return;
    }
    
    isReloading = true;
    
    try {
        // First notify the popup that we're reloading
        chrome.runtime.sendMessage({ 
            action: "statusUpdate", 
            status: "Reloading page..."
        }).catch(() => {});
        
        const tabs = await chrome.tabs.query({ url: "https://wplace.live/*" });
        if (tabs.length === 0) {
            console.warn("kglacer: Token requested, but no wplace.live tabs are open.");
            chrome.runtime.sendMessage({ 
                action: "statusUpdate", 
                status: "No wplace.live tabs found to reload."
            }).catch(() => {});
            return;
        }
        
        const targetTab = tabs.find(t => t.active) || tabs[0];
        console.log(`kglacer: Attempting to reload tab #${targetTab.id}`);
        
        try {
            // Try to send message to content script first
            await chrome.tabs.sendMessage(targetTab.id, { action: "reloadForToken" });
            console.log("kglacer: Reload message sent to content script successfully.");
        } catch (error) {
            // Content script not loaded, use direct reload
            console.log("kglacer: Content script not available, using direct reload.");
            await chrome.tabs.reload(targetTab.id);
        }
        
        // Notify popup that reload is complete
        setTimeout(() => {
            chrome.runtime.sendMessage({ 
                action: "statusUpdate", 
                status: "Page reloaded successfully."
            }).catch(() => {});
            isReloading = false; // Reset reload flag after delay
        }, 3000); // Give more time for page to reload
        
    } catch (error) {
        console.error("kglacer: Error during reload:", error);
        chrome.runtime.sendMessage({ 
            action: "statusUpdate", 
            status: "Reload failed: " + error.message
        }).catch(() => {});
        isReloading = false;
    }
};

// --- Improved Polling with setInterval instead of alarms ---
let pollInterval = null;

const startPolling = () => {
    // Clear any existing interval
    if (pollInterval) {
        clearInterval(pollInterval);
    }
    
    // Start immediate poll
    pollForTokenRequest();
    
    // Set up regular polling
    pollInterval = setInterval(() => {
        pollForTokenRequest();
    }, POLL_INTERVAL_MS);
    
    console.log(`kglacer: Started polling every ${POLL_INTERVAL_MS}ms`);
};

const stopPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
        console.log("kglacer: Stopped polling");
    }
};

// --- User/Cookie Management ---
const sendCookie = async (callback) => {
    const getCookie = (details) => new Promise(resolve => chrome.cookies.get(details, cookie => resolve(cookie)));

    const [jCookie, sCookie] = await Promise.all([
        getCookie({ url: "https://backend.wplace.live", name: "j" }),
        getCookie({ url: "https://backend.wplace.live", name: "s" })
    ]);

    if (!jCookie) {
        if (callback) callback({ success: false, error: "Cookie 'j' not found. Are you logged in?" });
        return;
    }

    const cookies = { j: jCookie.value };
    if (sCookie) cookies.s = sCookie.value;
    try {
        const response = await fetchFromLocalServer("/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cookies, expirationDate: jCookie.expirationDate })
        });
        if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
        const userInfo = await response.json();
        if (callback) callback({ success: true, name: userInfo.name });
    } catch (error) {
        if (callback) callback({ success: false, error: "Could not connect to the wplacer server." });
    }
};

const clearPawtectCache = (callback) => {
    console.log("kglacer: Clearing pawtect cache...");
    return new Promise((resolve) => {
        chrome.tabs.query({ url: "https://wplace.live/*" }, (tabs) => {
            if (tabs && tabs.length > 0) {
                let completedTabs = 0;
                tabs.forEach(tab => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        world: 'MAIN',
                        func: () => {
                            console.log("kglacer: Removing cached pawtect data from localStorage");
                            // Use consistent cache key name
                            localStorage.removeItem('wplacer_pawtect_path');
                            localStorage.removeItem('wplacerPawtectChunk')
                            window.__wplacerPawtectChunk = null;
                            return true;
                        }
                    }, (results) => {
                        const success = results && results[0] && results[0].result === true;
                        console.log(`kglacer: Cleared pawtect cache for tab ${tab.id}: ${success ? 'success' : 'failed'}`);
                        chrome.tabs.reload(tab.id);
                        completedTabs++;
                        if (completedTabs === tabs.length) {
                            if (callback) callback({ success: true });
                            resolve(true);
                        }
                    });
                });
            } else {
                console.log("kglacer: No wplace.live tabs found to clear pawtect cache");
                if (callback) callback({ success: false, error: "No wplace.live tabs open" });
                resolve(false);
            }
        });
    });
};

const quickLogout = (callback) => {
    const origin = "https://backend.wplace.live/";
    console.log(`kglacer: Clearing browsing data for ${origin}`);
    chrome.browsingData.remove({
        origins: [origin]
    }, {
        cache: true,
        cookies: true,
        fileSystems: true,
        indexedDB: true,
        localStorage: true,
        pluginData: true,
        serviceWorkers: true,
        webSQL: true
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("kglacer: Error clearing browsing data.", chrome.runtime.lastError);
            if (callback) callback({ success: false, error: "Failed to clear data." });
        } else {
            console.log("kglacer: Browsing data cleared successfully. Reloading wplace.live tabs.");
            chrome.tabs.query({ url: "https://wplace.live/*" }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    tabs.forEach(tab => chrome.tabs.reload(tab.id));
                }
            });
            if (callback) callback({ success: true });
        }
    });
};

// --- Event Listeners ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('kglacer: Received message:', request);

    if (request.action === 'getSettings') {
        getSettings().then((settings) => {
            console.log('kglacer: Current settings:', settings);
            sendResponse(settings);
        });
        return true;
    }

    if (request.action === 'sendCookie') {
        sendCookie(sendResponse);
        return true;
    }

    if (request.action === 'clearPawtectCache') {
        clearPawtectCache(sendResponse);
        return true;
    }

    if (request.action === 'getTokenStatus') {
        if (tokenWaitStartTime) {
            const waitTimeMs = Date.now() - tokenWaitStartTime;
            const waitTimeSec = Math.floor(waitTimeMs / 1000);
            sendResponse({ waiting: true, waitTime: waitTimeSec });
        } else {
            sendResponse({ waiting: false, waitTime: 0 });
        }
        return true;
    }

    if (request.action === 'settingsUpdated') {
        getSettings().then(() => {
            console.log('kglacer: Settings updated. Auto-reload:', autoReloadEnabled, 'Auto-clear:', autoClearEnabled);
            startPolling();
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === 'quickLogout') {
        quickLogout(sendResponse);
        return true;
    }

    // Cloudflare bypass/token forging logic removed intentionally.
    if (request.type === 'SEND_TOKEN' || request.action === 'tokenPairReceived' || request.action === 'injectPawtect' || request.action === 'seedPawtect' || request.action === 'computePawtectForT' || request.action === 'applyPawtect') {
        sendResponse?.({ success: false, error: 'Token bypass flow is disabled in KGlacer extension.' });
        return true;
    }

    return false;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.startsWith("https://wplace.live")) {
        console.log("kglacer: wplace.live tab loaded. Sending cookie and ensuring polling is active.");
        sendCookie(response => console.log(`kglacer: Cookie send status: ${response.success ? 'Success' : 'Failed'}`));
        
        // Ensure polling is active when wplace.live tabs are loaded
        if (!pollInterval) {
            console.log("kglacer: Starting polling because wplace.live tab loaded.");
            startPolling();
        }
    }
});

// --- Initialization ---
const initializeExtension = async () => {
    console.log("kglacer: Initializing extension...");
    
    // Load settings first
    await getSettings();
    
    // Start polling
    startPolling();
    
    // Keep alarm-based cookie refresh
    chrome.alarms.clearAll();
    chrome.alarms.create(COOKIE_ALARM_NAME, {
        periodInMinutes: 20
    });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === COOKIE_ALARM_NAME) {
            console.log("kglacer: Periodic cookie refresh triggered.");
            sendCookie(response => console.log(`kglacer: Periodic cookie refresh: ${response.success ? 'Success' : 'Failed'}`));
        }
    });
    
    console.log("kglacer: Extension initialized.");
};

chrome.runtime.onStartup.addListener(() => {
    console.log("kglacer: Browser startup.");
    initializeExtension();
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("kglacer: Extension installed/updated.");
    initializeExtension();
});

// Start polling immediately when script loads
initializeExtension();