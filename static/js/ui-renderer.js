/**
 * FILE: static/js/ui-renderer.js
 * VERSION: 1.1.1
 * START_MODULE_CONTRACT:
 * PURPOSE: Rendering of dynamic UI elements: category list and legend.
 * SCOPE: Management of category DOM elements, input event handlers.
 * INPUT: Category data, Chart.js configuration (for legend).
 * OUTPUT: HTML elements, DOM nodes in the list container.
 * KEYWORDS: DOMAIN(UI): Rendering; CONCEPT(Components): DOMCreation; TECH(Events): InputHandlers
 * END_MODULE_CONTRACT
 */

// START_CHANGE_SUMMARY:
// LAST_CHANGE: [v1.1.1 - Translated UI strings to English and changed currency symbol to $.]
// PREV_CHANGE_SUMMARY: [v1.1.0 - Adding renderProfileSelector function for profile management in UI.]
// END_CHANGE_SUMMARY

// START_MODULE_MAP:
// FUNC [9][Creating a category element] => createCategoryElement
// FUNC [8][Generating chart legend] => generateLegend
// FUNC [8][Rendering profile list] => renderProfileSelector
// END_MODULE_MAP

// START_BLOCK_PALETTE: [List of preset "soft" colors]
const COLOR_PALETTE = [
    '#818cf8', '#6366f1', '#4f46e5', '#34d399', 
    '#10b981', '#059669', '#f472b6', '#db2777', 
    '#fbbf24', '#f59e0b', '#fb7185', '#e11d48',
    '#60a5fa', '#3b82f6', '#2dd4bf', '#0d9488'
];
// END_BLOCK_PALETTE

// START_FUNCTION_showModal
/**
 * START_CONTRACT:
 * PURPOSE: Displays a custom modal window (replacement for prompt/confirm).
 * INPUTS: 
 * - string => title: Title
 * - string => type: 'prompt' | 'confirm'
 * - string => defaultValue: Default value for prompt
 * OUTPUTS: 
 * - Promise<string | boolean | null>
 * END_CONTRACT
 */
function showModal(title, type = 'prompt', defaultValue = '', text = '') {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-container');
        const titleEl = document.getElementById('modal-title');
        const inputEl = document.getElementById('modal-input');
        const textEl = document.getElementById('modal-text');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');

        titleEl.textContent = title;
        textEl.textContent = text;
        textEl.style.display = text ? 'block' : 'none';
        
        if (type === 'prompt') {
            inputEl.style.display = 'block';
            inputEl.value = defaultValue;
            setTimeout(() => inputEl.focus(), 10);
            
            inputEl.onkeydown = (e) => {
                if (e.key === 'Enter') confirmBtn.click();
                if (e.key === 'Escape') cancelBtn.click();
            };
        } else {
            inputEl.style.display = 'none';
        }

        overlay.classList.add('active');

        const cleanup = () => {
            overlay.classList.remove('active');
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
        };

        confirmBtn.onclick = () => {
            const val = type === 'prompt' ? inputEl.value : true;
            cleanup();
            resolve(val);
        };
        cancelBtn.onclick = () => {
            cleanup();
            resolve(null);
        };
    });
}
// END_FUNCTION_showModal

// START_FUNCTION_getRandomColor
/**
 * START_CONTRACT:
 * PURPOSE: Returns a random color from the palette.
 * END_CONTRACT
 */
function getRandomColor() {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
}
// END_FUNCTION_getRandomColor

// START_FUNCTION_createCustomNumberInput
/**
 * START_CONTRACT:
 * PURPOSE: Creates a wrapper for numeric input with +/- buttons.
 * INPUTS: 
 * - HTMLInputElement => input: Original input
 * - function => onUpdate: Callback on change
 * END_CONTRACT
 */
function setupCustomNumberInput(input, onUpdate) {
    const container = input.closest('.custom-number-input');
    if (!container) return;

    const minusBtn = container.querySelector('.minus-btn');
    const plusBtn = container.querySelector('.plus-btn');

    let timer = null;
    let repeatTimer = null;
    let currentStep = 100;
    let ticks = 0;

    const startChange = (direction) => {
        stopChange(); // Reset previous just in case
        
        const update = () => {
            const val = Number(input.value) || 0;
            input.value = direction > 0 ? val + currentStep : Math.max(0, val - currentStep);
            onUpdate();
            
            ticks++;
            // Increase step every 3 ticks after initial delay
            if (ticks > 5 && ticks % 3 === 0) {
                currentStep = Math.min(currentStep * 1.5, 100000); // Limit max step to 100k
                currentStep = Math.round(currentStep / 100) * 100;
            }
        };

        update();

        timer = setTimeout(() => {
            repeatTimer = setInterval(update, 100);
        }, 500);
    };

    const stopChange = () => {
        clearTimeout(timer);
        clearInterval(repeatTimer);
        timer = null;
        repeatTimer = null;
        currentStep = 100;
        ticks = 0;
    };

    // Handling for minus
    minusBtn.onmousedown = (e) => { e.preventDefault(); startChange(-1); };
    minusBtn.onmouseup = stopChange;
    minusBtn.onmouseleave = stopChange;
    minusBtn.ontouchstart = (e) => { e.preventDefault(); startChange(-1); };
    minusBtn.ontouchend = stopChange;
    minusBtn.ontouchcancel = stopChange;

    // Handling for plus
    plusBtn.onmousedown = (e) => { e.preventDefault(); startChange(1); };
    plusBtn.onmouseup = stopChange;
    plusBtn.onmouseleave = stopChange;
    plusBtn.ontouchstart = (e) => { e.preventDefault(); startChange(1); };
    plusBtn.ontouchend = stopChange;
    plusBtn.ontouchcancel = stopChange;
}
// END_FUNCTION_createCustomNumberInput

