document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('status');
    const statusDot = document.getElementById('statusDot');
    const portInput = document.getElementById('port');
    const saveBtn = document.getElementById('saveSettingsBtn');
    const sendCookieBtn = document.getElementById('sendCookieBtn');
    const clearPawtectBtn = document.getElementById('clearPawtectBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const toggleOverlayBtn = document.getElementById('toggleOverlayBtn');
    const toggleOverlayText = document.getElementById('toggleOverlayText');
    const autoReloadCheckbox = document.getElementById('autoReload');
    const autoClearCheckbox = document.getElementById('autoClear');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const languageSelect = document.getElementById('languageSelect');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    const I18N = {
        en: {
            tabActions: 'Actions',
            tabSettings: 'Settings',
            btnAddUser: 'Add/Update User',
            btnClearPaintCache: 'Clear Paint Cache',
            btnQuickLogout: 'Quick Logout',
            btnSave: 'Save',
            labelLanguage: 'Language',
            labelServerPort: 'Server Port',
            labelAutoReload: 'Auto Reload',
            descAutoReload: 'Automatically reload when the server requests action.',
            labelAutoClear: 'Auto Clear Cache',
            descAutoClear: 'Clear local paint cache if the server waits too long.',
            overlayEnable: 'Enable Overlay',
            overlayDisable: 'Disable Overlay',
            statusReady: 'Ready. KGlacer is synced with your local server.',
            statusWaiting: 'Waiting for server signal ({seconds}s)...',
            statusOverlayReloading: 'Overlay {state}. Reloading page...',
            statusSaving: 'Settings saved. Server on port {port}.',
            statusInvalidPort: 'Error: Invalid port number.',
            statusSendingCookie: 'Sending cookie to server...',
            statusUserSuccess: 'Success! User: {name}.',
            statusLoggingOut: 'Logging out...',
            statusLogoutSuccess: 'Logout successful. Site data cleared.',
            statusClearingPaintCache: 'Clearing paint cache...',
            statusPaintCacheSuccess: 'Paint cache cleared successfully.',
        },
        es: {
            tabActions: 'Acciones',
            tabSettings: 'Ajustes',
            btnAddUser: 'Agregar/Actualizar Usuario',
            btnClearPaintCache: 'Limpiar Caché de Pintado',
            btnQuickLogout: 'Cierre Rápido',
            btnSave: 'Guardar',
            labelLanguage: 'Idioma',
            labelServerPort: 'Puerto del Servidor',
            labelAutoReload: 'Recarga Automática',
            descAutoReload: 'Recarga automáticamente cuando el servidor lo solicita.',
            labelAutoClear: 'Limpiar Caché Automáticamente',
            descAutoClear: 'Limpia la caché local de pintado si el servidor espera demasiado.',
            overlayEnable: 'Activar Overlay',
            overlayDisable: 'Desactivar Overlay',
            statusReady: 'Listo. KGlacer está sincronizado con tu servidor local.',
            statusWaiting: 'Esperando señal del servidor ({seconds}s)...',
            statusOverlayReloading: 'Overlay {state}. Recargando página...',
            statusSaving: 'Ajustes guardados. Servidor en puerto {port}.',
            statusInvalidPort: 'Error: Puerto inválido.',
            statusSendingCookie: 'Enviando cookie al servidor...',
            statusUserSuccess: '¡Éxito! Usuario: {name}.',
            statusLoggingOut: 'Cerrando sesión...',
            statusLogoutSuccess: 'Cierre de sesión exitoso. Datos del sitio limpiados.',
            statusClearingPaintCache: 'Limpiando caché de pintado...',
            statusPaintCacheSuccess: 'Caché de pintado limpiada correctamente.',
        },
    };

    let initialPort = 80;
    let tokenWaitingStatus = false;
    let currentLanguage = 'en';

    const getPreferredTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
        return 'dark';
    };

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = themeToggleBtn?.querySelector('i');
        if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    };

    const t = (key, vars = {}) => {
        const dict = I18N[currentLanguage] || I18N.en;
        const text = dict[key] || I18N.en[key] || key;
        return text.replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? ''));
    };

    const applyTranslations = () => {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = t(key);
        });

        themeToggleBtn?.setAttribute('aria-label', currentLanguage === 'es' ? 'Cambiar tema' : 'Toggle theme');
        if (!tokenWaitingStatus) statusEl.textContent = t('statusReady');

        chrome.storage.local.get(['enableOverlay'], (result) => {
            const enabled = result.enableOverlay !== undefined ? result.enableOverlay : false;
            updateToggleOverlayButton(enabled);
        });
    };

    const setLanguage = (lang) => {
        currentLanguage = lang === 'es' ? 'es' : 'en';
        if (languageSelect) languageSelect.value = currentLanguage;
        applyTranslations();
    };

    const updateToggleOverlayButton = (isEnabled) => {
        toggleOverlayText.textContent = isEnabled ? t('overlayDisable') : t('overlayEnable');
        toggleOverlayBtn.querySelector('i').className = isEnabled ? 'fas fa-toggle-on' : 'fas fa-toggle-off';
    };

    chrome.storage.local.get([
        'kglacerPort',
        'wplacerPort',
        'autoReload',
        'autoClear',
        'enableOverlay',
        'popupTheme',
        'popupLanguage',
    ], (result) => {
        initialPort = result.kglacerPort || result.wplacerPort || 80;
        portInput.value = initialPort;

        autoReloadCheckbox.checked = result.autoReload !== undefined ? result.autoReload : true;
        autoClearCheckbox.checked = result.autoClear !== undefined ? result.autoClear : true;

        applyTheme(result.popupTheme || getPreferredTheme());
        setLanguage(result.popupLanguage || 'en');

        const enableOverlay = result.enableOverlay !== undefined ? result.enableOverlay : false;
        updateToggleOverlayButton(enableOverlay);
    });

    themeToggleBtn?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        chrome.storage.local.set({ popupTheme: nextTheme });
    });

    languageSelect?.addEventListener('change', () => {
        setLanguage(languageSelect.value);
        chrome.storage.local.set({ popupLanguage: currentLanguage });
    });

    toggleOverlayBtn.addEventListener('click', () => {
        chrome.storage.local.get(['enableOverlay'], (result) => {
            const currentSetting = result.enableOverlay !== undefined ? result.enableOverlay : false;
            const newSetting = !currentSetting;

            chrome.storage.local.set({ enableOverlay: newSetting }, () => {
                updateToggleOverlayButton(newSetting);

                const state = newSetting
                    ? (currentLanguage === 'es' ? 'activado' : 'enabled')
                    : (currentLanguage === 'es' ? 'desactivado' : 'disabled');

                statusEl.textContent = t('statusOverlayReloading', { state });
                statusEl.classList.add('success');

                chrome.tabs.query({ active: true, currentWindow: true }, (tabList) => {
                    if (tabList[0]) chrome.tabs.reload(tabList[0].id);
                });

                setTimeout(() => statusEl.classList.remove('success'), 2000);
            });
        });
    });

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((tEl) => tEl.classList.remove('active'));
            tabContents.forEach((c) => c.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    const checkTokenStatus = () => {
        chrome.runtime.sendMessage({ action: 'getTokenStatus' }, (response) => {
            if (chrome.runtime.lastError) return;

            if (response && response.waiting) {
                statusDot.classList.remove('active');
                statusDot.classList.add('waiting');
                tokenWaitingStatus = true;
                statusEl.textContent = t('statusWaiting', { seconds: response.waitTime });
            } else {
                statusDot.classList.remove('waiting');
                statusDot.classList.add('active');
                tokenWaitingStatus = false;
                statusEl.textContent = t('statusReady');
            }
        });
    };

    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'tokenStatusChanged') {
            if (message.waiting) {
                statusDot.classList.remove('active');
                statusDot.classList.add('waiting');
                tokenWaitingStatus = true;
                statusEl.textContent = t('statusWaiting', { seconds: message.waitTime });
            } else {
                statusDot.classList.remove('waiting');
                statusDot.classList.add('active');
                tokenWaitingStatus = false;
                statusEl.textContent = t('statusReady');
            }
        } else if (message.action === 'statusUpdate') {
            statusEl.textContent = message.status;
            if (message.status.includes('successfully') || message.status.includes('reloaded')) {
                statusEl.classList.add('success');
                setTimeout(() => statusEl.classList.remove('success'), 2000);
            }
        }
    });

    checkTokenStatus();
    setInterval(checkTokenStatus, 2000);

    const setButtonLoading = (button, isLoading) => {
        button.classList.toggle('loading', isLoading);
    };

    saveBtn.addEventListener('click', () => {
        const port = parseInt(portInput.value, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
            statusEl.textContent = t('statusInvalidPort');
            return;
        }

        setButtonLoading(saveBtn, true);

        chrome.storage.local.set({
            kglacerPort: port,
            wplacerPort: port,
            autoReload: autoReloadCheckbox.checked,
            autoClear: autoClearCheckbox.checked,
            popupLanguage: currentLanguage,
        }, () => {
            setButtonLoading(saveBtn, false);
            statusEl.textContent = t('statusSaving', { port });

            saveBtn.style.backgroundColor = 'var(--success-color)';
            setTimeout(() => {
                saveBtn.style.backgroundColor = '';
            }, 1000);

            chrome.runtime.sendMessage({ action: 'settingsUpdated', portChanged: port !== initialPort });
            initialPort = port;
        });
    });

    autoReloadCheckbox.addEventListener('change', () => {
        chrome.storage.local.set({ autoReload: autoReloadCheckbox.checked });
    });

    autoClearCheckbox.addEventListener('change', () => {
        chrome.storage.local.set({ autoClear: autoClearCheckbox.checked });
    });

    sendCookieBtn.addEventListener('click', () => {
        statusEl.textContent = t('statusSendingCookie');
        setButtonLoading(sendCookieBtn, true);

        chrome.runtime.sendMessage({ action: 'sendCookie' }, (response) => {
            setButtonLoading(sendCookieBtn, false);
            if (chrome.runtime.lastError) {
                statusEl.textContent = `Error: ${chrome.runtime.lastError.message}`;
                return;
            }

            if (response.success) {
                statusEl.textContent = t('statusUserSuccess', { name: response.name });
                sendCookieBtn.style.backgroundColor = 'var(--success-color)';
            } else {
                statusEl.textContent = `Error: ${response.error}`;
                sendCookieBtn.style.backgroundColor = 'var(--error-color)';
            }

            setTimeout(() => {
                sendCookieBtn.style.backgroundColor = '';
            }, 1000);
        });
    });

    logoutBtn.addEventListener('click', () => {
        statusEl.textContent = t('statusLoggingOut');
        setButtonLoading(logoutBtn, true);

        chrome.runtime.sendMessage({ action: 'quickLogout' }, (response) => {
            setButtonLoading(logoutBtn, false);
            if (chrome.runtime.lastError) {
                statusEl.textContent = `Error: ${chrome.runtime.lastError.message}`;
                return;
            }

            if (response.success) {
                statusEl.textContent = t('statusLogoutSuccess');
                logoutBtn.style.backgroundColor = 'var(--success-color)';
                setTimeout(() => {
                    logoutBtn.style.backgroundColor = '';
                }, 1000);
            } else {
                statusEl.textContent = `Error: ${response.error}`;
            }
        });
    });

    clearPawtectBtn.addEventListener('click', () => {
        statusEl.textContent = t('statusClearingPaintCache');
        setButtonLoading(clearPawtectBtn, true);

        chrome.runtime.sendMessage({ action: 'clearPawtectCache' }, (response) => {
            setButtonLoading(clearPawtectBtn, false);
            if (chrome.runtime.lastError) {
                statusEl.textContent = `Error: ${chrome.runtime.lastError.message}`;
                return;
            }

            if (response.success) {
                statusEl.textContent = t('statusPaintCacheSuccess');
                clearPawtectBtn.style.backgroundColor = 'var(--success-color)';
                setTimeout(() => {
                    clearPawtectBtn.style.backgroundColor = '';
                }, 1000);
            } else {
                statusEl.textContent = `Error: ${response.error}`;
            }
        });
    });
});
