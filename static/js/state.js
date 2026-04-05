/**
 * FILE: static/js/state.js
 * VERSION: 1.1.1
 * START_MODULE_CONTRACT:
 * PURPOSE: Global application state management and URL synchronization.
 * SCOPE: Budget data, categories, and chart settings storage.
 * INPUT: User input (via UI), URL hash data.
 * OUTPUT: State object, serialization/deserialization methods.
 * KEYWORDS: DOMAIN(Logic): StateManagement; CONCEPT(Persistence): URLHash; TECH(Encoding): Base64
 * END_MODULE_CONTRACT
 */

// START_CHANGE_SUMMARY:
// LAST_CHANGE: [v1.1.1 - Translated to English, replaced ₽ with $, updated default profile names.]
// PREV_CHANGE_SUMMARY: [v1.1.0 - Profile system implementation. LocalStorage sync instead of URL by default. URL import for sharing.]
// END_CHANGE_SUMMARY

// START_MODULE_MAP:
// VAR [10][Global total amount] => totalAmount
// VAR [10][Categories list] => categories
// VAR [5][App loading flag] => isAppLoaded
// VAR [9][Profiles list] => profiles
// VAR [9][Current profile ID] => currentProfileId
// FUNC [8][Save state to URL] => saveStateToURL
// FUNC [8][Load state from URL] => loadStateFromURL
// FUNC [9][Initialize profiles] => initProfiles
// FUNC [8][Save current profile] => saveCurrentProfile
// FUNC [8][Switch profile] => switchProfile
// FUNC [7][Create profile] => createProfile
// END_MODULE_MAP

// Global state variables
window.totalAmount = 100000;
window.currency = '$';
window.categories = [];
window.profiles = [];
window.currentProfileId = null;
window.isAppLoaded = false;