// START_FUNCTION_createColorPicker
/**
 * START_CONTRACT:
 * PURPOSE: Creates a custom color picker.
 * INPUTS: 
 * - string => initialColor: Initial color
 * - function => onChange: Callback on selection
 * END_CONTRACT
 */
function createColorPicker(initialColor, onChange) {
    const container = document.createElement('div');
    container.className = 'color-picker-container';
    
    container.innerHTML = `
        <div class="color-badge" style="background-color: ${initialColor}"></div>
        <div class="color-palette">
            ${COLOR_PALETTE.map(c => `<div class="palette-color" style="background-color: ${c}" data-color="${c}"></div>`).join('')}
        </div>
    `;

    const badge = container.querySelector('.color-badge');
    const palette = container.querySelector('.color-palette');

    badge.onclick = (e) => {
        e.stopPropagation();
        palette.classList.toggle('active');
        
        const closePalette = () => {
            palette.classList.remove('active');
            document.removeEventListener('click', closePalette);
        };
        document.addEventListener('click', closePalette);
    };

    container.querySelectorAll('.palette-color').forEach(el => {
        el.onclick = () => {
            const color = el.dataset.color;
            badge.style.backgroundColor = color;
            onChange(color);
        };
    });

    return container;
}
// END_FUNCTION_createColorPicker

/**
 * START_CONTRACT:
 * PURPOSE: Renders a custom profile management menu.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Updates #profile-manager-root.
 * END_CONTRACT
 */
