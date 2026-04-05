/**
 * FILE: static/js/main.js
 * VERSION: 1.0.0
 * START_MODULE_CONTRACT:
 * PURPOSE: Точка входа приложения, инициализация всех модулей и DOM слушателей.
 * SCOPE: Запуск приложения, управление начальной загрузкой, регистрация глобальных обработчиков.
 * INPUT: Глобальный DOM контекст, функции из других модулей (state, ui, chart).
 * OUTPUT: Запущенное и готовое к работе веб-приложение.
 * KEYWORDS: DOMAIN(Application): Main; CONCEPT(Initialization): Bootstrap; TECH(DOM): EventDelegation
 * END_MODULE_CONTRACT
 */

/**
 * START_CHANGE_SUMMARY:
 * LAST_CHANGE: [v1.1.0 - Инициализация профилей и тем при старте. Добавление управления профилями в DOM.]
 * PREV_CHANGE_SUMMARY: [v1.0.0 - Инициализация приложения, объединение всех функциональных модулей.]
 * END_CHANGE_SUMMARY
 */

/**
 * START_MODULE_MAP:
 * FUNC [10][Главная функция инициализации] => init
 * END_MODULE_MAP
 */

// START_FUNCTION_init
/**
 * START_CONTRACT:
 * PURPOSE: Запускает процесс инициализации: загружает состояние, отрисовывает UI, регистрирует слушатели.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Изменяет DOM (добавляет элементы, слушатели), запускает Chart.js.
 * END_CONTRACT
 */
function init() {
    console.log("[Main][IMP:9][init][START_BOOTSTRAP] Инициализация приложения начата [INFO]");
    
    // START_BLOCK_THEME_INIT: [Инициализация темы]
    if (window.applyStoredTheme) {
        window.applyStoredTheme();
    }
    // END_BLOCK_THEME_INIT

    // START_BLOCK_STATE_LOAD: [Загрузка профилей и данных]
    if (window.initProfiles) {
        window.initProfiles();
    }
    // END_BLOCK_STATE_LOAD

    // START_BLOCK_UI_INIT: [Отрисовка начального интерфейса]
    const listEl = document.getElementById('categories-list');
    if (window.createCategoryElement) {
        window.categories.forEach(cat => listEl.appendChild(window.createCategoryElement(cat)));
    }
    if (window.renderProfileSelector) {
        window.renderProfileSelector();
    }
    // END_BLOCK_UI_INIT

    // START_BLOCK_CHART_BOOT: [Запуск графического движка]
    if (window.initChart) {
        window.initChart();
    }
    if (window.updateApp) {
        window.updateApp();
    }
    window.isAppLoaded = true;
    console.log("[Main][IMP:9][init][APP_LOADED] Флаг загрузки приложения установлен в true [SUCCESS]");
    // END_BLOCK_CHART_BOOT

    // START_BLOCK_EVENT_LISTENERS: [Регистрация глобальных слушателей событий]
    const totalInput = document.getElementById('total-input');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const chartTypeSelect = document.getElementById('chart-type-select');
    const addBtn = document.getElementById('add-btn');

    if (totalInput) {
        totalInput.addEventListener('input', window.updateApp);
        totalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstCatName = listEl.querySelector('.cat-name');
                if (firstCatName) firstCatName.focus();
            }
        });
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
                console.log("[Main][IMP:7][add-btn][CLICK] Добавлена новая категория [SUCCESS]");
            }
        });
    }
    // END_BLOCK_EVENT_LISTENERS

    console.log("[Main][IMP:9][init][BOOTSTRAP_COMPLETE] Инициализация завершена успешно [SUCCESS]");
}
// END_FUNCTION_init

// START_BLOCK_LAUNCH: [Запуск приложения по событию DOMContentLoaded]
document.addEventListener('DOMContentLoaded', init);
// END_BLOCK_LAUNCH
