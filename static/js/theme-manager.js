/**
 * FILE: static/js/theme-manager.js
 * VERSION: 1.1.1
 * START_MODULE_CONTRACT:
 * PURPOSE: Theme switching and clipboard link management.
 * SCOPE: DOM theme attribute management, clipboard interaction.
 * INPUT: Theme toggle and copy button click events.
 * OUTPUT: data-theme change on <html>, copy status in UI.
 * KEYWORDS: DOMAIN(UI): Theme; TECH(Storage): localStorage; CONCEPT(UX): ClipboardFeedback
 * END_MODULE_CONTRACT
 */

// START_CHANGE_SUMMARY:
// LAST_CHANGE: [v1.1.1 - Fixed syntax errors by using // for START_BLOCK/END_BLOCK tags in JS.]
// PREV_CHANGE_SUMMARY: [v1.1.0 - Translated UI strings to English and updated currency symbol to $.]
// END_CHANGE_SUMMARY

// START_MODULE_MAP:
// FUNC [8][Theme switching] => toggleTheme
// FUNC [8][Apply theme on load] => applyStoredTheme
// FUNC [9][Copy link to clipboard] => copyLinkToClipboard
// END_MODULE_MAP

// START_FUNCTION_applyStoredTheme
// START_CONTRACT:
// PURPOSE: Applies theme from LocalStorage or browser settings during initialization.
// INPUTS: None
// OUTPUTS: None
// SIDE_EFFECTS: Changes data-theme on <html>, updates #theme-toggle text.
// END_CONTRACT
function applyStoredTheme() {
    const root = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const theme = window.StorageManager.getTheme();
    
    // START_BLOCK_APPLY_THEME: [Applying theme]
    root.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    console.log(`[Theme][IMP:8][applyStoredTheme] Theme '${theme}' applied. [SUCCESS]`);
    // END_BLOCK_APPLY_THEME
}
// END_FUNCTION_applyStoredTheme

// START_FUNCTION_toggleTheme
/**
 * START_CONTRACT:
 * PURPOSE: Toggles theme between 'light' and 'dark'. Updates button icon and saves to LocalStorage.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Changes data-theme on <html>, updates #theme-toggle text, writes to LocalStorage.
 * END_CONTRACT
 */
function toggleTheme() {
    const root = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // START_BLOCK_UPDATE_THEME: [Switching attribute and saving]
    root.setAttribute('data-theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    window.StorageManager.setTheme(newTheme);
    console.log(`[Theme][IMP:9][toggleTheme] Theme switched to '${newTheme}' and saved. [SUCCESS]`);
    // END_BLOCK_UPDATE_THEME
    
    // START_BLOCK_SYNC_CHART: [Chart color synchronization]
    if (window.updateApp) window.updateApp(); 
    // END_BLOCK_SYNC_CHART
}
// END_FUNCTION_toggleTheme

// START_FUNCTION_copyLinkToClipboard
/**
 * START_CONTRACT:
 * PURPOSE: Copies current URL with state hash to clipboard. Shows temporary success status.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Reads window.location.href, writes to navigator.clipboard.
 * END_CONTRACT
 */
function copyLinkToClipboard() {
    const copyBtn = document.getElementById('copy-link-btn');
    const copyText = document.getElementById('copy-link-text');
    
    // START_BLOCK_GENERATE_STATEFUL_URL: [Generating URL with current state without changing address bar]
    // We generate the state hash and add it to the base URL manually for copying.
    // This allows sharing current data without "polluting" the user's address bar.
    let shareURL = window.location.origin + window.location.pathname + window.location.search;
    if (window.getStateAsURLHash) {
        shareURL += window.getStateAsURLHash();
    }
    // END_BLOCK_GENERATE_STATEFUL_URL
    
    // START_BLOCK_COPY_PROCESS: [Copy operation]
    console.log(`[Theme][IMP:7][copyLinkToClipboard][START_COPY] Initiating link copy: ${shareURL.length} chars`);
    
    navigator.clipboard.writeText(shareURL).then(() => {
        // START_BLOCK_UI_FEEDBACK: [Success indication]
        copyBtn.classList.add('copied');
        copyText.textContent = 'Copied!';
        console.log(`[Theme][IMP:8][copyLinkToClipboard][SUCCESS] Link copied successfully`);
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyText.textContent = 'Share';
            console.log(`[Theme][IMP:6][copyLinkToClipboard][RESET] Button status reset`);
        }, 2000);
        // END_BLOCK_UI_FEEDBACK
    }).catch(err => {
        console.error(`[Theme][IMP:10][copyLinkToClipboard][ERROR] Copy error: ${err.message}`);
        alert('Failed to copy link. Please copy it manually from the address bar.');
    });
    // END_BLOCK_COPY_PROCESS
}
// END_FUNCTION_copyLinkToClipboard

window.toggleTheme = toggleTheme;
window.applyStoredTheme = applyStoredTheme;
window.copyLinkToClipboard = copyLinkToClipboard;