function renderProfileSelector() {
    console.log("[UI][IMP:7][renderProfileSelector] Rendering profile selector");
    const root = document.getElementById('profile-manager-root');
    if (!root) {
        console.error("[UI][IMP:10][renderProfileSelector] #profile-manager-root not found");
        return;
    }

    const currentProf = window.profiles.find(p => p.id === window.currentProfileId);
    
    // START_BLOCK_RENDER: [HTML Generation]
    root.innerHTML = `
        <div class="profile-manager-menu">
            <select id="profile-select" class="profile-select" title="Select Profile">
                ${window.profiles.map(p => `<option value="${p.id}" ${p.id === window.currentProfileId ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
            <button class="profile-dots-btn" title="Manage Profile">⋮</button>
            <div class="profile-actions-dropdown">
                <div class="profile-action-item" id="prof-add"><span>➕</span> Create New</div>
                <div class="profile-action-item" id="prof-rename"><span>✏️</span> Rename</div>
                <div class="profile-action-item danger" id="prof-delete"><span>🗑️</span> Delete Current</div>
            </div>
        </div>
    `;
    // END_BLOCK_RENDER

    // START_BLOCK_EVENTS: [Event Setup]
    const select = root.querySelector('#profile-select');
    const dotsBtn = root.querySelector('.profile-dots-btn');
    const dropdown = root.querySelector('.profile-actions-dropdown');

    if (!select) return;

    select.onchange = (e) => window.switchProfile(e.target.value);

    dotsBtn.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        const close = () => { dropdown.classList.remove('active'); document.removeEventListener('click', close); };
        document.addEventListener('click', close);
    };

    root.querySelector('#prof-add').onclick = async () => {
        const name = await showModal('New Profile', 'prompt', `Plan ${window.profiles.length + 1}`);
        if (name) {
            const newProf = window.createProfile(name);
            window.switchProfile(newProf.id);
        }
    };

    root.querySelector('#prof-rename').onclick = async () => {
        if (!currentProf) return;
        const newName = await showModal('Rename Profile', 'prompt', currentProf.name);
        if (newName && newName !== currentProf.name) {
            currentProf.name = newName;
            window.StorageManager.saveProfiles(window.profiles);
            renderProfileSelector();
        }
    };

    root.querySelector('#prof-delete').onclick = async () => {
        if (window.profiles.length <= 1) {
            alert('Cannot delete the only profile!');
            return;
        }
        const confirmed = await showModal('Delete', 'confirm', '', `Delete profile "${currentProf.name}"?`);
        if (confirmed) {
            window.profiles = window.profiles.filter(p => p.id !== window.currentProfileId);
            window.StorageManager.saveProfiles(window.profiles);
            window.switchProfile(window.profiles[0].id);
        }
    };
    // END_BLOCK_EVENTS
}
// END_FUNCTION_renderProfileSelector

// START_FUNCTION_createCategoryElement
/**
 * START_CONTRACT:
 * PURPOSE: Creates a DOM node for a single category with input fields and a slider.
 * INPUTS: 
 * - object - cat: {id, name, amount, color}
 * OUTPUTS: 
 * - HTMLElement - Container .category-item
 * SIDE_EFFECTS: Attaches event handlers (input, keydown, click).
 * END_CONTRACT
 */
function createCategoryElement(cat) {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.innerHTML = `
        <div class="cat-top">
            <div class="cat-color-wrapper"></div>
            <input type="text" class="cat-name" value="${cat.name}" placeholder="Name">
            <div class="custom-number-input">
                <button class="num-btn minus-btn">−</button>
                <input type="number" class="cat-amount" value="${cat.amount}" min="0" step="1000">
                <button class="num-btn plus-btn">+</button>
            </div>
            <button class="cat-delete" title="Delete">✕</button>
        </div>
        <input type="range" class="cat-slider" value="${cat.amount}" min="0" max="${window.totalAmount}">
    `;

    // START_BLOCK_ELEMENT_REFS: [Getting references to child elements]
    const colorWrapper = div.querySelector('.cat-color-wrapper');
    const nameIn = div.querySelector('.cat-name');
    const amountIn = div.querySelector('.cat-amount');
    const sliderIn = div.querySelector('.cat-slider');
    const deleteBtn = div.querySelector('.cat-delete');
    // END_BLOCK_ELEMENT_REFS

    const updateSliderFill = () => {
        const percentage = (sliderIn.value / sliderIn.max) * 100;
        sliderIn.style.background = `linear-gradient(to right, var(--primary) ${percentage}%, #2A2F3E ${percentage}%)`;
    };

    // START_BLOCK_CUSTOM_COMPONENTS: [Initializing custom components]
    const picker = createColorPicker(cat.color, (newColor) => {
        cat.color = newColor;
        window.updateApp();
    });
    colorWrapper.appendChild(picker);

    setupCustomNumberInput(amountIn, () => {
        cat.amount = Number(amountIn.value);
        sliderIn.value = cat.amount;
        updateSliderFill();
        window.updateApp();
    });
    // END_BLOCK_CUSTOM_COMPONENTS

    // START_BLOCK_EVENT_HANDLERS: [Setting up event handlers]
    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('add-btn').click();
        }
    };

    nameIn.addEventListener('keydown', handleEnterKey);
    amountIn.addEventListener('keydown', handleEnterKey);

    nameIn.addEventListener('input', (e) => { cat.name = e.target.value; window.updateApp(); });
    
    amountIn.addEventListener('input', (e) => {
        let val = Math.max(0, Number(e.target.value));
        cat.amount = val;
        sliderIn.value = val;
        updateSliderFill();
        window.updateApp();
    });

    sliderIn.addEventListener('input', (e) => {
        let val = Number(e.target.value);
        cat.amount = val;
        amountIn.value = val;
        updateSliderFill();
        window.updateApp();
    });

    // Initial fill
    setTimeout(updateSliderFill, 0);
    
    // Attach to element for global updates
    sliderIn.updateFill = updateSliderFill;

    deleteBtn.addEventListener('click', () => {
        window.categories = window.categories.filter(c => c.id !== cat.id);
        div.remove();
        window.updateApp();
    });
    // END_BLOCK_EVENT_HANDLERS

    return div;
}
// END_FUNCTION_createCategoryElement

// START_FUNCTION_generateLegend
/**
 * START_CONTRACT:
 * PURPOSE: Dynamically redraws the legend below the chart.
 * INPUTS: 
 * - object - data: Chart.js data object (labels, datasets)
 * OUTPUTS: None
 * SIDE_EFFECTS: Clears and fills #custom-legend
 * END_CONTRACT
 */
function generateLegend(data) {
    const legendEl = document.getElementById('custom-legend');
    if (!legendEl) return;
    
    legendEl.innerHTML = '';
    const chartType = document.getElementById('chart-type-select').value;

    // START_BLOCK_FILL_LEGEND: [Generating HTML for legend items]
    if (chartType === 'doughnut') {
        data.labels.forEach((label, i) => {
            const color = data.datasets[0].backgroundColor[i];
            const div = document.createElement('div');
            div.className = 'legend-item';
            div.innerHTML = `<span class="legend-color" style="background-color: ${color}"></span><span>${label}</span>`;
            legendEl.appendChild(div);
        });
    } else {
        data.datasets.forEach((dataset) => {
            const label = dataset.label;
            const color = dataset.backgroundColor;
            const div = document.createElement('div');
            div.className = 'legend-item';
            div.innerHTML = `<span class="legend-color" style="background-color: ${color}"></span><span>${label}</span>`;
            legendEl.appendChild(div);
        });
    }
    // END_BLOCK_FILL_LEGEND
}
// END_FUNCTION_generateLegend

window.createCategoryElement = createCategoryElement;
window.generateLegend = generateLegend;
window.renderProfileSelector = renderProfileSelector;
window.getRandomColor = getRandomColor;
window.setupCustomNumberInput = setupCustomNumberInput;
window.COLOR_PALETTE = COLOR_PALETTE;
