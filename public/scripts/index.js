(() => {
  // src/index.ts
  var $ = (id) => document.getElementById(id);
  var main = $("main");
  var openManageUsers = $("openManageUsers");
  var openAddTemplate = $("openAddTemplate");
  var openManageTemplates = $("openManageTemplates");
  var openSettings = $("openSettings");
  var mainCamoufoxActions = $("mainCamoufoxActions");
  var userForm = $("userForm");
  var scookie = $("scookie");
  var jcookie = $("jcookie");
  var submitUser = $("submitUser");
  var batchTokensInput = $("batchTokensInput");
  var importBatchTokensBtn = $("importBatchTokensBtn");
  var deleteBannedUsersBtn = $("deleteBannedUsersBtn");
  var manageUsers = $("manageUsers");
  var manageUsersTitle = $("manageUsersTitle");
  var userList = $("userList");
  var checkUserStatus = $("checkUserStatus");
  var addTemplate = $("addTemplate");
  var convert = $("convert");
  var details = $("details");
  var size = $("size");
  var ink = $("ink");
  var templateCanvas = $("templateCanvas");
  var previewCanvas = $("previewCanvas");
  var previewCanvasButton = $("previewCanvasButton");
  var previewBorder = $("previewBorder");
  var templateForm = $("templateForm");
  var templateFormTitle = $("templateFormTitle");
  var convertInput = $("convertInput");
  var templateName = $("templateName");
  var tx = $("tx");
  var ty = $("ty");
  var px = $("px");
  var py = $("py");
  var userSelectList = $("userSelectList");
  var selectAllUsers = $("selectAllUsers");
  var canBuyMaxCharges = $("canBuyMaxCharges");
  var canBuyCharges = $("canBuyCharges");
  var antiGriefMode = $("antiGriefMode");
  var eraseMode = $("eraseMode");
  var templateOutlineMode = $("templateOutlineMode");
  var templateSkipPaintedPixels = $("templateSkipPaintedPixels");
  var enableAutostart = $("enableAutostart");
  var submitTemplate = $("submitTemplate");
  var manageTemplates = $("manageTemplates");
  var templateList = $("templateList");
  var startAll = $("startAll");
  var stopAll = $("stopAll");
  var settings = $("settings");
  var drawingDirectionSelect = $("drawingDirectionSelect");
  var drawingOrderSelect = $("drawingOrderSelect");
  var pixelSkipSelect = $("pixelSkipSelect");
  var accountCooldown = $("accountCooldown");
  var purchaseCooldown = $("purchaseCooldown");
  var maxPixelsPerTurn = $("maxPixelsPerTurn");
  var readyChargeThreshold = $("readyChargeThreshold");
  var accountCheckCooldown = $("accountCheckCooldown");
  var dropletReserve = $("dropletReserve");
  var antiGriefStandby = $("antiGriefStandby");
  var chargeThreshold = $("chargeThreshold");
  var totalCharges = $("totalCharges");
  var totalMaxCharges = $("totalMaxCharges");
  var totalDroplets = $("totalDroplets");
  var totalPPH = $("totalPPH");
  var messageBoxOverlay = $("messageBoxOverlay");
  var messageBoxTitle = $("messageBoxTitle");
  var messageBoxContent = $("messageBoxContent");
  var messageBoxConfirm = $("messageBoxConfirm");
  var messageBoxCancel = $("messageBoxCancel");
  var proxyEnabled = $("proxyEnabled");
  var proxyFormContainer = $("proxyFormContainer");
  var proxyRotationMode = $("proxyRotationMode");
  var proxyCount = $("proxyCount");
  var reloadProxiesBtn = $("reloadProxiesBtn");
  var logProxyUsage = $("logProxyUsage");
  var openWebshareModalBtn = $("openWebshareModalBtn");
  var openWebshareModalMainBtn = $("openWebshareModalMainBtn");
  var preparePythonEnvMainBtn = $("preparePythonEnvMainBtn");
  var autologinProxyStats = $("autologinProxyStats");
  var autologinProxyList = $("autologinProxyList");
  var webshareModal = $("webshareModal");
  var webshareApiKey = $("webshareApiKey");
  var webshareUsername = $("webshareUsername");
  var websharePassword = $("websharePassword");
  var saveWebshareConfigBtn = $("saveWebshareConfigBtn");
  var testWebshareBtn = $("testWebshareBtn");
  var syncWebshareProxiesBtn = $("syncWebshareProxiesBtn");
  var closeWebshareModalBtn = $("closeWebshareModalBtn");
  var webshareTestResult = $("webshareTestResult");
  var languageSelect = $("languageSelect");
  var themeToggle = $("themeToggle");
  var openLogsViewer = $("openLogsViewer");
  var logsViewer = $("logsViewer");
  var logsContainer = $("logsContainer");
  var showLogsBtn = $("showLogsBtn");
  var showErrorsBtn = $("showErrorsBtn");
  var clearLogsBtn = $("clearLogsBtn");
  var logsSearchInput = $("logsSearchInput");
  var logsExportBtn = $("logsExportBtn");
  var logsTypeFilter = $("logsTypeFilter");
  var TRANSLATIONS = {
    en: {
      appSubtitle: "Automation control panel for wplace",
      camoufoxSetupTitle: "Camoufox Setup",
      camoufoxSetupDesc: "Prepare the environment once, then sync proxies from here.",
      openManageUsers: "Manage Users",
      openAddTemplate: "Add Template",
      openManageTemplates: "Manage Templates",
      openLogsViewer: "System Logs",
      openSettings: "Settings",
      preparePythonEnvMainBtn: "Prepare Python Env",
      openWebshareModalMainBtn: "Webshare / Camoufox Setup",
      logsHeading: "Realtime System Logs",
      usersHeading: "User Management",
      templatesHeading: "Template Operations",
      settingsHeading: "General Settings",
      return: "Return",
      logsSearchPlaceholder: "Search text...",
      showLogsBtn: "Logs",
      showErrorsBtn: "Errors",
      clearLogsBtn: "Clear",
      logsExportBtn: "Export",
      logsFilterAll: "All",
      logsFilterError: "Error",
      logsFilterWarning: "Warning",
      logsFilterSuccess: "Success",
      logsFilterInfo: "Info",
      usersJwtLabel: "JWT Cookie (j)",
      usersCfLabel: "Cloudflare Cookie (_cfuvid) [optional]",
      submitUser: "Add User",
      batchImportTitle: "Batch import tokens",
      batchImportDesc: "Paste one JWT (j) token per line.",
      batchTokensPlaceholder: "token1\ntoken2\ntoken3",
      importBatchTokensBtn: "Import Batch Tokens",
      deleteBannedUsersBtn: "Delete All Banned Accounts",
      manageUsersTitle: "Existing Users",
      chargeSummaryHtml: '<b>Total Charges:</b> <span id="totalCharges">?</span>/<span id="totalMaxCharges">?</span> | <b>Total Droplets:</b> <span id="totalDroplets">?</span> | <b>PPH:</b> <span id="totalPPH">?</span>',
      checkUserStatus: "Check Account Status",
      exportJTokens: "Export J Tokens",
      importJTokens: "Import J Tokens",
      templateFormTitle: "Create Template",
      addTemplateTipHtml: '<b>Tip:</b> For best results, process your image through the <a href="https://pepoafonso.github.io/color_converter_wplace/" target="_blank" rel="noopener noreferrer">wplace color converter</a> first!',
      convert: "Convert Image",
      detailsSizeLabel: "Size:",
      detailsChargesLabel: "Charges needed:",
      previewCanvasButton: "Preview Canvas",
      previewBorderLabel: "Preview Border:",
      templateNameLabel: "Template Name",
      templateNamePlaceholder: "Insert a catchy name here",
      coordinatesLabel: "Coordinates (Ctrl-V anywhere to paste pin coordinates or a list of 4 numbers)",
      tileXPlaceholder: "Tile X",
      tileYPlaceholder: "Tile Y",
      pixelXPlaceholder: "Pixel X",
      pixelYPlaceholder: "Pixel Y",
      usersLabel: "Users",
      selectAllUsers: "Select All",
      canBuyMaxChargesLabel: "Buy Max Charge Upgrades",
      canBuyChargesLabel: "Buy Paint Charges",
      antiGriefModeLabel: "Enable Anti-Grief Mode",
      eraseModeLabel: "Paint Transparent Pixels",
      templateOutlineModeLabel: "Enable Outline Mode",
      templateSkipPaintedPixelsLabel: "Skip Others' Painted Pixels",
      enableAutostartLabel: "Enable Autostart",
      reorderColors: "Reorder Colors",
      resetOrder: "Reset to Default",
      submitTemplate: "Add Template",
      startAll: "Start All Templates",
      stopAll: "Stop All Templates",
      drawingDirectionLabel: "Drawing Direction",
      drawingDirectionWavefront: "Wavefront (New Recommended)",
      drawingDirectionNatural: "Natural (Legacy)",
      drawingDirectionDown: "Down (Top to Bottom)",
      drawingDirectionUp: "Up (Bottom to Top)",
      drawingDirectionLeft: "Left to Right",
      drawingDirectionRight: "Right to Left",
      drawingDirectionSpiralFromCenter: "Spiral From Center",
      drawingDirectionSpiralToCenter: "Spiral To Center",
      drawingDirectionRandom: "Random Pixels",
      drawingOrderLabel: "Drawing Order",
      drawingOrderLinear: "Linear",
      drawingOrderRandomColor: "Random Color",
      drawingOrderColor: "Color by Color",
      pixelSkipLabel: "Drawing Density",
      pixelSkipEvery: "1/1 (Every Pixel)",
      accountCooldownLabel: "Account Turn Cooldown (seconds)",
      purchaseCooldownLabel: "Purchase Cooldown (seconds)",
      maxPixelsPerTurnLabel: "Max Pixels Per Turn (0 = all available charges)",
      readyChargeThresholdLabel: "Start Painting When User Has At Least (charges)",
      accountCheckCooldownLabel: "Account Check Cooldown (seconds)",
      dropletReserveLabel: "Minimum Droplets Before Buying",
      antiGriefStandbyLabel: "Anti-Grief Standby Time (minutes)",
      chargeThresholdLabel: "Charge Threshold (%)",
      proxySettingsHeading: "Proxy Settings",
      proxyEnabledLabel: "Enable Rotating Proxies",
      proxyInfoHtml: 'Proxies are loaded from the <code>proxies.txt</code> file in your <code>/data</code> folder. Add one proxy per line in the format <code>protocol://user:pass@host:port</code>. You can get high quality proxies at <a href="https://dataimpulse.com/?aff=199137" target="_blank" rel="noopener noreferrer">DataImpulse</a>.',
      logProxyUsageLabel: "Log Proxy Connections",
      proxyRotationModeLabel: "Rotation Mode",
      proxyRotationSequential: "Sequential",
      proxyRotationRandom: "Random",
      reloadProxiesBtn: "Reload Proxies from File",
      openWebshareModalBtn: "Webshare / Camoufox Setup",
      webshareModalTitle: "Webshare / Camoufox Proxy Modal",
      webshareApiKeyLabel: "API Key",
      webshareApiKeyPlaceholder: "Token ...",
      webshareUsernameLabel: "Username (optional)",
      webshareUsernamePlaceholder: "Webshare username",
      websharePasswordLabel: "Password (optional)",
      websharePasswordPlaceholder: "Webshare password",
      saveWebshareConfigBtn: "Save",
      testWebshareBtn: "Test",
      syncWebshareProxiesBtn: "Sync Proxy List",
      closeWebshareModalBtn: "Close",
      messageBoxCancel: "Cancel",
      messageBoxConfirm: "OK",
      themeToggleDark: "Dark Mode",
      themeToggleLight: "Light Mode"
    },
    es: {
      appSubtitle: "Panel de automatizaci\xF3n para wplace",
      camoufoxSetupTitle: "Configuraci\xF3n de Camoufox",
      camoufoxSetupDesc: "Prepara el entorno una vez y luego sincroniza proxies desde aqu\xED.",
      openManageUsers: "Gestionar Usuarios",
      openAddTemplate: "Agregar Plantilla",
      openManageTemplates: "Gestionar Plantillas",
      openLogsViewer: "Registros del Sistema",
      openSettings: "Ajustes",
      preparePythonEnvMainBtn: "Preparar Entorno Python",
      openWebshareModalMainBtn: "Configurar Webshare / Camoufox",
      logsHeading: "Registros del Sistema en Tiempo Real",
      usersHeading: "Gesti\xF3n de Usuarios",
      templatesHeading: "Operaciones de Plantillas",
      settingsHeading: "Ajustes Generales",
      return: "Volver",
      logsSearchPlaceholder: "Buscar texto...",
      showLogsBtn: "Logs",
      showErrorsBtn: "Errores",
      clearLogsBtn: "Limpiar",
      logsExportBtn: "Exportar",
      logsFilterAll: "Todo",
      logsFilterError: "Error",
      logsFilterWarning: "Advertencia",
      logsFilterSuccess: "\xC9xito",
      logsFilterInfo: "Info",
      usersJwtLabel: "Cookie JWT (j)",
      usersCfLabel: "Cookie de Cloudflare (_cfuvid) [opcional]",
      submitUser: "Agregar Usuario",
      batchImportTitle: "Importar tokens en lote",
      batchImportDesc: "Pega un token JWT (j) por l\xEDnea.",
      batchTokensPlaceholder: "token1\ntoken2\ntoken3",
      importBatchTokensBtn: "Importar Tokens en Lote",
      deleteBannedUsersBtn: "Eliminar Todas las Cuentas Baneadas",
      manageUsersTitle: "Usuarios Existentes",
      chargeSummaryHtml: '<b>Cargas Totales:</b> <span id="totalCharges">?</span>/<span id="totalMaxCharges">?</span> | <b>Gotas Totales:</b> <span id="totalDroplets">?</span> | <b>PPH:</b> <span id="totalPPH">?</span>',
      checkUserStatus: "Revisar Estado de Cuenta",
      exportJTokens: "Exportar Tokens J",
      importJTokens: "Importar Tokens J",
      templateFormTitle: "Crear Plantilla",
      addTemplateTipHtml: '<b>Tip:</b> Para mejores resultados, procesa tu imagen con el <a href="https://pepoafonso.github.io/color_converter_wplace/" target="_blank" rel="noopener noreferrer">convertidor de colores de wplace</a> primero.',
      convert: "Convertir Imagen",
      detailsSizeLabel: "Tama\xF1o:",
      detailsChargesLabel: "Cargas necesarias:",
      previewCanvasButton: "Previsualizar Lienzo",
      previewBorderLabel: "Borde de Vista Previa:",
      templateNameLabel: "Nombre de la Plantilla",
      templateNamePlaceholder: "Ponle un nombre llamativo",
      coordinatesLabel: "Coordenadas (Ctrl-V en cualquier lugar para pegar coordenadas de pin o una lista de 4 n\xFAmeros)",
      tileXPlaceholder: "Tile X",
      tileYPlaceholder: "Tile Y",
      pixelXPlaceholder: "Pixel X",
      pixelYPlaceholder: "Pixel Y",
      usersLabel: "Usuarios",
      selectAllUsers: "Seleccionar Todo",
      canBuyMaxChargesLabel: "Comprar Mejoras de Carga M\xE1xima",
      canBuyChargesLabel: "Comprar Cargas de Pintura",
      antiGriefModeLabel: "Activar Modo Anti-Grief",
      eraseModeLabel: "Pintar P\xEDxeles Transparentes",
      templateOutlineModeLabel: "Activar Modo de Contorno",
      templateSkipPaintedPixelsLabel: "Saltar P\xEDxeles Pintados por Otros",
      enableAutostartLabel: "Activar Inicio Autom\xE1tico",
      reorderColors: "Reordenar Colores",
      resetOrder: "Restablecer por Defecto",
      submitTemplate: "Agregar Plantilla",
      startAll: "Iniciar Todas las Plantillas",
      stopAll: "Detener Todas las Plantillas",
      drawingDirectionLabel: "Direcci\xF3n de Dibujo",
      drawingDirectionWavefront: "Wavefront (Nueva Recomendada)",
      drawingDirectionNatural: "Natural (Legacy)",
      drawingDirectionDown: "Abajo (Arriba hacia Abajo)",
      drawingDirectionUp: "Arriba (Abajo hacia Arriba)",
      drawingDirectionLeft: "Izquierda a Derecha",
      drawingDirectionRight: "Derecha a Izquierda",
      drawingDirectionSpiralFromCenter: "Espiral desde el Centro",
      drawingDirectionSpiralToCenter: "Espiral hacia el Centro",
      drawingDirectionRandom: "P\xEDxeles Aleatorios",
      drawingOrderLabel: "Orden de Dibujo",
      drawingOrderLinear: "Lineal",
      drawingOrderRandomColor: "Color Aleatorio",
      drawingOrderColor: "Color por Color",
      pixelSkipLabel: "Densidad de Dibujo",
      pixelSkipEvery: "1/1 (Cada P\xEDxel)",
      accountCooldownLabel: "Cooldown de Turno de Cuenta (segundos)",
      purchaseCooldownLabel: "Cooldown de Compra (segundos)",
      maxPixelsPerTurnLabel: "M\xE1x. P\xEDxeles por Turno (0 = todas las cargas disponibles)",
      readyChargeThresholdLabel: "Iniciar Pintado Cuando el Usuario Tenga al Menos (cargas)",
      accountCheckCooldownLabel: "Cooldown de Revisi\xF3n de Cuenta (segundos)",
      dropletReserveLabel: "Gotas M\xEDnimas Antes de Comprar",
      antiGriefStandbyLabel: "Tiempo de Espera Anti-Grief (minutos)",
      chargeThresholdLabel: "Umbral de Carga (%)",
      proxySettingsHeading: "Configuraci\xF3n de Proxies",
      proxyEnabledLabel: "Activar Proxies Rotativos",
      proxyInfoHtml: 'Los proxies se cargan del archivo <code>proxies.txt</code> en tu carpeta <code>/data</code>. Agrega un proxy por l\xEDnea con el formato <code>protocol://user:pass@host:port</code>. Puedes conseguir proxies de alta calidad en <a href="https://dataimpulse.com/?aff=199137" target="_blank" rel="noopener noreferrer">DataImpulse</a>.',
      logProxyUsageLabel: "Registrar Conexiones de Proxy",
      proxyRotationModeLabel: "Modo de Rotaci\xF3n",
      proxyRotationSequential: "Secuencial",
      proxyRotationRandom: "Aleatorio",
      reloadProxiesBtn: "Recargar Proxies desde Archivo",
      openWebshareModalBtn: "Configurar Webshare / Camoufox",
      webshareModalTitle: "Modal de Proxies Webshare / Camoufox",
      webshareApiKeyLabel: "API Key",
      webshareApiKeyPlaceholder: "Token ...",
      webshareUsernameLabel: "Usuario (opcional)",
      webshareUsernamePlaceholder: "Usuario de Webshare",
      websharePasswordLabel: "Contrase\xF1a (opcional)",
      websharePasswordPlaceholder: "Contrase\xF1a de Webshare",
      saveWebshareConfigBtn: "Guardar",
      testWebshareBtn: "Probar",
      syncWebshareProxiesBtn: "Sincronizar Lista de Proxies",
      closeWebshareModalBtn: "Cerrar",
      messageBoxCancel: "Cancelar",
      messageBoxConfirm: "OK",
      themeToggleDark: "Modo Oscuro",
      themeToggleLight: "Modo Claro"
    }
  };
  var setButtonLabel = (button, text) => {
    if (!button) return;
    const icon = button.querySelector("img");
    button.innerHTML = "";
    if (icon) button.appendChild(icon);
    button.append(document.createTextNode(text));
  };
  var applyLanguage = (lang) => {
    const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.documentElement.lang = lang;
    const byIdText = [
      "appSubtitle",
      "camoufoxSetupTitle",
      "camoufoxSetupDesc",
      "logsHeading",
      "usersHeading",
      "templatesHeading",
      "settingsHeading"
    ];
    byIdText.forEach((id) => {
      const el = document.getElementById(id);
      if (el && dictionary[id]) el.textContent = dictionary[id];
    });
    setButtonLabel(openManageUsers, dictionary.openManageUsers);
    setButtonLabel(openAddTemplate, dictionary.openAddTemplate);
    setButtonLabel(openManageTemplates, dictionary.openManageTemplates);
    setButtonLabel(openLogsViewer, dictionary.openLogsViewer);
    setButtonLabel(openSettings, dictionary.openSettings);
    setButtonLabel(preparePythonEnvMainBtn, dictionary.preparePythonEnvMainBtn);
    setButtonLabel(openWebshareModalMainBtn, dictionary.openWebshareModalMainBtn);
    setButtonLabel(submitUser, dictionary.submitUser);
    setButtonLabel(importBatchTokensBtn, dictionary.importBatchTokensBtn);
    setButtonLabel(deleteBannedUsersBtn, dictionary.deleteBannedUsersBtn);
    setButtonLabel(checkUserStatus, dictionary.checkUserStatus);
    setButtonLabel($("exportJTokens"), dictionary.exportJTokens);
    setButtonLabel($("importJTokens"), dictionary.importJTokens);
    setButtonLabel(convert, dictionary.convert);
    setButtonLabel(previewCanvasButton, dictionary.previewCanvasButton);
    setButtonLabel(selectAllUsers, dictionary.selectAllUsers);
    setButtonLabel(submitTemplate, dictionary.submitTemplate);
    setButtonLabel(startAll, dictionary.startAll);
    setButtonLabel(stopAll, dictionary.stopAll);
    setButtonLabel(reloadProxiesBtn, dictionary.reloadProxiesBtn);
    setButtonLabel(openWebshareModalBtn, dictionary.openWebshareModalBtn);
    setButtonLabel(saveWebshareConfigBtn, dictionary.saveWebshareConfigBtn);
    setButtonLabel(testWebshareBtn, dictionary.testWebshareBtn);
    setButtonLabel(syncWebshareProxiesBtn, dictionary.syncWebshareProxiesBtn);
    setButtonLabel(closeWebshareModalBtn, dictionary.closeWebshareModalBtn);
    document.querySelectorAll(".tab-return-button").forEach((button) => setButtonLabel(button, dictionary.return));
    logsSearchInput?.setAttribute("placeholder", dictionary.logsSearchPlaceholder);
    batchTokensInput?.setAttribute("placeholder", dictionary.batchTokensPlaceholder);
    templateName?.setAttribute("placeholder", dictionary.templateNamePlaceholder);
    tx?.setAttribute("placeholder", dictionary.tileXPlaceholder);
    ty?.setAttribute("placeholder", dictionary.tileYPlaceholder);
    px?.setAttribute("placeholder", dictionary.pixelXPlaceholder);
    py?.setAttribute("placeholder", dictionary.pixelYPlaceholder);
    webshareApiKey?.setAttribute("placeholder", dictionary.webshareApiKeyPlaceholder);
    webshareUsername?.setAttribute("placeholder", dictionary.webshareUsernamePlaceholder);
    websharePassword?.setAttribute("placeholder", dictionary.websharePasswordPlaceholder);
    $("showLogsBtn").textContent = dictionary.showLogsBtn;
    $("showErrorsBtn").textContent = dictionary.showErrorsBtn;
    $("clearLogsBtn").textContent = dictionary.clearLogsBtn;
    $("logsExportBtn").textContent = dictionary.logsExportBtn;
    $("logsTypeFilter").options[0].textContent = dictionary.logsFilterAll;
    $("logsTypeFilter").options[1].textContent = dictionary.logsFilterError;
    $("logsTypeFilter").options[2].textContent = dictionary.logsFilterWarning;
    $("logsTypeFilter").options[3].textContent = dictionary.logsFilterSuccess;
    $("logsTypeFilter").options[4].textContent = dictionary.logsFilterInfo;
    document.querySelector('label[for="jcookie"]').textContent = dictionary.usersJwtLabel;
    document.querySelector('label[for="scookie"]').textContent = dictionary.usersCfLabel;
    document.querySelector("#manageUsers .info-box").innerHTML = `<b>${dictionary.batchImportTitle}</b><br>${dictionary.batchImportDesc}`;
    manageUsersTitle.textContent = dictionary.manageUsersTitle;
    $("chargeSummary").innerHTML = dictionary.chargeSummaryHtml;
    templateFormTitle.textContent = dictionary.templateFormTitle;
    $("addTemplate").querySelector(".info-box").innerHTML = dictionary.addTemplateTipHtml;
    $("details").children[0].textContent = dictionary.detailsSizeLabel;
    $("details").children[2].textContent = dictionary.detailsChargesLabel;
    document.querySelector('label[for="previewBorder"]').textContent = dictionary.previewBorderLabel;
    document.querySelector('label[for="templateName"]').textContent = dictionary.templateNameLabel;
    document.querySelector("#templateForm > label:not([for])").textContent = dictionary.coordinatesLabel;
    document.querySelector('label[for="userSelectList"]').textContent = dictionary.usersLabel;
    document.querySelector('label[for="canBuyMaxCharges"]').textContent = dictionary.canBuyMaxChargesLabel;
    document.querySelector('label[for="canBuyCharges"]').textContent = dictionary.canBuyChargesLabel;
    document.querySelector('label[for="antiGriefMode"]').textContent = dictionary.antiGriefModeLabel;
    document.querySelector('label[for="eraseMode"]').textContent = dictionary.eraseModeLabel;
    document.querySelector('label[for="templateOutlineMode"]').textContent = dictionary.templateOutlineModeLabel;
    document.querySelector('label[for="templateSkipPaintedPixels"]').textContent = dictionary.templateSkipPaintedPixelsLabel;
    document.querySelector('label[for="enableAutostart"]').textContent = dictionary.enableAutostartLabel;
    document.querySelector("#templateForm h3").textContent = dictionary.reorderColors;
    $("templateForm").querySelector(".btn-danger").textContent = dictionary.resetOrder;
    document.querySelector('label[for="drawingDirectionSelect"]').textContent = dictionary.drawingDirectionLabel;
    drawingDirectionSelect.options[0].textContent = dictionary.drawingDirectionWavefront;
    drawingDirectionSelect.options[1].textContent = dictionary.drawingDirectionNatural;
    drawingDirectionSelect.options[2].textContent = dictionary.drawingDirectionDown;
    drawingDirectionSelect.options[3].textContent = dictionary.drawingDirectionUp;
    drawingDirectionSelect.options[4].textContent = dictionary.drawingDirectionLeft;
    drawingDirectionSelect.options[5].textContent = dictionary.drawingDirectionRight;
    drawingDirectionSelect.options[6].textContent = dictionary.drawingDirectionSpiralFromCenter;
    drawingDirectionSelect.options[7].textContent = dictionary.drawingDirectionSpiralToCenter;
    drawingDirectionSelect.options[8].textContent = dictionary.drawingDirectionRandom;
    document.querySelector('label[for="drawingOrderSelect"]').textContent = dictionary.drawingOrderLabel;
    drawingOrderSelect.options[0].textContent = dictionary.drawingOrderLinear;
    drawingOrderSelect.options[1].textContent = dictionary.drawingOrderRandomColor;
    drawingOrderSelect.options[2].textContent = dictionary.drawingOrderColor;
    document.querySelector('label[for="pixelSkipSelect"]').textContent = dictionary.pixelSkipLabel;
    pixelSkipSelect.options[0].textContent = dictionary.pixelSkipEvery;
    document.querySelector('label[for="accountCooldown"]').textContent = dictionary.accountCooldownLabel;
    document.querySelector('label[for="purchaseCooldown"]').textContent = dictionary.purchaseCooldownLabel;
    document.querySelector('label[for="maxPixelsPerTurn"]').textContent = dictionary.maxPixelsPerTurnLabel;
    document.querySelector('label[for="readyChargeThreshold"]').textContent = dictionary.readyChargeThresholdLabel;
    document.querySelector('label[for="accountCheckCooldown"]').textContent = dictionary.accountCheckCooldownLabel;
    document.querySelector('label[for="dropletReserve"]').textContent = dictionary.dropletReserveLabel;
    document.querySelector('label[for="antiGriefStandby"]').textContent = dictionary.antiGriefStandbyLabel;
    document.querySelector('label[for="chargeThreshold"]').textContent = dictionary.chargeThresholdLabel;
    document.querySelector("#settings .section-title").textContent = dictionary.proxySettingsHeading;
    document.querySelector('label[for="proxyEnabled"]').textContent = dictionary.proxyEnabledLabel;
    proxyFormContainer.querySelector(".info-box").innerHTML = dictionary.proxyInfoHtml;
    document.querySelector('label[for="logProxyUsage"]').textContent = dictionary.logProxyUsageLabel;
    document.querySelector('label[for="proxyRotationMode"]').textContent = dictionary.proxyRotationModeLabel;
    proxyRotationMode.options[0].textContent = dictionary.proxyRotationSequential;
    proxyRotationMode.options[1].textContent = dictionary.proxyRotationRandom;
    document.querySelector("#webshareModal h3").textContent = dictionary.webshareModalTitle;
    document.querySelector('label[for="webshareApiKey"]').textContent = dictionary.webshareApiKeyLabel;
    document.querySelector('label[for="webshareUsername"]').textContent = dictionary.webshareUsernameLabel;
    document.querySelector('label[for="websharePassword"]').textContent = dictionary.websharePasswordLabel;
    messageBoxCancel.textContent = dictionary.messageBoxCancel;
    messageBoxConfirm.textContent = dictionary.messageBoxConfirm;
    localStorage.setItem("uiLanguage", lang);
  };
  var applyTheme = (theme) => {
    const finalTheme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", finalTheme);
    const lang = localStorage.getItem("uiLanguage") || "en";
    const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
    if (themeToggle) {
      themeToggle.textContent = finalTheme === "dark" ? dictionary.themeToggleLight : dictionary.themeToggleDark;
    }
    localStorage.setItem("uiTheme", finalTheme);
  };
  var templateUpdateInterval = null;
  var confirmCallback = {};
  var currentTab = "main";
  var currentTemplate = { width: 0, height: 0, data: [] };
  var showCanvasPreview = true;
  var logsWs = null;
  var logsMode = "logs";
  var allLogLines = [];
  var filterText = "";
  var filterType = "";
  var MAX_LOG_LINES = 2e3;
  var __logRenderScheduled = false;
  function renderLogsSoon() {
    if (__logRenderScheduled) return;
    __logRenderScheduled = true;
    setTimeout(() => {
      __logRenderScheduled = false;
      renderFilteredLogs();
    }, 100);
  }
  var tabs = {
    manageUsers,
    addTemplate,
    manageTemplates,
    settings,
    logsViewer
  };
  var menuButtonMap = {
    main: null,
    manageUsers: openManageUsers,
    addTemplate: openAddTemplate,
    manageTemplates: openManageTemplates,
    logsViewer: openLogsViewer,
    settings: openSettings
  };
  (() => {
    if (window.axios) return;
    const buildUrl = (url, params) => {
      if (!params) return url;
      const usp = new URLSearchParams(params);
      return url + (url.includes("?") ? "&" : "?") + usp.toString();
    };
    const request = async (method, url, { params, data, headers } = {}) => {
      const u = buildUrl(url, params);
      const init = { method, headers: { "Content-Type": "application/json", ...headers || {} } };
      if (data !== void 0) init.body = JSON.stringify(data);
      const res = await fetch(u, init);
      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.response = { status: res.status, data: body };
        throw err;
      }
      return { status: res.status, data: body };
    };
    window.axios = {
      get: (url, config) => request("GET", url, config),
      delete: (url, config) => request("DELETE", url, config),
      post: (url, data, config) => request("POST", url, { ...config || {}, data }),
      put: (url, data, config) => request("PUT", url, { ...config || {}, data })
    };
  })();
  var showMessage = (title, content) => {
    messageBoxTitle.innerHTML = title;
    messageBoxContent.innerHTML = content;
    messageBoxCancel.classList.add("hidden");
    messageBoxConfirm.textContent = "OK";
    messageBoxOverlay.classList.remove("hidden");
    confirmCallback = { close: true };
  };
  var showConfirmation = (title, content, onConfirm, closeOnConfirm) => {
    messageBoxTitle.innerHTML = title;
    messageBoxContent.innerHTML = content;
    messageBoxCancel.classList.remove("hidden");
    messageBoxConfirm.textContent = "Confirm";
    messageBoxOverlay.classList.remove("hidden");
    confirmCallback = {
      fn: onConfirm,
      close: closeOnConfirm
    };
  };
  var closeMessageBox = () => {
    messageBoxOverlay.classList.add("hidden");
  };
  messageBoxConfirm.addEventListener("click", () => {
    if (!confirmCallback) return;
    const { fn: callback, close } = confirmCallback;
    if (close) closeMessageBox();
    if (callback) callback();
  });
  messageBoxCancel.addEventListener("click", () => {
    closeMessageBox();
    confirmCallback = {};
  });
  var handleError = (error) => {
    console.error(error);
    let message = "An unknown error occurred. Check the console for details.";
    if (error?.response && error.response.status === 409) {
      message = "User is busy or not found. Wait a few seconds and try again, or stop templates using this user.";
    } else if (error.code === "ERR_NETWORK") {
      message = "Could not connect to the server. Please ensure the bot is running and accessible.";
    } else if (error.response && error.response.data && error.response.data.error) {
      const errMsg = error.response.data.error;
      if (errMsg.includes("(1015)")) {
        message = "You are being rate-limited by the server. Please wait a moment before trying again.";
      } else if (errMsg.includes("(500)")) {
        message = "Authentication failed. The user's cookie may be expired or invalid. Please try adding the user again with a new cookie.";
      } else if (errMsg.includes("(401)")) {
        message = "Authentication failed (401). This may be due to an invalid cookie or the IP/proxy being rate-limited. If a Private Access Token challenge just ran, one follow-up request may briefly return 401 and log a browser warning before normal traffic resumes.";
      } else if (errMsg.includes("(502)")) {
        message = "The server reported a 'Bad Gateway' error. It might be temporarily down or restarting. Please try again in a few moments.";
      } else {
        message = errMsg;
      }
    }
    showMessage("Error", message);
  };
  var changeTab = (tabName) => {
    if (templateUpdateInterval) {
      clearInterval(templateUpdateInterval);
      templateUpdateInterval = null;
    }
    Object.values(tabs).forEach((tab) => tab.style.display = "none");
    if (tabName !== "main" && tabs[tabName]) {
      tabs[tabName].style.display = "block";
    }
    if (mainCamoufoxActions) {
      mainCamoufoxActions.style.display = tabName === "main" ? "block" : "none";
    }
    Object.values(menuButtonMap).forEach((btn) => btn?.classList.remove("menu-button-active"));
    menuButtonMap[tabName]?.classList.add("menu-button-active");
    currentTab = tabName;
    window.scrollTo({ top: 0, behavior: "auto" });
    if (tabName === "logsViewer") {
      startLogsViewer();
    } else {
      stopLogsViewer();
    }
  };
  function startLogsViewer() {
    logsMode = "logs";
    logsContainer.innerHTML = '<span class="logs-placeholder">Connecting to log stream...</span>';
    connectLogsWs();
  }
  function stopLogsViewer() {
    if (logsWs) {
      logsWs.close();
      logsWs = null;
    }
  }
  function connectLogsWs() {
    if (logsWs) logsWs.close();
    logsContainer.innerHTML = '<span class="logs-placeholder">Connecting to log stream...</span>';
    let url = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws-logs?type=" + logsMode;
    logsWs = new WebSocket(url);
    logsContainer.innerHTML = "";
    allLogLines = [];
    logsWs.onopen = () => {
      logsContainer.innerHTML = '<span class="logs-placeholder">Waiting for logs...</span>';
    };
    logsWs.onmessage = (event) => {
      if (logsContainer.querySelector(".logs-placeholder")) logsContainer.innerHTML = "";
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data.initial)) {
          allLogLines = data.initial.slice(-MAX_LOG_LINES);
          renderLogsSoon();
          return;
        }
      } catch {
      }
      allLogLines.push(event.data);
      if (allLogLines.length > MAX_LOG_LINES) {
        allLogLines.splice(0, allLogLines.length - MAX_LOG_LINES);
      }
      renderLogsSoon();
    };
    logsWs.onerror = () => {
      logsContainer.innerHTML = '<span class="logs-placeholder">WebSocket error. Try refreshing.</span>';
    };
    logsWs.onclose = () => {
      logsContainer.innerHTML += '<span class="logs-placeholder">Log stream closed.</span>';
    };
  }
  function getFilteredLogs() {
    let filtered = allLogLines;
    const currentFilterType = filterType;
    const currentFilterText = filterText;
    if (currentFilterType) {
      filtered = filtered.filter((line) => {
        if (currentFilterType === "error") return /error|fail|exception|critical|\bERR\b|\bSRV_ERR\b/i.test(line);
        if (currentFilterType === "warn") return /warn|deprecated|slow|timeout/i.test(line);
        if (currentFilterType === "success") return /success|started|running|ok|ready|listening|connected/i.test(line);
        if (currentFilterType === "info") return /info|log|notice|\bOK\b/i.test(line);
        return true;
      });
    }
    if (currentFilterText) {
      const f = currentFilterText.toLowerCase();
      filtered = filtered.filter((line) => line.toLowerCase().includes(f));
    }
    return filtered;
  }
  function renderFilteredLogs() {
    const filtered = getFilteredLogs();
    logsContainer.innerHTML = filtered.map(renderLogLines).join("\n");
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }
  if (logsSearchInput) {
    logsSearchInput.addEventListener("input", (e) => {
      filterText = e.target.value;
      renderFilteredLogs();
    });
  }
  if (logsTypeFilter) {
    logsTypeFilter.addEventListener("change", (e) => {
      filterType = e.target.value;
      renderFilteredLogs();
    });
  }
  if (logsExportBtn) {
    logsExportBtn.addEventListener("click", () => {
      const filtered = getFilteredLogs();
      const redacted = filtered.map((line) => line.replace(/\(([^#()]+)#\d{5,}\)/g, "($1#REDACTED)"));
      const blob = new Blob([redacted.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = logsMode + "-export.txt";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
    });
  }
  function renderLogLines(text) {
    return text.split(/\r?\n/).filter(Boolean).map((line) => {
      let cls = "log-line";
      if (/error|fail|exception|critical|\bERR\b|\bSRV_ERR\b/i.test(line)) cls += " error";
      else if (/warn|deprecated|slow|timeout/i.test(line)) cls += " warn";
      else if (/success|started|running|ok|ready|listening|connected/i.test(line)) cls += " success";
      else if (/info|log|notice|\bOK\b/i.test(line)) cls += " info";
      return `<span class="${cls}">${escapeHtml(line)}</span>`;
    }).join("\n");
  }
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(tag) {
      const charsToReplace = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return charsToReplace[tag] || tag;
    });
  }
  openLogsViewer.addEventListener("click", () => changeTab("logsViewer"));
  showLogsBtn.addEventListener("click", () => {
    logsMode = "logs";
    logsContainer.innerHTML = '<span class="logs-placeholder">Switching to logs...</span>';
    connectLogsWs();
  });
  showErrorsBtn.addEventListener("click", () => {
    logsMode = "errors";
    logsContainer.innerHTML = '<span class="logs-placeholder">Switching to errors...</span>';
    connectLogsWs();
  });
  clearLogsBtn.addEventListener("click", () => {
    allLogLines = [];
    logsContainer.innerHTML = "";
  });
  async function axiosGetWithRetry(url, attempts = 3, delayMs = 2e3) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try {
        return await axios.get(url);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 409 || status === 429) {
          lastErr = err;
          if (i < attempts - 1) {
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }
        }
        throw err;
      }
    }
    throw lastErr;
  }
  var loadUsers = async (f) => {
    try {
      const users = await axios.get("/users");
      if (f) f(users.data);
    } catch (error) {
      handleError(error);
    }
  };
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let jValue = jcookie.value.trim();
    if (!jValue) {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          jcookie.value = text;
          jValue = text.trim();
        }
      } catch (err) {
        console.error("Failed to read clipboard contents: ", err);
        showMessage("Clipboard Error", "Could not read from clipboard. Please paste the cookie manually.");
        return;
      }
    }
    if (!jValue) {
      showMessage("Error", "JWT Cookie (j) is required.");
      return;
    }
    try {
      const cfuvidRaw = scookie.value.trim();
      const cfuvid = cfuvidRaw.startsWith("_cfuvid=") ? cfuvidRaw.slice("_cfuvid=".length) : cfuvidRaw;
      const cookies = { j: jValue };
      if (cfuvid) cookies._cfuvid = cfuvid;
      const response = await axios.post("/user", { cookies });
      if (response.status === 200) {
        showMessage("Success", `Logged in as ${response.data.name} (#${response.data.id})!`);
        userForm.reset();
        openManageUsers.click();
      }
    } catch (error) {
      handleError(error);
    }
  });
  deleteBannedUsersBtn.addEventListener("click", async () => {
    try {
      const response = await axios.get("/users");
      const users = response.data;
      const bannedUsers = Object.entries(users).filter(([id, user]) => {
        return user.suspendedUntil && user.suspendedUntil > Date.now() + 31536e8;
      });
      if (bannedUsers.length === 0) {
        showMessage("No Banned Accounts", "No permanently banned accounts were found.");
        return;
      }
      const userListHtml = bannedUsers.map(([id, user]) => `<li>${escapeHtml(user.name)} (#${id})</li>`).join("");
      const confirmationMessage = `
            <p>Are you sure you want to delete the following ${bannedUsers.length} permanently banned account(s)?</p>
            <ul style="text-align: left; max-height: 150px; overflow-y: auto;">${userListHtml}</ul>
            <p>This action cannot be undone.</p>
        `;
      showConfirmation("Confirm Deletion", confirmationMessage, async () => {
        let successCount = 0;
        let failCount = 0;
        const deletionPromises = bannedUsers.map(([id, user]) => {
          return axios.delete(`/user/${id}`).then(() => {
            successCount++;
          }).catch((err) => {
            failCount++;
            console.error(`Failed to delete user ${id}:`, err);
          });
        });
        await Promise.all(deletionPromises);
        showMessage("Deletion Complete", `Successfully deleted ${successCount} account(s).<br>${failCount > 0 ? `Failed to delete ${failCount} account(s). Check console for details.` : ""}`);
        openManageUsers.click();
      }, true);
    } catch (error) {
      handleError(error);
    }
  });
  var colors = {
    "0,0,0": { id: 1, name: "Black" },
    "60,60,60": { id: 2, name: "Dark Gray" },
    "120,120,120": { id: 3, name: "Gray" },
    "210,210,210": { id: 4, name: "Light Gray" },
    "255,255,255": { id: 5, name: "White" },
    "96,0,24": { id: 6, name: "Dark Red" },
    "237,28,36": { id: 7, name: "Red" },
    "255,127,39": { id: 8, name: "Orange" },
    "246,170,9": { id: 9, name: "Dark Orange" },
    "249,221,59": { id: 10, name: "Yellow" },
    "255,250,188": { id: 11, name: "Light Yellow" },
    "14,185,104": { id: 12, name: "Green" },
    "19,230,123": { id: 13, name: "Light Green" },
    "135,255,94": { id: 14, name: "Bright Green" },
    "12,129,110": { id: 15, name: "Teal" },
    "16,174,166": { id: 16, name: "Cyan" },
    "19,225,190": { id: 17, name: "Light Cyan" },
    "40,80,158": { id: 18, name: "Dark Blue" },
    "64,147,228": { id: 19, name: "Blue" },
    "96,247,242": { id: 20, name: "Light Blue" },
    "107,80,246": { id: 21, name: "Purple" },
    "153,177,251": { id: 22, name: "Light Purple" },
    "120,12,153": { id: 23, name: "Dark Purple" },
    "170,56,185": { id: 24, name: "Magenta" },
    "224,159,249": { id: 25, name: "Light Magenta" },
    "203,0,122": { id: 26, name: "Dark Pink" },
    "236,31,128": { id: 27, name: "Pink" },
    "243,141,169": { id: 28, name: "Light Pink" },
    "104,70,52": { id: 29, name: "Brown" },
    "149,104,42": { id: 30, name: "Dark Brown" },
    "248,178,119": { id: 31, name: "Tan" },
    "170,170,170": { id: 32, name: "Medium Gray" },
    "165,14,30": { id: 33, name: "Maroon" },
    "250,128,114": { id: 34, name: "Salmon" },
    "228,92,26": { id: 35, name: "Red Orange" },
    "214,181,148": { id: 36, name: "Beige" },
    "156,132,49": { id: 37, name: "Olive" },
    "197,173,49": { id: 38, name: "Yellow Green" },
    "232,212,95": { id: 39, name: "Pale Yellow" },
    "74,107,58": { id: 40, name: "Forest Green" },
    "90,148,74": { id: 41, name: "Moss Green" },
    "132,197,115": { id: 42, name: "Mint Green" },
    "15,121,159": { id: 43, name: "Steel Blue" },
    "187,250,242": { id: 44, name: "Aqua" },
    "125,199,255": { id: 45, name: "Sky Blue" },
    "77,49,184": { id: 46, name: "Indigo" },
    "74,66,132": { id: 47, name: "Navy Blue" },
    "122,113,196": { id: 48, name: "Slate Blue" },
    "181,174,241": { id: 49, name: "Periwinkle" },
    "219,164,99": { id: 50, name: "Peach" },
    "209,128,81": { id: 51, name: "Bronze" },
    "255,197,165": { id: 52, name: "Light Peach" },
    "155,82,73": { id: 53, name: "Rust" },
    "209,128,120": { id: 54, name: "Rose" },
    "250,182,164": { id: 55, name: "Blush" },
    "123,99,82": { id: 56, name: "Coffee" },
    "156,132,107": { id: 57, name: "Taupe" },
    "51,57,65": { id: 58, name: "Charcoal" },
    "109,117,141": { id: 59, name: "Slate" },
    "179,185,209": { id: 60, name: "Lavender" },
    "109,100,63": { id: 61, name: "Khaki" },
    "148,140,107": { id: 62, name: "Sand" },
    "205,197,158": { id: 63, name: "Cream" }
  };
  var ID_TO_RGB = /* @__PURE__ */ new Map();
  var PALETTE_ENTRIES = [];
  var closestCache = /* @__PURE__ */ new Map();
  var srgbNonlinearTransformInv = (c) => c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
  var rgbToOklab = (r, g, b) => {
    const lr = srgbNonlinearTransformInv(r / 255);
    const lg = srgbNonlinearTransformInv(g / 255);
    const lb = srgbNonlinearTransformInv(b / 255);
    const lp = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const mp = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const sp = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    const l = 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp;
    const aa = 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp;
    const bb = 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp;
    return [l, aa, bb];
  };
  var deltaE2000 = (lab1, lab2) => {
    const [L1, a1, b1] = lab1;
    const [L2, a2, b2] = lab2;
    const rad2deg = (rad) => rad * 180 / Math.PI;
    const deg2rad = (deg) => deg * Math.PI / 180;
    const C1 = Math.sqrt(a1 ** 2 + b1 ** 2);
    const C2 = Math.sqrt(a2 ** 2 + b2 ** 2);
    const avgC = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(avgC ** 7 / (avgC ** 7 + 25 ** 7)));
    const a1p = a1 * (1 + G);
    const a2p = a2 * (1 + G);
    const C1p = Math.sqrt(a1p ** 2 + b1 ** 2);
    const C2p = Math.sqrt(a2p ** 2 + b2 ** 2);
    const h1p = b1 === 0 && a1p === 0 ? 0 : rad2deg(Math.atan2(b1, a1p)) % 360;
    const h2p = b2 === 0 && a2p === 0 ? 0 : rad2deg(Math.atan2(b2, a2p)) % 360;
    const Lp = L2 - L1;
    const Cp = C2p - C1p;
    let hp = 0;
    if (C1p * C2p !== 0) {
      hp = h2p - h1p;
      if (hp > 180) hp -= 360;
      else if (hp < -180) hp += 360;
    }
    const Hp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deg2rad(hp) / 2);
    const avgLp = (L1 + L2) / 2;
    const avgCp = (C1p + C2p) / 2;
    let avghp = (h1p + h2p) / 2;
    if (Math.abs(h1p - h2p) > 180) avghp += 180;
    const T = 1 - 0.17 * Math.cos(deg2rad(avghp - 30)) + 0.24 * Math.cos(deg2rad(2 * avghp)) + 0.32 * Math.cos(deg2rad(3 * avghp + 6)) - 0.2 * Math.cos(deg2rad(4 * avghp - 63));
    const SL = 1 + 0.015 * (avgLp - 50) ** 2 / Math.sqrt(20 + (avgLp - 50) ** 2);
    const SC = 1 + 0.045 * avgCp;
    const SH = 1 + 0.015 * avgCp * T;
    const theta = 30 * Math.exp(-(((avghp - 275) / 25) ** 2));
    const RC = 2 * Math.sqrt(avgCp ** 7 / (avgCp ** 7 + 25 ** 7));
    const RT = -RC * Math.sin(deg2rad(2 * theta));
    return Math.sqrt(
      (Lp / SL) ** 2 + (Cp / SC) ** 2 + (Hp / SH) ** 2 + RT * (Cp / SC) * (Hp / SH)
    );
  };
  function buildPaletteCaches() {
    ID_TO_RGB.clear();
    PALETTE_ENTRIES = [];
    for (const [rgbStr, info] of Object.entries(colors)) {
      const [r, g, b] = rgbStr.split(",").map(Number);
      PALETTE_ENTRIES.push({ r, g, b, id: info.id, rgbStr, lab: rgbToOklab(r, g, b) });
      ID_TO_RGB.set(info.id, [r, g, b]);
    }
    closestCache.clear();
  }
  async function syncPalette() {
    try {
      const r = await fetch("/palette");
      if (!r.ok) return;
      const data = await r.json();
      if (data && Array.isArray(data.colors)) {
        const merged = {};
        for (const c of data.colors) {
          if (!c || typeof c.rgb !== "string" || !Number.isInteger(c.id)) continue;
          merged[c.rgb] = { id: c.id, name: c.name || (colors[c.rgb]?.name || `Color ${c.id}`) };
        }
        Object.assign(colors, merged);
        buildPaletteCaches();
      }
    } catch (e) {
      console.debug("palette sync skipped:", e?.message || e);
    }
  }
  buildPaletteCaches();
  var paletteSyncPromise = syncPalette();
  var closest = (color) => {
    const cached = closestCache.get(color);
    if (cached) return cached;
    const [tr, tg, tb] = color.split(",").map(Number);
    const targetLab = rgbToOklab(tr, tg, tb);
    let bestKey = PALETTE_ENTRIES.length ? PALETTE_ENTRIES[0].rgbStr : color;
    let best = Infinity;
    for (const p of PALETTE_ENTRIES) {
      const d = deltaE2000(targetLab, p.lab);
      if (d < best) {
        best = d;
        bestKey = p.rgbStr;
      }
    }
    closestCache.set(color, bestKey);
    return bestKey;
  };
  var drawTemplate = (template, canvas) => {
    canvas.width = template.width;
    canvas.height = template.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, template.width, template.height);
    const imageData = new ImageData(template.width, template.height);
    for (let x = 0; x < template.width; x++) {
      for (let y = 0; y < template.height; y++) {
        const color = template.data[x][y];
        if (color === 0) continue;
        const i = (y * template.width + x) * 4;
        if (color === -1) {
          imageData.data[i] = 158;
          imageData.data[i + 1] = 189;
          imageData.data[i + 2] = 255;
          imageData.data[i + 3] = 255;
          continue;
        }
        const rgbArr = ID_TO_RGB.get(color);
        if (!rgbArr) continue;
        const [r, g, b] = rgbArr;
        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
        imageData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };
  var loadTemplates = async (f) => {
    try {
      const templates = await axios.get("/templates");
      if (f) f(templates.data);
    } catch (error) {
      handleError(error);
    }
  };
  var fetchCanvas = async (txVal, tyVal, pxVal, pyVal, width, height) => {
    const TILE_SIZE = 1e3;
    const radius = Math.max(0, parseInt(previewBorder.value, 10) || 0);
    const startX = txVal * TILE_SIZE + pxVal - radius;
    const startY = tyVal * TILE_SIZE + pyVal - radius;
    const displayWidth = width + radius * 2;
    const displayHeight = height + radius * 2;
    const endX = startX + displayWidth;
    const endY = startY + displayHeight;
    const startTileX = Math.floor(startX / TILE_SIZE);
    const startTileY = Math.floor(startY / TILE_SIZE);
    const endTileX = Math.floor((endX - 1) / TILE_SIZE);
    const endTileY = Math.floor((endY - 1) / TILE_SIZE);
    previewCanvas.width = displayWidth;
    previewCanvas.height = displayHeight;
    const ctx = previewCanvas.getContext("2d");
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    for (let txi = startTileX; txi <= endTileX; txi++) {
      for (let tyi = startTileY; tyi <= endTileY; tyi++) {
        try {
          const res = await fetch(`/canvas?tx=${txi}&ty=${tyi}`);
          if (!res.ok) throw new Error(`Canvas tile fetch failed: ${res.status}`);
          const blob = await res.blob();
          const img = new Image();
          const objectUrl = URL.createObjectURL(blob);
          img.src = objectUrl;
          await img.decode();
          const sx = txi === startTileX ? startX - txi * TILE_SIZE : 0;
          const sy = tyi === startTileY ? startY - tyi * TILE_SIZE : 0;
          const ex = txi === endTileX ? endX - txi * TILE_SIZE : TILE_SIZE;
          const ey = tyi === endTileY ? endY - tyi * TILE_SIZE : TILE_SIZE;
          const sw = ex - sx;
          const sh = ey - sy;
          const dx = txi * TILE_SIZE + sx - startX;
          const dy = tyi * TILE_SIZE + sy - startY;
          ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh);
          URL.revokeObjectURL(objectUrl);
        } catch (error) {
          handleError(error);
          return;
        }
      }
    }
    const baseImage = ctx.getImageData(0, 0, displayWidth, displayHeight);
    const templateCtx = templateCanvas.getContext("2d");
    const templateImage = templateCtx.getImageData(0, 0, width, height);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(templateCanvas, radius, radius);
    ctx.globalAlpha = 1;
    const b = baseImage.data;
    const t = templateImage.data;
    for (let i = 0; i < t.length; i += 4) {
      if (t[i + 3] === 0) continue;
      const templateIdx = i / 4;
      const templateX = templateIdx % width;
      const templateY = Math.floor(templateIdx / width);
      const canvasX = templateX + radius;
      const canvasY = templateY + radius;
      const canvasIdx = (canvasY * displayWidth + canvasX) * 4;
      const baseAlpha = b[canvasIdx + 3];
      const sameColor = baseAlpha !== 0 && b[canvasIdx] === t[i] && b[canvasIdx + 1] === t[i + 1] && b[canvasIdx + 2] === t[i + 2];
      if (!sameColor) {
        ctx.fillStyle = "rgba(255,0,0,0.8)";
        ctx.fillRect(canvasX, canvasY, 1, 1);
      }
    }
    previewCanvas.style.display = "block";
  };
  var nearestimgdecoder = (imageData, width, height) => {
    const d = imageData.data;
    const matrix = Array.from({ length: width }, () => Array(height).fill(0));
    const uniqueColors = /* @__PURE__ */ new Set();
    let ink2 = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const a = d[i + 3];
        if (a === 255) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const rgb = `${r},${g},${b}`;
          if (rgb == "158,189,255") {
            matrix[x][y] = -1;
          } else {
            const colorObj = colors[rgb] || colors[closest(rgb)];
            if (colorObj) {
              matrix[x][y] = colorObj.id;
              uniqueColors.add(colorObj.id);
            } else {
              matrix[x][y] = 0;
            }
          }
          ink2++;
        } else {
          matrix[x][y] = 0;
        }
      }
    }
    return { matrix, ink: ink2, uniqueColors };
  };
  var processImageFile = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.src = e.target.result;
      image.onload = async () => {
        await paletteSyncPromise.catch(() => {
        });
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { matrix, ink: ink2, uniqueColors } = nearestimgdecoder(imageData, canvas.width, canvas.height);
        const filteredColors = Array.from(uniqueColors).filter((id) => id !== 0 && id !== -1);
        const template = {
          width: canvas.width,
          height: canvas.height,
          ink: ink2,
          data: matrix,
          uniqueColors: filteredColors
        };
        canvas.remove();
        callback(template);
      };
    };
    reader.readAsDataURL(file);
  };
  var processEvent = () => {
    const file = convertInput.files[0];
    if (file) {
      templateName.value = file.name.replace(/\.[^/.]+$/, "");
      processImageFile(file, (template) => {
        currentTemplate = template;
        drawTemplate(template, templateCanvas);
        size.innerHTML = `${template.width}x${template.height}px`;
        ink.innerHTML = template.ink;
        templateCanvas.style.display = "block";
        previewCanvas.style.display = "none";
        details.style.display = "block";
        if (template.uniqueColors && template.uniqueColors.length > 0) {
          availableColors.clear();
          template.uniqueColors.forEach((colorId) => availableColors.add(colorId));
          updateColorGridForImage(template.uniqueColors);
        } else {
          console.warn("No unique colors found in image, showing all colors");
          availableColors = new Set(Object.values(colors).map((c) => c.id));
          resetOrder();
        }
      });
    }
  };
  convertInput.addEventListener("change", processEvent);
  previewCanvasButton.addEventListener("click", async () => {
    const txVal = parseInt(tx.value, 10);
    const tyVal = parseInt(ty.value, 10);
    const pxVal = parseInt(px.value, 10);
    const pyVal = parseInt(py.value, 10);
    if (isNaN(txVal) || isNaN(tyVal) || isNaN(pxVal) || isNaN(pyVal) || currentTemplate.width === 0) {
      showMessage("Error", "Please convert an image and enter valid coordinates before previewing.");
      return;
    }
    await fetchCanvas(txVal, tyVal, pxVal, pyVal, currentTemplate.width, currentTemplate.height);
  });
  function pastePinCoordinates(text) {
    const patterns = [
      /Tl X:\s*(\d+),\s*Tl Y:\s*(\d+),\s*Px X:\s*(\d+),\s*Px Y:\s*(\d+)/,
      /^\s*(\d+)[\s,;]+(\d+)[\s,;]+(\d+)[\s,;]+(\d+)\s*$/
    ];
    for (const p of patterns) {
      const match = p.exec(text);
      if (match) {
        $("tx").value = match[1];
        $("ty").value = match[2];
        $("px").value = match[3];
        $("py").value = match[4];
        return true;
      }
    }
    return false;
  }
  document.addEventListener("paste", (e) => {
    const text = e.clipboardData?.getData("text");
    if (text && pastePinCoordinates(text)) {
      e.preventDefault();
    }
  });
  canBuyMaxCharges.addEventListener("change", () => {
    if (canBuyMaxCharges.checked) {
      canBuyCharges.checked = false;
    }
  });
  canBuyCharges.addEventListener("change", () => {
    if (canBuyCharges.checked) {
      canBuyMaxCharges.checked = false;
    }
  });
  var resetTemplateForm = () => {
    templateForm.reset();
    templateFormTitle.textContent = "Add Template";
    submitTemplate.innerHTML = '<img src="icons/addTemplate.svg">Add Template';
    delete templateForm.dataset.editId;
    details.style.display = "none";
    previewCanvas.style.display = "none";
    currentTemplate = { width: 0, height: 0, data: [] };
    currentTemplateId = null;
    availableColors.clear();
    initializeGrid(null);
  };
  templateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const isEditMode = !!templateForm.dataset.editId;
    if (!isEditMode && (!currentTemplate || currentTemplate.width === 0)) {
      showMessage("Error", "Please convert an image before creating a template.");
      return;
    }
    const selectedUsers = Array.from(document.querySelectorAll('input[name="user_checkbox"]:checked')).map(
      (cb) => cb.value
    );
    if (selectedUsers.length === 0) {
      showMessage("Error", "Please select at least one user.");
      return;
    }
    const data = {
      templateName: templateName.value,
      coords: [tx.value, ty.value, px.value, py.value].map(Number),
      userIds: selectedUsers,
      canBuyCharges: canBuyCharges.checked,
      canBuyMaxCharges: canBuyMaxCharges.checked,
      antiGriefMode: antiGriefMode.checked,
      eraseMode: eraseMode.checked,
      outlineMode: templateOutlineMode.checked,
      skipPaintedPixels: templateSkipPaintedPixels.checked,
      enableAutostart: enableAutostart.checked
    };
    if (currentTemplate && currentTemplate.width > 0) {
      data.template = currentTemplate;
    }
    try {
      let templateId;
      let colorOrderSaved = false;
      if (isEditMode) {
        templateId = templateForm.dataset.editId;
        await axios.put(`/template/edit/${templateId}`, data);
        colorOrderSaved = await saveColorOrder(templateId);
        showMessage("Success", "Template updated!");
      } else {
        const response = await axios.post("/template", data);
        templateId = response.data.id;
        colorOrderSaved = await saveColorOrder(templateId);
        showMessage("Success", "Template created!");
      }
      resetTemplateForm();
      openManageTemplates.click();
    } catch (error) {
      handleError(error);
    }
  });
  startAll.addEventListener("click", async () => {
    for (const child of templateList.children) {
      try {
        await axios.put(`/template/${child.id}`, { running: true });
      } catch (error) {
        handleError(error);
      }
    }
    showMessage("Success", "Finished! Check console for details.");
    openManageTemplates.click();
  });
  stopAll.addEventListener("click", async () => {
    for (const child of templateList.children) {
      try {
        await axios.put(`/template/${child.id}`, { running: false });
      } catch (error) {
        handleError(error);
      }
    }
    showMessage("Success", "Finished! Check console for details.");
    openManageTemplates.click();
  });
  var exportJTokens = document.getElementById("exportJTokens");
  var importJTokens = document.getElementById("importJTokens");
  var importJTokensInput = document.getElementById("importJTokensInput");
  exportJTokens.addEventListener("click", async () => {
    try {
      const response = await axios.get("/users");
      const users = response.data;
      let tokenText = "";
      let tokenCount = 0;
      for (const id in users) {
        if (users[id].cookies?.j) {
          tokenText += users[id].cookies.j + "\n";
          tokenCount++;
        }
      }
      if (tokenCount === 0) {
        showMessage("Error", "No valid J tokens found to export.");
        return;
      }
      const blob = new Blob([tokenText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "j_tokens.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage("Success", `Exported ${tokenCount} J token(s) successfully!`);
    } catch (error) {
      handleError(error);
    }
  });
  importJTokens.addEventListener("click", () => {
    importJTokensInput.click();
  });
  importJTokensInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    importJTokens.disabled = true;
    importJTokens.innerHTML = '<img src="icons/restart.svg" alt="" class="spin"> Importing...';
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const lines = content.split("\n");
        const tokens = [];
        const uniqueTokens = /* @__PURE__ */ new Set();
        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith("#")) continue;
          if (!uniqueTokens.has(line)) {
            uniqueTokens.add(line);
            tokens.push(line);
          }
        }
        if (tokens.length === 0) {
          showMessage("Error", "No valid tokens found in the file.");
          importJTokens.disabled = false;
          importJTokens.innerHTML = '<img src="icons/upload.svg" alt="">Import J Tokens';
          return;
        }
        const existingUsers = await axios.get("/users");
        const existingTokens = /* @__PURE__ */ new Set();
        for (const userId in existingUsers.data) {
          if (existingUsers.data[userId].cookies?.j) {
            existingTokens.add(existingUsers.data[userId].cookies.j);
          }
        }
        const newTokens = tokens.filter((token) => !existingTokens.has(token));
        if (newTokens.length === 0) {
          showMessage("Warning", "All tokens in the file already exist in the system.");
          importJTokens.disabled = false;
          importJTokens.innerHTML = '<img src="icons/upload.svg" alt="">Import J Tokens';
          return;
        }
        const MAX_CONCURRENT = 5;
        let processed = 0;
        let success = 0;
        let failed = 0;
        let skipped = tokens.length - newTokens.length;
        const errors = [];
        const addedUsers = [];
        const runWithConcurrency = async (items, workerFn, maxConcurrent) => {
          const results = [];
          const running = [];
          for (const item of items) {
            const p = Promise.resolve().then(() => workerFn(item));
            results.push(p);
            if (maxConcurrent <= items.length) {
              const e2 = p.then(() => running.splice(running.indexOf(e2), 1));
              running.push(e2);
              if (running.length >= maxConcurrent) {
                await Promise.race(running);
              }
            }
          }
          return Promise.all(results);
        };
        const processToken = async (token) => {
          try {
            const response = await axios.post("/users/import", { tokens: [token] });
            processed++;
            if (response.data.imported > 0) {
              success++;
              if (response.data.userData) {
                addedUsers.push(`${response.data.userData.name}#${response.data.userData.id}`);
              }
            } else {
              skipped++;
            }
          } catch (error) {
            processed++;
            failed++;
            errors.push(error.response?.data?.error || error.message);
          }
          const progress = Math.round(processed / newTokens.length * 100);
          importJTokens.innerHTML = `<img src="icons/restart.svg" alt="" class="spin"> Importing (${progress}%)...`;
        };
        showConfirmation(
          "Import J Tokens",
          `Found ${tokens.length} tokens in the file (${skipped} duplicates detected).<br>Do you want to import ${newTokens.length} new tokens?`,
          async () => {
            try {
              await runWithConcurrency(newTokens, processToken, MAX_CONCURRENT);
              let summary = `<b>Import Summary:</b><br>`;
              summary += `- Input lines: ${lines.length}<br>`;
              summary += `- Unique tokens: ${tokens.length}<br>`;
              summary += `- Processed: ${processed}<br>`;
              summary += `- Success: ${success}<br>`;
              summary += `- Failed: ${failed}<br>`;
              summary += `- Skipped: ${skipped}<br>`;
              if (addedUsers.length > 0) {
                summary += `<br><b>Added users:</b><br>`;
                summary += addedUsers.map((u) => `- ${u}`).join("<br>");
              }
              if (errors.length > 0) {
                summary += `<br><b>Errors:</b><br>`;
                summary += errors.slice(0, 5).map((e2) => `- ${e2}`).join("<br>");
                if (errors.length > 5) {
                  summary += `<br>- ...and ${errors.length - 5} more errors`;
                }
              }
              showMessage("Import Complete", summary);
              openManageUsers.click();
            } catch (error) {
              handleError(error);
            } finally {
              importJTokens.disabled = false;
              importJTokens.innerHTML = '<img src="icons/upload.svg" alt="">Import J Tokens';
            }
          },
          true,
          () => {
            importJTokens.disabled = false;
            importJTokens.innerHTML = '<img src="icons/upload.svg" alt="">Import J Tokens';
          }
        );
      } catch (error) {
        handleError(error);
        importJTokens.disabled = false;
        importJTokens.innerHTML = '<img src="icons/upload.svg" alt="">Import J Tokens';
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  });
  importBatchTokensBtn?.addEventListener("click", async () => {
    const raw = (batchTokensInput?.value || "").trim();
    if (!raw) {
      showMessage("Error", "Paste at least one token in the batch box.");
      return;
    }
    const tokens = [...new Set(raw.split(/\r?\n/).map((t) => t.trim()).filter((t) => t && !t.startsWith("#")))];
    if (!tokens.length) {
      showMessage("Error", "No valid tokens detected.");
      return;
    }
    importBatchTokensBtn.disabled = true;
    importBatchTokensBtn.innerHTML = '<img src="icons/restart.svg" alt="" class="spin"> Importing...';
    try {
      const { data } = await axios.post("/users/import", { tokens });
      const summary = `Imported: ${data.imported} | Skipped: ${data.skipped} | Failed: ${data.failed}`;
      showMessage("Batch import completed", summary);
      if (batchTokensInput) batchTokensInput.value = "";
      openManageUsers.click();
    } catch (error) {
      handleError(error);
    } finally {
      importBatchTokensBtn.disabled = false;
      importBatchTokensBtn.innerHTML = '<img src="icons/upload.svg" alt="">Import Batch Tokens';
    }
  });
  openManageUsers.addEventListener("click", () => {
    userList.innerHTML = "";
    userForm.reset();
    totalCharges.textContent = "?";
    totalMaxCharges.textContent = "?";
    totalDroplets.textContent = "?";
    totalPPH.textContent = "?";
    loadUsers((users) => {
      const userCount = Object.keys(users).length;
      manageUsersTitle.textContent = `Existing Users (${userCount})`;
      if (userCount === 0) {
        totalCharges.textContent = "0";
        totalMaxCharges.textContent = "0";
        totalDroplets.textContent = "0";
        totalPPH.textContent = "0";
        return;
      }
      let totalChargesCount = 0;
      let totalMaxChargesCount = 0;
      let totalDropletsCount = 0;
      let totalPixelsPerHour = 0;
      for (const id of Object.keys(users)) {
        const user = document.createElement("div");
        user.className = "user";
        user.id = `user-${id}`;
        const safeName = escapeHtml(String(users[id].name));
        const pixelData = users[id].pixels;
        const chargeCount = pixelData ? pixelData.count : "?";
        const chargeMax = pixelData ? pixelData.max : "?";
        const percentage = pixelData ? pixelData.percentage.toFixed(1) : "?";
        const isExtrapolated = pixelData?.isExtrapolated ? " (est)" : "";
        if (pixelData) {
          totalChargesCount += pixelData.count;
          totalMaxChargesCount += pixelData.max;
          const pph = pixelData.count > 0 ? 120 : 0;
          totalPixelsPerHour += pph;
        }
        const droplets = users[id].droplets || "?";
        if (droplets !== "?") {
          totalDropletsCount += droplets;
        }
        user.innerHTML = `
                <div class="user-info">
                    <span>${safeName}</span>
                    <span>(#${id})</span>
                    <div class="user-stats">
                        Charges: <b>${chargeCount}</b>/<b>${chargeMax}</b> | Level <b>?</b> <span class="level-progress">(${percentage}%${isExtrapolated})</span><br>
                        Droplets: <b>${droplets}</b>
                    </div>
                </div>
                <div class="user-card-actions">
                    <button class="delete-btn" title="Delete User"><img src="icons/remove.svg"></button>
                    <button class="info-btn" title="Get User Info"><img src="icons/code.svg"></button>
                </div>`;
        user.querySelector(".delete-btn").addEventListener("click", () => {
          showConfirmation(
            "Delete User",
            `Are you sure you want to delete ${safeName} (#${id})? This will also remove them from all templates.`,
            async () => {
              try {
                await axios.delete(`/user/${id}`);
                showMessage("Success", "User deleted.");
                openManageUsers.click();
              } catch (error) {
                handleError(error);
              }
            },
            true
          );
        });
        user.querySelector(".info-btn").addEventListener("click", async () => {
          try {
            const response = await axiosGetWithRetry(`/user/status/${id}`, 3, 2e3);
            let { status: isBanned, until } = response.data.ban;
            let info;
            if (isBanned == true) {
              if (until == Number.MAX_SAFE_INTEGER)
                until = "FOREVER";
              else
                until = new Date(until);
              const safeBannedName = escapeHtml(String(response.data.name));
              const safeUntil = escapeHtml(String(until));
              info = `
                        User <b><span style="color: #f97a1f;">${safeBannedName}</span></b> has been <span style="color: #b91919ff;">banned!</span><br>
                        <b>Banned until:</n> <span style="color: #f97a1f;">${safeUntil}</span><br>
                        <br>Would you like to remove the <b>account</b> from the user list?
                        `;
            } else
              info = `
                        <b>User Name:</b> <span style="color: #f97a1f;">${escapeHtml(String(response.data.name))}</span><br>
                        <b>Charges:</b> <span style="color: #f97a1f;">${Math.floor(response.data.charges.count)}</span>/<span style="color: #f97a1f;">${response.data.charges.max}</span><br>
                        <b>Droplets:</b> <span style="color: #f97a1f;">${escapeHtml(String(response.data.droplets))}</span><br>
                        <b>Favorite Locations:</b> <span style="color: #f97a1f;">${response.data.favoriteLocations.length}</span>/<span style="color: #f97a1f;">${response.data.maxFavoriteLocations}</span><br>
                        <b>Flag Equipped:</b> <span style="color: #f97a1f;">${response.data.equippedFlag ? "Yes" : "No"}</span><br>
                        <b>Discord:</b> <span style="color: #f97a1f;">${escapeHtml(String(response.data.discord))}</span><br>
                        <b>Country:</b> <span style="color: #f97a1f;">${escapeHtml(String(response.data.country))}</span><br>
                        <b>Pixels Painted:</b> <span style="color: #f97a1f;">${escapeHtml(String(response.data.pixelsPainted))}</span><br>
                        <b>Extra Colors:</b> <span style="color: #f97a1f;">${escapeHtml(String(response.data.extraColorsBitmap))}</span><br>
                        <b>Alliance ID:</b> <span style="color: #f97a1f;">${escapeHtml(String(response.data.allianceId))}</span><br>
                        <b>Alliance Role:</b> <span style="color: #f97a1f;">${escapeHtml(String(response.data.allianceRole))}</span><br>
                        <br>Would you like to copy the <b>Raw Json</b> to your clipboard?
                        `;
            showConfirmation("User Info", info, () => {
              if (isBanned) user.querySelector(".delete-btn").click();
              else navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
            }, !isBanned);
          } catch (error) {
            handleError(error);
          }
        });
        userList.appendChild(user);
      }
      totalCharges.textContent = totalChargesCount.toFixed(0);
      totalMaxCharges.textContent = totalMaxChargesCount.toFixed(0);
      totalDroplets.textContent = totalDropletsCount.toFixed(0);
      totalPPH.textContent = totalPixelsPerHour.toFixed(1);
      setTimeout(() => {
        if (!checkUserStatus.disabled) checkUserStatus.click();
      }, 80);
    });
    changeTab("manageUsers");
  });
  checkUserStatus.addEventListener("click", async () => {
    checkUserStatus.disabled = true;
    checkUserStatus.innerHTML = "Checking...";
    const userElements = Array.from(document.querySelectorAll(".user"));
    userElements.forEach((userEl) => {
      const infoSpans = userEl.querySelectorAll(".user-info > span");
      infoSpans.forEach((span) => span.style.color = "var(--warning-color)");
    });
    let totalCurrent = 0;
    let totalMax = 0;
    let totalDropletsCount = 0;
    let successfulAccounts = 0;
    try {
      const response = await axios.post("/users/status");
      const statuses = response.data;
      for (const userEl of userElements) {
        const id = userEl.id.split("-")[1];
        const status = statuses[id];
        const infoSpans = userEl.querySelectorAll(".user-info > span");
        const currentChargesEl = userEl.querySelector(".user-stats b:nth-of-type(1)");
        const maxChargesEl = userEl.querySelector(".user-stats b:nth-of-type(2)");
        const currentLevelEl = userEl.querySelector(".user-stats b:nth-of-type(3)");
        const dropletsEl = userEl.querySelector(".user-stats b:nth-of-type(4)");
        const levelProgressEl = userEl.querySelector(".level-progress");
        const banData = status?.data?.ban;
        const isBanned = typeof banData === "boolean" ? banData : Boolean(banData?.status);
        if (status && status.success && !isBanned) {
          const userInfo = status.data;
          const charges = Math.floor(userInfo.charges.count);
          const max = userInfo.charges.max;
          const level = Math.floor(userInfo.level);
          const progress = Math.round(userInfo.level % 1 * 100);
          currentChargesEl.textContent = charges;
          maxChargesEl.textContent = max;
          currentLevelEl.textContent = level;
          dropletsEl.textContent = userInfo.droplets.toLocaleString();
          levelProgressEl.textContent = `(${progress}%)`;
          totalCurrent += charges;
          totalMax += max;
          totalDropletsCount += userInfo.droplets;
          successfulAccounts++;
          infoSpans.forEach((span) => span.style.color = "var(--success-color)");
        } else {
          currentChargesEl.textContent = "ERR";
          maxChargesEl.textContent = "ERR";
          currentLevelEl.textContent = "?";
          dropletsEl.textContent = "ERR";
          levelProgressEl.textContent = "(?%)";
          infoSpans.forEach((span) => span.style.color = "var(--error-color)");
        }
      }
    } catch (error) {
      handleError(error);
      userElements.forEach((userEl) => {
        const infoSpans = userEl.querySelectorAll(".user-info > span");
        infoSpans.forEach((span) => span.style.color = "var(--error-color)");
      });
    }
    totalCharges.textContent = totalCurrent;
    totalMaxCharges.textContent = totalMax;
    totalDroplets.textContent = totalDropletsCount.toLocaleString();
    const pph = successfulAccounts * 120;
    totalPPH.textContent = pph.toLocaleString();
    checkUserStatus.disabled = false;
    checkUserStatus.innerHTML = '<img src="icons/check.svg">Check Account Status';
  });
  openAddTemplate.addEventListener("click", () => {
    resetTemplateForm();
    userSelectList.innerHTML = "";
    loadUsers((users) => {
      if (Object.keys(users).length === 0) {
        userSelectList.innerHTML = "<span>No users added. Please add a user first.</span>";
        return;
      }
      for (const id of Object.keys(users)) {
        const userDiv = document.createElement("div");
        userDiv.className = "user-select-item";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `user_${id}`;
        checkbox.name = "user_checkbox";
        checkbox.value = id;
        const label = document.createElement("label");
        label.htmlFor = `user_${id}`;
        label.textContent = `${users[id].name} (#${id})`;
        userDiv.appendChild(checkbox);
        userDiv.appendChild(label);
        userSelectList.appendChild(userDiv);
      }
    });
    changeTab("addTemplate");
  });
  selectAllUsers.addEventListener("click", () => {
    const checkboxes = document.querySelectorAll('#userSelectList input[type="checkbox"]');
    if (checkboxes.length === 0) return;
    const allSelected = Array.from(checkboxes).every((cb) => cb.checked);
    const targetState = !allSelected;
    checkboxes.forEach((cb) => cb.checked = targetState);
  });
  var createToggleButton = (template, id, buttonsContainer, progressBarText, currentPercent) => {
    const button = document.createElement("button");
    button.className = template.running ? "destructive-button" : "primary-button";
    button.innerHTML = `<img src="icons/${template.running ? "pause" : "play"}.svg">${template.running ? "Stop" : "Start"}`;
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      const shouldBeRunning = !template.running;
      try {
        await axios.put(`/template/${id}`, { running: shouldBeRunning });
        template.running = shouldBeRunning;
        button.className = template.running ? "destructive-button" : "primary-button";
        button.innerHTML = `<img src="icons/${template.running ? "pause" : "play"}.svg">${template.running ? "Stop" : "Start"}`;
        const newStatus = template.running ? "Started" : "Stopped";
        progressBarText.textContent = `${currentPercent}% | ${newStatus}`;
        const progressBar = progressBarText.previousElementSibling;
        progressBar.classList.toggle("stopped", !template.running);
      } catch (error) {
        handleError(error);
      }
    });
    return button;
  };
  var updateTemplateStatus = async () => {
    try {
      const { data: templates } = await axios.get("/templates");
      for (const id in templates) {
        const t = templates[id];
        const templateElement = $(id);
        if (!templateElement) continue;
        const total = t.totalPixels || 1;
        const remaining = t.pixelsRemaining !== null ? t.pixelsRemaining : total;
        const completed = total - remaining;
        const percent = Math.floor(completed / total * 100);
        const progressBar = templateElement.querySelector(".progress-bar");
        const progressBarText = templateElement.querySelector(".progress-bar-text");
        const pixelCountSpan = templateElement.querySelector(".pixel-count");
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressBarText) progressBarText.textContent = `${percent}% | ${t.status}`;
        if (pixelCountSpan) pixelCountSpan.textContent = `${completed} / ${total}`;
        if (t.status === "Finished.") {
          progressBar.classList.add("finished");
          progressBar.classList.remove("stopped");
        } else if (!t.running) {
          progressBar.classList.add("stopped");
          progressBar.classList.remove("finished");
        } else {
          progressBar.classList.remove("stopped", "finished");
        }
      }
    } catch (error) {
      console.error("Failed to update template statuses:", error);
    }
  };
  var createTemplateCard = (t, id) => {
    const total = t.totalPixels || 1;
    const remaining = t.pixelsRemaining != null ? t.pixelsRemaining : total;
    const completed = total - remaining;
    const percent = Math.floor(completed / total * 100);
    const card = document.createElement("div");
    card.id = id;
    card.className = "template";
    const info = document.createElement("div");
    info.className = "template-info";
    info.innerHTML = `
        <span><b>Name:</b> <span class="template-data">${t.name}</span></span>
        <span><b>Pixels:</b> <span class="template-data pixel-count">${completed} / ${total}</span></span>
    `;
    card.appendChild(info);
    const pc = document.createElement("div");
    pc.className = "progress-bar-container";
    const pb = document.createElement("div");
    pb.className = "progress-bar";
    pb.style.width = `${percent}%`;
    const pbt = document.createElement("span");
    pbt.className = "progress-bar-text";
    pbt.textContent = `${percent}% | ${t.status}`;
    if (t.status === "Finished.") pb.classList.add("finished");
    else if (!t.running) pb.classList.add("stopped");
    pc.append(pb, pbt);
    card.appendChild(pc);
    const actions = document.createElement("div");
    actions.className = "template-actions";
    actions.appendChild(createToggleButton(t, id, actions, pbt, percent));
    const shareBtn = document.createElement("button");
    shareBtn.className = "secondary-button";
    shareBtn.innerHTML = '<img src="icons/open.svg">Share';
    shareBtn.addEventListener("click", async () => {
      if (!t.template.shareCode) {
        showMessage("Error", "No share code available for this template.");
        return;
      }
      await navigator.clipboard.writeText(t.template.shareCode);
      showMessage("Copied!", "Share code copied to clipboard.");
    });
    actions.appendChild(shareBtn);
    const editBtn = document.createElement("button");
    editBtn.className = "secondary-button";
    editBtn.innerHTML = '<img src="icons/settings.svg">Edit';
    editBtn.addEventListener("click", () => {
      openAddTemplate.click();
      templateFormTitle.textContent = `Edit Template: ${t.name}`;
      submitTemplate.innerHTML = '<img src="icons/edit.svg">Save Changes';
      templateForm.dataset.editId = id;
      templateName.value = t.name;
      [tx.value, ty.value, px.value, py.value] = t.coords;
      canBuyCharges.checked = t.canBuyCharges;
      canBuyMaxCharges.checked = t.canBuyMaxCharges;
      antiGriefMode.checked = t.antiGriefMode;
      eraseMode.checked = t.eraseMode;
      templateOutlineMode.checked = t.outlineMode;
      templateSkipPaintedPixels.checked = t.skipPaintedPixels;
      enableAutostart.checked = t.enableAutostart;
      currentTemplate = t.template;
      drawTemplate(t.template, templateCanvas);
      size.innerHTML = `${t.template.width}x${t.template.height}px`;
      ink.innerHTML = t.template.data.flat().filter((color) => color !== 0).length;
      templateCanvas.style.display = "block";
      details.style.display = "block";
      setTimeout(() => {
        document.querySelectorAll('input[name="user_checkbox"]').forEach((cb) => {
          cb.checked = t.userIds.includes(cb.value);
        });
        initializeGrid(id);
        if (t.template && t.template.data) {
          const uniqueColors = /* @__PURE__ */ new Set();
          for (let x = 0; x < t.template.width; x++) {
            for (let y = 0; y < t.template.height; y++) {
              const colorId = t.template.data[x][y];
              if (colorId !== 0) uniqueColors.add(colorId);
            }
          }
          availableColors.clear();
          uniqueColors.forEach((colorId) => availableColors.add(colorId));
          if (uniqueColors.size > 0) {
            updateColorGridForImage(Array.from(uniqueColors));
          }
        }
      }, 100);
    });
    actions.appendChild(editBtn);
    const delBtn = document.createElement("button");
    delBtn.className = "destructive-button";
    delBtn.innerHTML = '<img src="icons/remove.svg">Delete';
    delBtn.addEventListener("click", () => {
      showConfirmation("Delete Template", `Are you sure you want to delete "${t.name}"?`, async () => {
        try {
          await axios.delete(`/template/${id}`);
          openManageTemplates.click();
        } catch (e) {
          handleError(e);
        }
      }, true);
    });
    actions.appendChild(delBtn);
    card.appendChild(actions);
    const canvasContainer = document.createElement("div");
    canvasContainer.className = "template-canvas-preview";
    const canvas = document.createElement("canvas");
    canvasContainer.appendChild(canvas);
    card.appendChild(canvasContainer);
    drawTemplate(t.template, canvas);
    canvasContainer.style.display = showCanvasPreview ? "" : "none";
    setTimeout(() => {
      const topBar = document.querySelector(".template-actions-all");
      if (topBar && !topBar.querySelector("#canvasPreviewToggleBtn")) {
        const previewToggleBtn = document.createElement("button");
        previewToggleBtn.id = "canvasPreviewToggleBtn";
        previewToggleBtn.className = "secondary-button";
        previewToggleBtn.style.marginLeft = "10px";
        const updateBtnTextAndIcon = () => {
          previewToggleBtn.innerHTML = `<img src="icons/manageTemplates.svg" alt=""> ${showCanvasPreview ? "Disable" : "Enable"} Canvas Previews`;
        };
        updateBtnTextAndIcon();
        previewToggleBtn.addEventListener("click", () => {
          showCanvasPreview = !showCanvasPreview;
          updateBtnTextAndIcon();
          document.querySelectorAll(".template-canvas-preview").forEach((el) => {
            el.style.display = showCanvasPreview ? "" : "none";
          });
        });
        const importBtn = topBar.querySelector("button");
        if (importBtn) {
          topBar.insertBefore(previewToggleBtn, importBtn.lastChild.nextSibling);
        } else {
          topBar.appendChild(previewToggleBtn);
        }
      }
    }, 0);
    return card;
  };
  var importShareCode = false;
  openManageTemplates.addEventListener("click", () => {
    templateList.innerHTML = "";
    if (templateUpdateInterval) clearInterval(templateUpdateInterval);
    if (!importShareCode) {
      const topBar = document.createElement("div");
      topBar.className = "template-actions-all";
      const importBtnTop = document.createElement("button");
      importBtnTop.className = "secondary-button";
      importBtnTop.innerHTML = '<img src="icons/addTemplate.svg">Import Share Code';
      importBtnTop.style.marginBottom = "10px";
      importBtnTop.addEventListener("click", async () => {
        const code = prompt("Paste a share code:");
        if (!code) return;
        try {
          const genId = Date.now().toString();
          await axios.post("/templates/import", {
            id: genId,
            name: `Imported ${genId}`,
            coords: [0, 0, 0, 0],
            code
          });
          showMessage("Success", "Template imported successfully.");
          openManageTemplates.click();
        } catch (e) {
          handleError(e);
        }
      });
      topBar.appendChild(importBtnTop);
      templateList.before(topBar);
      importShareCode = true;
    }
    loadTemplates((templates) => {
      if (Object.keys(templates).length === 0) {
        templateList.innerHTML = "<span>No templates created yet.</span>";
        return;
      }
      for (const id in templates) {
        const card = createTemplateCard(templates[id], id);
        templateList.appendChild(card);
      }
      templateUpdateInterval = setInterval(updateTemplateStatus, 2e3);
    });
    changeTab("manageTemplates");
  });
  var loadAutoLoginProxyStatus = async () => {
    try {
      const { data } = await axios.get("/autologin/proxy-status");
      autologinProxyStats.textContent = `AUTO_LOGIN pool: ${data.available} available / ${data.occupied} occupied / ${data.total} total.`;
      if (!data.proxies || data.proxies.length === 0) {
        autologinProxyList.textContent = "No proxies in AUTO_LOGIN proxy DB yet.";
        return;
      }
      autologinProxyList.innerHTML = data.proxies.slice(0, 120).map((p) => `<div>[${p.status}] ${p.proxy}${p.account ? ` \u2014 ${p.account}` : ""}</div>`).join("");
    } catch (e) {
      autologinProxyStats.textContent = "Could not read AUTO_LOGIN proxy status.";
      autologinProxyList.textContent = "";
    }
  };
  var loadWebshareConfig = async () => {
    try {
      const { data } = await axios.get("/autologin/webshare-config");
      webshareApiKey.value = data.apiKey || "";
      webshareUsername.value = data.username || "";
      websharePassword.value = data.password || "";
    } catch (e) {
      webshareTestResult.textContent = `Error loading config: ${e?.message || e}`;
    }
  };
  openSettings.addEventListener("click", async () => {
    try {
      const response = await axios.get("/settings");
      const currentSettings = response.data;
      drawingDirectionSelect.value = currentSettings.drawingDirection;
      drawingOrderSelect.value = currentSettings.drawingOrder;
      pixelSkipSelect.value = currentSettings.pixelSkip;
      proxyEnabled.checked = currentSettings.proxyEnabled;
      proxyRotationMode.value = currentSettings.proxyRotationMode || "sequential";
      logProxyUsage.checked = currentSettings.logProxyUsage;
      proxyCount.textContent = `${currentSettings.proxyCount} proxies loaded from file.`;
      proxyFormContainer.style.display = proxyEnabled.checked ? "block" : "none";
      await loadAutoLoginProxyStatus();
      accountCooldown.value = currentSettings.accountCooldown / 1e3;
      purchaseCooldown.value = currentSettings.purchaseCooldown / 1e3;
      maxPixelsPerTurn.value = currentSettings.maxPixelsPerTurn ?? 0;
      readyChargeThreshold.value = currentSettings.readyChargeThreshold ?? 1;
      accountCheckCooldown.value = currentSettings.accountCheckCooldown / 1e3;
      dropletReserve.value = currentSettings.dropletReserve;
      antiGriefStandby.value = currentSettings.antiGriefStandby / 6e4;
      chargeThreshold.value = currentSettings.chargeThreshold * 100;
    } catch (error) {
      handleError(error);
    }
    changeTab("settings");
  });
  var saveSetting = async (setting) => {
    try {
      await axios.put("/settings", setting);
      showMessage("Success", "Setting saved!");
    } catch (error) {
      handleError(error);
    }
  };
  drawingDirectionSelect.addEventListener(
    "change",
    () => saveSetting({ drawingDirection: drawingDirectionSelect.value })
  );
  drawingOrderSelect.addEventListener("change", () => saveSetting({ drawingOrder: drawingOrderSelect.value }));
  pixelSkipSelect.addEventListener("change", () => saveSetting({ pixelSkip: parseInt(pixelSkipSelect.value, 10) }));
  proxyEnabled.addEventListener("change", () => {
    proxyFormContainer.style.display = proxyEnabled.checked ? "block" : "none";
    saveSetting({ proxyEnabled: proxyEnabled.checked });
  });
  logProxyUsage.addEventListener("change", () => {
    saveSetting({ logProxyUsage: logProxyUsage.checked });
  });
  proxyRotationMode.addEventListener("change", () => {
    saveSetting({ proxyRotationMode: proxyRotationMode.value });
  });
  var openWebshareModalHandler = async () => {
    webshareModal.classList.remove("hidden");
    webshareModal.style.display = "flex";
    webshareTestResult.textContent = "Load Webshare config...";
    await loadWebshareConfig();
    webshareTestResult.textContent = "";
  };
  openWebshareModalBtn?.addEventListener("click", openWebshareModalHandler);
  openWebshareModalMainBtn?.addEventListener("click", openWebshareModalHandler);
  closeWebshareModalBtn?.addEventListener("click", () => {
    webshareModal.classList.add("hidden");
    webshareModal.style.display = "none";
  });
  saveWebshareConfigBtn?.addEventListener("click", async () => {
    try {
      await axios.put("/autologin/webshare-config", {
        apiKey: webshareApiKey.value.trim(),
        username: webshareUsername.value.trim(),
        password: websharePassword.value
      });
      webshareTestResult.textContent = "Config saved.";
    } catch (e) {
      webshareTestResult.textContent = `Save failed: ${e?.response?.data?.error || e.message}`;
    }
  });
  testWebshareBtn?.addEventListener("click", async () => {
    webshareTestResult.textContent = "Testing API key...";
    try {
      const { data } = await axios.post("/autologin/webshare-test");
      webshareTestResult.textContent = `OK. Plan/Profile loaded: ${JSON.stringify(data.profile).slice(0, 140)}...`;
    } catch (e) {
      webshareTestResult.textContent = `Test failed: ${e?.response?.data?.error || e.message}`;
    }
  });
  syncWebshareProxiesBtn?.addEventListener("click", async () => {
    webshareTestResult.textContent = "Syncing proxies from Webshare...";
    try {
      const { data } = await axios.post("/autologin/webshare-sync-proxies");
      webshareTestResult.textContent = `Synced ${data.count} proxies.`;
      proxyCount.textContent = `${data.count} proxies loaded from file.`;
      await loadAutoLoginProxyStatus();
    } catch (e) {
      webshareTestResult.textContent = `Sync failed: ${e?.response?.data?.error || e.message}`;
    }
  });
  var preparePythonEnvHandler = async () => {
    try {
      showMessage("Info", "Preparing Python environment, this may take a bit...");
      const { data } = await axios.post("/autologin/prepare-python");
      showMessage("Success", `Python environment ready. ${data.output ? "Output captured." : ""}`);
    } catch (e) {
      showMessage("Error", e?.response?.data?.error || e.message);
    }
  };
  preparePythonEnvMainBtn?.addEventListener("click", preparePythonEnvHandler);
  reloadProxiesBtn.addEventListener("click", async () => {
    try {
      const response = await axios.post("/reload-proxies");
      if (response.data.success) {
        proxyCount.textContent = `${response.data.count} proxies reloaded from file.`;
        showMessage("Success", "Proxies reloaded successfully!");
        await loadAutoLoginProxyStatus();
      }
    } catch (error) {
      handleError(error);
    }
  });
  accountCooldown.addEventListener("change", () => {
    const value = parseInt(accountCooldown.value, 10) * 1e3;
    if (isNaN(value) || value < 0) {
      showMessage("Error", "Please enter a valid non-negative number.");
      return;
    }
    saveSetting({ accountCooldown: value });
  });
  purchaseCooldown.addEventListener("change", () => {
    const value = parseInt(purchaseCooldown.value, 10) * 1e3;
    if (isNaN(value) || value < 0) {
      showMessage("Error", "Please enter a valid non-negative number.");
      return;
    }
    saveSetting({ purchaseCooldown: value });
  });
  maxPixelsPerTurn.addEventListener("change", () => {
    const value = parseInt(maxPixelsPerTurn.value, 10);
    if (isNaN(value) || value < 0) {
      showMessage("Error", "Please enter a valid non-negative number. Use 0 for unlimited.");
      return;
    }
    saveSetting({ maxPixelsPerTurn: value });
  });
  readyChargeThreshold.addEventListener("change", () => {
    const value = parseInt(readyChargeThreshold.value, 10);
    if (isNaN(value) || value < 1) {
      showMessage("Error", "Please enter a number greater than or equal to 1.");
      return;
    }
    saveSetting({ readyChargeThreshold: value });
  });
  accountCheckCooldown.addEventListener("change", () => {
    const value = parseInt(accountCheckCooldown.value, 10) * 1e3;
    if (isNaN(value) || value < 0) {
      showMessage("Error", "Please enter a valid non-negative number.");
      return;
    }
    saveSetting({ accountCheckCooldown: value });
  });
  dropletReserve.addEventListener("change", () => {
    const value = parseInt(dropletReserve.value, 10);
    if (isNaN(value) || value < 0) {
      showMessage("Error", "Please enter a valid non-negative number.");
      return;
    }
    saveSetting({ dropletReserve: value });
  });
  antiGriefStandby.addEventListener("change", () => {
    const value = parseInt(antiGriefStandby.value, 10) * 6e4;
    if (isNaN(value) || value < 6e4) {
      showMessage("Error", "Please enter a valid number (at least 1 minute).");
      return;
    }
    saveSetting({ antiGriefStandby: value });
  });
  chargeThreshold.addEventListener("change", () => {
    const value = parseInt(chargeThreshold.value, 10);
    if (isNaN(value) || value < 0 || value > 100) {
      showMessage("Error", "Please enter a valid percentage between 0 and 100.");
      return;
    }
    saveSetting({ chargeThreshold: value / 100 });
  });
  tx.addEventListener("blur", () => {
    const value = tx.value.trim();
    const urlRegex = /pixel\/(\d+)\/(\d+)\?x=(\d+)&y=(\d+)/;
    const urlMatch = value.match(urlRegex);
    if (urlMatch) {
      tx.value = urlMatch[1];
      ty.value = urlMatch[2];
      px.value = urlMatch[3];
      py.value = urlMatch[4];
    } else {
      const parts = value.split(/\s+/);
      if (parts.length === 4) {
        tx.value = parts[0].replace(/[^0-9]/g, "");
        ty.value = parts[1].replace(/[^0-9]/g, "");
        px.value = parts[2].replace(/[^0-9]/g, "");
        py.value = parts[3].replace(/[^0-9]/g, "");
      } else {
        tx.value = value.replace(/[^0-9]/g, "");
      }
    }
  });
  [ty, px, py].forEach((input) => {
    input.addEventListener("blur", () => {
      input.value = input.value.replace(/[^0-9]/g, "");
    });
  });
  var colorGrid = document.getElementById("colorGrid");
  var currentTemplateId = null;
  var availableColors = /* @__PURE__ */ new Set();
  async function initializeGrid(templateId = null) {
    currentTemplateId = templateId;
    let colorEntries = Object.entries(colors);
    if (templateId) {
      try {
        const { colors: templateColors } = await (await fetch(`/template/${templateId}/colors`)).json();
        availableColors = new Set(templateColors.map((c) => c.id));
        colorEntries = templateColors.map((c) => [Object.keys(colors).find((rgb) => colors[rgb].id === c.id), colors[Object.keys(colors).find((rgb) => colors[rgb].id === c.id)]]).filter(([rgb]) => rgb);
      } catch {
        availableColors = new Set(Object.values(colors).map((c) => c.id));
      }
    } else {
      availableColors = new Set(Object.values(colors).map((c) => c.id));
    }
    await buildGrid(colorEntries, templateId);
  }
  async function buildGrid(colorEntries, templateId = null) {
    try {
      const { order = [] } = await (await fetch(templateId ? `/color-ordering?templateId=${templateId}` : `/color-ordering`)).json();
      const colorMap = new Map(colorEntries.map(([rgb, data]) => [data.id, { rgb, ...data }]));
      colorGrid.innerHTML = "";
      let priority = 1;
      order.forEach((id) => {
        const colorInfo = colorMap.get(id);
        if (colorInfo) {
          colorGrid.appendChild(createColorItem(colorInfo.rgb, colorInfo, priority++));
          colorMap.delete(id);
        }
      });
      [...colorMap.values()].sort((a, b) => a.id - b.id).forEach((colorInfo) => {
        colorGrid.appendChild(createColorItem(colorInfo.rgb, colorInfo, priority++));
      });
    } catch {
      colorEntries.sort((a, b) => a[1].id - b[1].id);
      colorGrid.innerHTML = "";
      colorEntries.forEach(([rgb, data], i) => colorGrid.appendChild(createColorItem(rgb, data, i + 1)));
    }
  }
  var createColorItem = (rgb, { id, name }, priority) => {
    const div = document.createElement("div");
    div.className = "color-item";
    div.draggable = true;
    Object.assign(div.dataset, { id, rgb, name });
    div.title = `ID ${id}: ${name} (${rgb})`;
    div.innerHTML = `<div class="color-swatch" style="background:rgb(${rgb})"></div><div class="color-info"><span class="priority-number">${priority}</span><span class="color-name">${name}</span></div>`;
    return div;
  };
  var draggedElement = null;
  colorGrid.addEventListener("mousedown", (e) => e.target.closest(".color-item")?.setAttribute("draggable", "true"));
  colorGrid.addEventListener("dragstart", (e) => {
    draggedElement = e.target.closest(".color-item");
    draggedElement?.classList.add("dragging");
  });
  colorGrid.addEventListener("dragover", (e) => {
    e.preventDefault();
    const item = e.target.closest(".color-item");
    [...colorGrid.children].forEach((el) => el.classList.toggle("drag-over", el === item && el !== draggedElement));
  });
  colorGrid.addEventListener("drop", (e) => {
    const dropTarget = e.target.closest(".color-item");
    if (dropTarget && dropTarget !== draggedElement && draggedElement) {
      const items = [...colorGrid.children];
      const [dragIdx, dropIdx] = [items.indexOf(draggedElement), items.indexOf(dropTarget)];
      colorGrid.insertBefore(draggedElement, dropIdx < dragIdx ? dropTarget : dropTarget.nextSibling);
      [...colorGrid.children].forEach((item, i) => item.querySelector(".priority-number").textContent = i + 1);
      if (currentTemplateId) saveColorOrder(currentTemplateId);
    }
  });
  colorGrid.addEventListener("dragend", () => {
    [...colorGrid.children].forEach((item) => item.classList.remove("dragging", "drag-over"));
    draggedElement = null;
  });
  var saveColorOrder = async (templateId = null) => {
    const order = [...colorGrid.children].map((el) => parseInt(el.dataset.id));
    const url = templateId ? `/color-ordering/template/${templateId}` : `/color-ordering/global`;
    try {
      return (await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order }) })).ok;
    } catch {
      return false;
    }
  };
  var resetOrder = () => buildGrid(Object.entries(colors).filter(([_, data]) => !currentTemplateId || availableColors.has(data.id)));
  var updateColorGridForImage = (imageColorIds) => {
    availableColors = new Set(imageColorIds);
    const imageColors = imageColorIds.map((id) => [Object.keys(colors).find((rgb) => colors[rgb].id === id), colors[Object.keys(colors).find((rgb) => colors[rgb].id === id)]]).filter(([rgb]) => rgb);
    buildGrid(imageColors);
  };
  if (languageSelect) {
    const savedLanguage = localStorage.getItem("uiLanguage") || "en";
    languageSelect.value = savedLanguage;
    applyLanguage(savedLanguage);
    languageSelect.addEventListener("change", (e) => {
      const nextLang = e.target.value === "es" ? "es" : "en";
      applyLanguage(nextLang);
      applyTheme(localStorage.getItem("uiTheme") || "dark");
    });
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }
  applyTheme(localStorage.getItem("uiTheme") || "dark");
  changeTab("main");
})();
