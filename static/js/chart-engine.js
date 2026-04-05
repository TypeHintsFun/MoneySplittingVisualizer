/**
 * FILE: static/js/chart-engine.js
 * VERSION: 1.0.1
 * START_MODULE_CONTRACT:
 * PURPOSE: Integration with Chart.js, initialization and update of charts.
 * SCOPE: Rendering Doughnut and Bar charts, managing their settings.
 * INPUT: Global categories object, totalAmount.
 * OUTPUT: myChart object, UI chart update methods.
 * KEYWORDS: DOMAIN(Visualization): ChartEngine; TECH(Charts): Chart.js; CONCEPT(UI): DataBinding
 * END_MODULE_CONTRACT
 */

/**
 * START_CHANGE_SUMMARY:
 * LAST_CHANGE: [v1.0.1 - Translated strings to English and changed currency symbol to $.]
 * PREV_CHANGE_SUMMARY: [v1.0.0 - Extraction of Chart.js logic into a separate module.]
 * END_CHANGE_SUMMARY
 */

/**
 * START_MODULE_MAP:
 * VAR [10][Chart.js instance] => myChart
 * FUNC [9][Chart initialization] => initChart
 * FUNC [8][Getting chart data] => getChartData
 * FUNC [10][Global UI update] => updateApp
 * FUNC [5][Random color generation] => getRandomColor
 * END_MODULE_MAP
 */

window.myChart = null;

// START_FUNCTION_getRandomColor
/**
 * START_CONTRACT:
 * PURPOSE: Stub. Actual implementation moved to ui-renderer.js for palette consistency.
 * END_CONTRACT
 */
function getRandomColor() {
    if (window.COLOR_PALETTE) {
        return window.COLOR_PALETTE[Math.floor(Math.random() * window.COLOR_PALETTE.length)];
    }
    return '#818cf8';
}
// END_FUNCTION_getRandomColor

// START_FUNCTION_initChart
/**
 * START_CONTRACT:
 * PURPOSE: Creates or recreates a Chart.js instance on the canvas.
 * INPUTS: None (uses DOM and global state)
 * OUTPUTS: None
 * SIDE_EFFECTS: Modifies DOM (canvas styles), creates window.myChart.
 * END_CONTRACT
 */
function initChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const chartTypeSelect = document.getElementById('chart-type-select');
    const chartType = chartTypeSelect.value;
    const wrapper = document.querySelector('.chart-wrapper');
    const centerText = document.getElementById('chart-center');

    // START_BLOCK_LAYOUT: [Setting sizes depending on chart type]
    if (chartType === 'doughnut') {
        wrapper.style.aspectRatio = '1';
        wrapper.style.height = 'auto';
        wrapper.style.maxWidth = '270px';
        centerText.style.display = 'flex';
    } else {
        wrapper.style.aspectRatio = 'auto';
        wrapper.style.height = '60px'; 
        wrapper.style.maxWidth = '100%';
        centerText.style.display = 'none';
    }
    // END_BLOCK_LAYOUT

    // START_BLOCK_CONFIG: [Configuring Chart.js options]
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 0 },
        plugins: {
            legend: { display: false }, 
            tooltip: {
                callbacks: {
                    label: function(context) { 
                        const label = chartType === 'doughnut' ? context.label : context.dataset.label;
                        const currency = window.currency || '$';
                        return ` ${label}: ${context.raw.toLocaleString()} ${currency}`; 
                    }
                }
            }
        }
    };

    if (chartType === 'doughnut') {
        options.cutout = '75%';
        options.hoverOffset = 4;
    } else {
        options.indexAxis = 'y'; 
        options.scales = {
            x: { stacked: true, display: false, min: 0 },
            y: { stacked: true, display: false }
        };
    }
    // END_BLOCK_CONFIG

    // START_BLOCK_CREATE_INSTANCE: [Creating chart instance]
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: chartType === 'doughnut' ? 'doughnut' : 'bar',
        data: getChartData(),
        options: options
    });
    console.log(`[Chart][IMP:7][initChart][CREATE_INSTANCE] Chart ${chartType} initialized [SUCCESS]`);
    // END_BLOCK_CREATE_INSTANCE
}
// END_FUNCTION_initChart

// START_FUNCTION_getChartData
/**
 * START_CONTRACT:
 * PURPOSE: Converts category state to Chart.js data format.
 * INPUTS: None (global window.categories, window.totalAmount)
 * OUTPUTS: 
 * - object - Data for Chart.js (labels, datasets)
 * SIDE_EFFECTS: None
 * END_CONTRACT
 */
