/**
 * FILE: static/js/main.js
 * VERSION: 1.0.0
 * START_MODULE_CONTRACT:
 * PURPOSE: Application entry point, initialization of all modules and DOM listeners.
 * SCOPE: Application launch, initial load management, registration of global handlers.
 * INPUT: Global DOM context, functions from other modules (state, ui, chart).
 * OUTPUT: Launched and ready-to-use web application.
 * KEYWORDS: DOMAIN(Application): Main; CONCEPT(Initialization): Bootstrap; TECH(DOM): EventDelegation
 * END_MODULE_CONTRACT
 */

/**
 * START_CHANGE_SUMMARY:
 * LAST_CHANGE: [v1.1.0 - Initialization of profiles and themes at startup. Adding profile management to DOM.]
 * PREV_CHANGE_SUMMARY: [v1.0.0 - Application initialization, combining all functional modules.]
 * END_CHANGE_SUMMARY
 */

/**
 * START_MODULE_MAP:
 * FUNC [10][Main initialization function] => init
 * END_MODULE_MAP
 */

// START_FUNCTION_init
/**
 * START_CONTRACT:
 * PURPOSE: Starts the initialization process: loads state, renders UI, registers listeners.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Modifies DOM (adds elements, listeners), starts Chart.js.
 * END_CONTRACT
 */
function init() {
    console.log("[Main][IMP:9][init][START_BOOTSTRAP] Application initialization started [INFO]");
    
    // START_BLOCK_THEME_INIT: [Theme initialization]
    if (window.applyStoredTheme) {
        window.applyStoredTheme();
    }
    // END_BLOCK_THEME_INIT

    // START_BLOCK_STATE_LOAD: [Loading profiles and data]
    if (window.initProfiles) {
        window.initProfiles();
    }
    // END_BLOCK_STATE_LOAD

    // START_BLOCK_UI_INIT: [Rendering initial interface]
    const listEl = document.getElementById('categories-list');
    if (window.createCategoryElement) {
        window.categories.forEach(cat => listEl.appendChild(window.createCategoryElement(cat)));
    }
    if (window.renderProfileSelector) {
        window.renderProfileSelector();
    }
    // END_BLOCK_UI_INIT

    // START_BLOCK_CHART_BOOT: [Starting graphics engine]
    if (window.initChart) {
        window.initChart();
    }
    if (window.updateApp) {
        window.updateApp();
    }
    window.isAppLoaded = true;
    console.log("[Main][IMP:9][init][APP_LOADED] Application load flag set to true [SUCCESS]");
    // END_BLOCK_CHART_BOOT

    // START_BLOCK_EVENT_LISTENERS: [Registration of global event listeners]
    const totalInput = document.getElementById('total-input');
    const currencySelect = document.getElementById('currency-select');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const chartTypeSelect = document.getElementById('chart-type-select');
    const addBtn = document.getElementById('add-btn');

    if (totalInput) {
        totalInput.addEventListener('input', window.updateApp);
        
        // Initialization of custom +/- buttons for total sum
        if (window.setupCustomNumberInput) {
            window.setupCustomNumberInput(totalInput, window.updateApp);
        }

        totalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstCatName = listEl.querySelector('.cat-name');
                if (firstCatName) firstCatName.focus();
            }
        });
    }

    if (currencySelect) {
        currencySelect.addEventListener('change', window.updateApp);
    }

    if (themeToggleBtn && window.toggleTheme) {
        themeToggleBtn.addEventListener('click', window.toggleTheme);
    }

    if (copyLinkBtn && window.copyLinkToClipboard) {
        copyLinkBtn.addEventListener('click', window.copyLinkToClipboard);
    }

    if (chartTypeSelect) {
        chartTypeSelect.addEventListener('change', () => {
            window.isAppLoaded = false; 
            if (window.initChart) window.initChart();
            if (window.updateApp) window.updateApp();
            window.isAppLoaded = true;
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (window.getRandomColor && window.createCategoryElement && window.updateApp) {
                const newCat = { id: Date.now(), name: '', amount: 0, color: window.getRandomColor() };
                window.categories.push(newCat);
                const newElement = window.createCategoryElement(newCat);
                listEl.appendChild(newElement);
                window.updateApp();
                
                newElement.scrollIntoView({ behavior: 'smooth' });
                newElement.querySelector('.cat-name').focus();
                console.log("[Main][IMP:7][add-btn][CLICK] New category added [SUCCESS]");
            }
        });
    }
    // END_BLOCK_EVENT_LISTENERS

    console.log("[Main][IMP:9][init][BOOTSTRAP_COMPLETE] Initialization completed successfully [SUCCESS]");
}
// END_FUNCTION_init

// START_BLOCK_LAUNCH: [Application launch on DOMContentLoaded event]
document.addEventListener('DOMContentLoaded', init);
// END_BLOCK_LAUNCH
