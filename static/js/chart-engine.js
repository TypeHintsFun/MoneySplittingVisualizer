/**
 * FILE: static/js/chart-engine.js
 * VERSION: 1.0.0
 * START_MODULE_CONTRACT:
 * PURPOSE: Интеграция с Chart.js, инициализация и обновление диаграмм.
 * SCOPE: Отрисовка Doughnut и Bar чартов, управление их настройками.
 * INPUT: Глобальный объект categories, totalAmount.
 * OUTPUT: Объект myChart, методы обновления UI диаграммы.
 * KEYWORDS: DOMAIN(Visualization): ChartEngine; TECH(Charts): Chart.js; CONCEPT(UI): DataBinding
 * END_MODULE_CONTRACT
 */

/**
 * START_CHANGE_SUMMARY:
 * LAST_CHANGE: [v1.0.0 - Извлечение логики Chart.js в отдельный модуль.]
 * END_CHANGE_SUMMARY
 */

/**
 * START_MODULE_MAP:
 * VAR [10][Экземпляр Chart.js] => myChart
 * FUNC [9][Инициализация диаграммы] => initChart
 * FUNC [8][Получение данных для чарта] => getChartData
 * FUNC [10][Глобальное обновление UI] => updateApp
 * FUNC [5][Генерация случайного цвета] => getRandomColor
 * END_MODULE_MAP
 */

window.myChart = null;

// START_FUNCTION_getRandomColor
/**
 * START_CONTRACT:
 * PURPOSE: Выбирает случайный цвет из предопределенного набора для новых категорий.
 * INPUTS: None
 * OUTPUTS: 
 * - string - Hex код цвета
 * SIDE_EFFECTS: None
 * END_CONTRACT
 */
function getRandomColor() {
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', '#f472b6'];
    return colors[Math.floor(Math.random() * colors.length)];
}
// END_FUNCTION_getRandomColor

// START_FUNCTION_initChart
/**
 * START_CONTRACT:
 * PURPOSE: Создает или пересоздает экземпляр Chart.js на холсте.
 * INPUTS: None (использует DOM и глобальное состояние)
 * OUTPUTS: None
 * SIDE_EFFECTS: Модифицирует DOM (стили холста), создает window.myChart.
 * END_CONTRACT
 */
function initChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const chartTypeSelect = document.getElementById('chart-type-select');
    const chartType = chartTypeSelect.value;
    const wrapper = document.querySelector('.chart-wrapper');
    const centerText = document.getElementById('chart-center');

    // START_BLOCK_LAYOUT: [Настройка размеров в зависимости от типа чарта]
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

    // START_BLOCK_CONFIG: [Настройка опций Chart.js]
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
                        return ` ${label}: ${context.raw.toLocaleString()} ₽`; 
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

    // START_BLOCK_CREATE_INSTANCE: [Создание экземпляра чарта]
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: chartType === 'doughnut' ? 'doughnut' : 'bar',
        data: getChartData(),
        options: options
    });
    console.log(`[Chart][IMP:7][initChart][CREATE_INSTANCE] Диаграмма ${chartType} инициализирована [SUCCESS]`);
    // END_BLOCK_CREATE_INSTANCE
}
// END_FUNCTION_initChart

// START_FUNCTION_getChartData
/**
 * START_CONTRACT:
 * PURPOSE: Преобразует состояние категорий в формат данных Chart.js.
 * INPUTS: None (глобальные window.categories, window.totalAmount)
 * OUTPUTS: 
 * - object - Данные для Chart.js (labels, datasets)
 * SIDE_EFFECTS: None
 * END_CONTRACT
 */
function getChartData() {
    const sum = window.categories.reduce((a, b) => a + b.amount, 0);
    const remaining = Math.max(0, window.totalAmount - sum);
    const chartType = document.getElementById('chart-type-select').value;
    const unallocatedColor = getComputedStyle(document.documentElement).getPropertyValue('--unallocated-bg').trim();

    // START_BLOCK_PREPARE_DATA: [Формирование структуры данных по типу]
    if (chartType === 'doughnut') {
        const labels = window.categories.map(c => c.name || 'Без названия');
        const data = window.categories.map(c => c.amount);
        const bg = window.categories.map(c => c.color);

        if (remaining > 0) {
            labels.push('Не распределено');
            data.push(remaining);
            bg.push(unallocatedColor);
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
            label: c.name || 'Без названия',
            data: [c.amount],
            backgroundColor: c.color,
            borderWidth: 0, 
            barPercentage: 1,
            categoryPercentage: 1
        }));

        if (remaining > 0) {
            datasets.push({
                label: 'Не распределено',
                data: [remaining],
                backgroundColor: unallocatedColor,
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
 * PURPOSE: Главная точка синхронизации UI с текущим состоянием.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Обновляет DOM (сумма, остаток, слайдеры, легенда), обновляет чарт, сохраняет в URL.
 * END_CONTRACT
 */
function updateApp() {
    const totalInput = document.getElementById('total-input');
    const remBox = document.getElementById('remaining-box');
    const centerVal = document.getElementById('chart-center-val');
    const chartTypeSelect = document.getElementById('chart-type-select');

    // START_BLOCK_CALCULATE_TOTALS: [Расчет сумм и остатка]
    window.totalAmount = Number(totalInput.value) || 0;
    const sum = window.categories.reduce((a, b) => a + b.amount, 0);
    const remaining = window.totalAmount - sum;

    remBox.textContent = `Остаток: ${remaining.toLocaleString()} ₽`;
    if (remaining < 0) {
        remBox.style.background = 'var(--danger-bg)';
        remBox.style.color = 'var(--danger-text)';
    } else {
        remBox.style.background = 'var(--success-bg)';
        remBox.style.color = 'var(--success-text)';
    }
    // END_BLOCK_CALCULATE_TOTALS

    // START_BLOCK_SYNC_UI: [Синхронизация полей ввода]
    centerVal.textContent = window.totalAmount.toLocaleString() + ' ₽';
    document.querySelectorAll('.cat-slider').forEach(slider => {
        slider.max = window.totalAmount;
    });
    // END_BLOCK_SYNC_UI

    // START_BLOCK_REFRESH_CHART: [Обновление диаграммы]
    const newData = getChartData();
    window.myChart.data = newData;

    if (chartTypeSelect.value === 'bar') {
        window.myChart.options.scales.x.max = Math.max(window.totalAmount, sum);
    }
    
    if (window.isAppLoaded) {
        window.myChart.update('none'); 
    } else {
        window.myChart.update(); 
    }
    // END_BLOCK_REFRESH_CHART
    
    // START_BLOCK_LEGEND: [Перерисовка легенды]
    if (window.generateLegend) window.generateLegend(newData);
    // END_BLOCK_LEGEND

    // START_BLOCK_PERSISTENCE: [Сохранение в URL]
    if (window.isAppLoaded && window.saveStateToURL) {
        window.saveStateToURL();
    }
    // END_BLOCK_PERSISTENCE
}
// END_FUNCTION_updateApp

window.getRandomColor = getRandomColor;
window.initChart = initChart;
window.getChartData = getChartData;
window.updateApp = updateApp;