function getChartData() {
    const sum = window.categories.reduce((a, b) => a + b.amount, 0);
    const remaining = Math.max(0, window.totalAmount - sum);
    const deficit = Math.max(0, sum - window.totalAmount);
    const chartType = document.getElementById('chart-type-select').value;
    const unallocatedColor = getComputedStyle(document.documentElement).getPropertyValue('--unallocated-bg').trim();
    const deficitColor = getComputedStyle(document.documentElement).getPropertyValue('--danger-text').trim();

    // START_BLOCK_PREPARE_DATA: [Forming data structure by type]
    if (chartType === 'doughnut') {
        const labels = window.categories.map(c => c.name || 'Untitled');
        const data = window.categories.map(c => c.amount);
        const bg = window.categories.map(c => c.color);

        if (remaining > 0) {
            labels.push('Unallocated');
            data.push(remaining);
            bg.push(unallocatedColor);
        }

        if (deficit > 0) {
            labels.push('Deficit');
            data.push(deficit);
            bg.push(deficitColor);
        }

        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bg,
                borderWidth: 0 
            }]
        };
    } else {
        const datasets = window.categories.map(c => ({
            label: c.name || 'Untitled',
            data: [c.amount],
            backgroundColor: c.color,
            borderWidth: 0, 
            barPercentage: 1,
            categoryPercentage: 1
        }));

        if (remaining > 0) {
            datasets.push({
                label: 'Unallocated',
                data: [remaining],
                backgroundColor: unallocatedColor,
                borderWidth: 0,
                barPercentage: 1,
                categoryPercentage: 1
            });
        }

        if (deficit > 0) {
            datasets.push({
                label: 'Deficit',
                data: [deficit],
                backgroundColor: deficitColor,
                borderWidth: 0,
                barPercentage: 1,
                categoryPercentage: 1
            });
        }

        return {
            labels: [''], 
            datasets: datasets
        };
    }
    // END_BLOCK_PREPARE_DATA
}
// END_FUNCTION_getChartData

// START_FUNCTION_updateApp
/**
 * START_CONTRACT:
 * PURPOSE: Main synchronization point of UI with current state.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Updates DOM (total, remaining, sliders, legend), updates chart, saves to URL.
 * END_CONTRACT
 */
function updateApp() {
    const totalInput = document.getElementById('total-input');
    const remBox = document.getElementById('remaining-box');
    const centerVal = document.getElementById('chart-center-val');
    const chartTypeSelect = document.getElementById('chart-type-select');

    // START_BLOCK_CALCULATE_TOTALS: [Calculating totals and remaining]
    window.totalAmount = Number(totalInput.value) || 0;
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) window.currency = currencySelect.value;
    const currency = window.currency || '$';

    const sum = window.categories.reduce((a, b) => a + b.amount, 0);
    const remaining = window.totalAmount - sum;

    remBox.textContent = `Remaining: ${remaining.toLocaleString()} ${currency}`;
    if (remaining < 0) {
        remBox.style.background = 'var(--danger-bg)';
        remBox.style.color = 'var(--danger-text)';
    } else {
        remBox.style.background = 'var(--success-bg)';
        remBox.style.color = 'var(--success-text)';
    }
    // END_BLOCK_CALCULATE_TOTALS

    // START_BLOCK_SYNC_UI: [Synchronizing input fields]
    centerVal.textContent = window.totalAmount.toLocaleString() + ' ' + currency;
    document.querySelectorAll('.cat-slider').forEach(slider => {
        slider.max = window.totalAmount;
        if (slider.updateFill) slider.updateFill();
    });
    // END_BLOCK_SYNC_UI

    // START_BLOCK_REFRESH_CHART: [Updating chart]
    const newData = getChartData();
    window.myChart.data = newData;

    if (chartTypeSelect.value === 'bar') {
        const totalOfData = newData.datasets.reduce((acc, ds) => acc + ds.data[0], 0);
        window.myChart.options.scales.x.max = Math.max(window.totalAmount, totalOfData);
    }
    
    if (window.isAppLoaded) {
        window.myChart.update('none'); 
    } else {
        window.myChart.update(); 
    }
    // END_BLOCK_REFRESH_CHART
    
    // START_BLOCK_LEGEND: [Redrawing legend]
    if (window.generateLegend) window.generateLegend(newData);
    // END_BLOCK_LEGEND

    // START_BLOCK_PERSISTENCE: [Saving state to profile (LocalStorage)]
    if (window.isAppLoaded && window.saveCurrentProfile) {
        window.saveCurrentProfile();
    }
    // END_BLOCK_PERSISTENCE
}
// END_FUNCTION_updateApp

window.getRandomColor = getRandomColor;
window.initChart = initChart;
window.getChartData = getChartData;
window.updateApp = updateApp;