// START_FUNCTION_initProfiles
// START_CONTRACT:
// PURPOSE: Loads profiles from LocalStorage, handles URL import.
// INPUTS: None
// OUTPUTS: None
// SIDE_EFFECTS: Updates window.profiles, window.currentProfileId, triggers data loading.
// END_CONTRACT
function initProfiles() {
    window.profiles = window.StorageManager.getProfiles();
    window.currentProfileId = window.StorageManager.getCurrentProfileId();

    // START_BLOCK_URL_IMPORT: [URL Import (Sharing)]
    const sharedState = loadStateFromURL();
    if (sharedState) {
        console.log("[State][IMP:9][initProfiles][IMPORT] Shared access via URL detected. Importing into new profile. [INFO]");
        const newProfile = createProfile(`Import from ${new Date().toLocaleDateString()}`, sharedState);
        window.currentProfileId = newProfile.id;
        window.StorageManager.setCurrentProfileId(window.currentProfileId);
        // Clear hash to avoid duplicate creation on reload
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    // END_BLOCK_URL_IMPORT

    // START_BLOCK_DEFAULT_PROFILE: [Create default profile if none exist]
    if (window.profiles.length === 0) {
        createProfile("Main Plan", {
            t: 100000,
            cur: '$',
            c: "doughnut",
            items: [
                { n: 'Housing', a: 30000, col: '#818cf8' },
                { n: 'Food', a: 40023, col: '#34d399' },
                { n: 'Savings', a: 15000, col: '#f472b6' }
            ]
        });
    }
    // END_BLOCK_DEFAULT_PROFILE

    if (!window.currentProfileId || !window.profiles.find(p => p.id === window.currentProfileId)) {
        window.currentProfileId = window.profiles[0].id;
        window.StorageManager.setCurrentProfileId(window.currentProfileId);
    }

    applyProfile(window.currentProfileId);
}
// END_FUNCTION_initProfiles

// START_FUNCTION_applyProfile
// START_CONTRACT:
// PURPOSE: Applies profile data to global state and UI.
// INPUTS: 
// - string => id: Profile ID
// OUTPUTS: None
// SIDE_EFFECTS: Updates window.totalAmount, window.categories, DOM elements.
// END_CONTRACT
function applyProfile(id) {
    const profile = window.profiles.find(p => p.id === id);
    if (!profile) return;

    window.totalAmount = profile.data.t;
    window.currency = profile.data.cur || '$';
    window.categories = profile.data.items.map((item, idx) => ({
        id: Date.now() + idx,
        name: item.n,
        amount: item.a,
        color: item.col
    }));

    const totalInput = document.getElementById('total-input');
    const chartTypeSelect = document.getElementById('chart-type-select');
    const currencySelect = document.getElementById('currency-select');
    if (totalInput) totalInput.value = window.totalAmount;
    if (chartTypeSelect) chartTypeSelect.value = profile.data.c;
    if (currencySelect) currencySelect.value = window.currency;

    console.log(`[State][IMP:8][applyProfile] Profile '${profile.name}' applied. [SUCCESS]`);
}
// END_FUNCTION_applyProfile

// START_FUNCTION_saveCurrentProfile
// START_CONTRACT:
// PURPOSE: Saves current state to active profile in LocalStorage.
// INPUTS: None
// OUTPUTS: None
// SIDE_EFFECTS: Updates window.profiles and LocalStorage.
// END_CONTRACT
function saveCurrentProfile() {
    if (!window.currentProfileId) return;

    const totalInput = document.getElementById('total-input');
    const chartTypeSelect = document.getElementById('chart-type-select');
    const currencySelect = document.getElementById('currency-select');

    const profileIndex = window.profiles.findIndex(p => p.id === window.currentProfileId);
    if (profileIndex === -1) return;

    window.profiles[profileIndex].data = {
        t: Number(totalInput.value),
        cur: currencySelect ? currencySelect.value : window.currency,
        c: chartTypeSelect.value,
        items: window.categories.map(cat => ({
            n: cat.name,
            a: cat.amount,
            col: cat.color
        }))
    };

    window.StorageManager.saveProfiles(window.profiles);
    console.log(`[State][IMP:7][saveCurrentProfile] State saved to profile '${window.profiles[profileIndex].name}'. [SUCCESS]`);
}
// END_FUNCTION_saveCurrentProfile

// START_FUNCTION_createProfile
// START_CONTRACT:
// PURPOSE: Creates a new profile with specified name and data.
// INPUTS: 
// - string => name: Profile name
// - object => data: Profile data (optional)
// OUTPUTS: 
// - object - Created profile
// END_CONTRACT
function createProfile(name, data = null) {
    const newProfile = {
        id: 'prof_' + Date.now(),
        name: name,
        data: data || {
            t: 0,
            cur: '$',
            c: "doughnut",
            items: []
        }
    };
    window.profiles.push(newProfile);
    window.StorageManager.saveProfiles(window.profiles);
    return newProfile;
}
// END_FUNCTION_createProfile

// START_FUNCTION_switchProfile
// START_CONTRACT:
// PURPOSE: Switches active profile and reloads UI.
// INPUTS: 
// - string => id: Profile ID
// OUTPUTS: None
// END_CONTRACT
function switchProfile(id) {
    window.currentProfileId = id;
    window.StorageManager.setCurrentProfileId(id);
    
    // UI Reload (simplified via reload or clearing)
    window.location.reload(); 
}
// END_FUNCTION_switchProfile

// START_FUNCTION_getStateAsURLHash
/**
 * START_CONTRACT:
 * PURPOSE: Serializes current state to JSON, encodes to Base64 for URL hash usage.
 * INPUTS: None (uses global variables and DOM elements)
 * OUTPUTS: 
 * - string - Encoded state hash
 * END_CONTRACT
 */
function getStateAsURLHash() {
    const totalInput = document.getElementById('total-input');
    const chartTypeSelect = document.getElementById('chart-type-select');
    const currencySelect = document.getElementById('currency-select');
    
    // START_BLOCK_SERIALIZE: [State object formation]
    const state = {
        t: Number(totalInput.value),
        cur: currencySelect ? currencySelect.value : window.currency,
        c: chartTypeSelect.value,
        items: window.categories.map(cat => ({
            n: cat.name,
            a: cat.amount,
            col: cat.color
        }))
    };
    // END_BLOCK_SERIALIZE
    
    // START_BLOCK_ENCODE: [Base64 encoding]
    const jsonStr = JSON.stringify(state);
    const encoded = btoa(encodeURIComponent(jsonStr));
    // END_BLOCK_ENCODE
    
    console.log(`[State][IMP:7][getStateAsURLHash][GENERATE] State hash generated. [SUCCESS]`);
    return '#' + encoded;
}
// END_FUNCTION_getStateAsURLHash

// START_FUNCTION_saveStateToURL
/**
 * START_CONTRACT:
 * PURPOSE: Updates current page URL hash.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Modifies window.location.hash
 * END_CONTRACT
 */
function saveStateToURL() {
    const hash = getStateAsURLHash();
    
    // START_BLOCK_UPDATE_URL: [URL hash update]
    window.history.replaceState(null, null, hash);
    console.log(`[State][IMP:7][saveStateToURL][UPDATE_URL] State saved to address bar. [SUCCESS]`);
    // END_BLOCK_UPDATE_URL
}
// END_FUNCTION_saveStateToURL

// START_FUNCTION_loadStateFromURL
/**
 * START_CONTRACT:
 * PURPOSE: Loads and decodes state from URL hash without applying to UI.
 * INPUTS: None
 * OUTPUTS: 
 * - object|null - State object or null
 * END_CONTRACT
 */
function loadStateFromURL() {
    const hash = window.location.hash.substring(1);
    if (!hash) return null;

    try {
        const decoded = decodeURIComponent(atob(hash));
        return JSON.parse(decoded);
    } catch (e) {
        console.error("[State][IMP:10][loadStateFromURL][DECODE] Failed to read data from URL", e);
        return null;
    }
}
// END_FUNCTION_loadStateFromURL

window.saveStateToURL = saveStateToURL;
window.getStateAsURLHash = getStateAsURLHash;
window.loadStateFromURL = loadStateFromURL;
window.initProfiles = initProfiles;
window.saveCurrentProfile = saveCurrentProfile;
window.switchProfile = switchProfile;
window.createProfile = createProfile;
