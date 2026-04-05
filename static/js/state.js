/**
 * FILE: static/js/state.js
 * VERSION: 1.0.0
 * START_MODULE_CONTRACT:
 * PURPOSE: Управление глобальным состоянием приложения и синхронизация с URL.
 * SCOPE: Хранение данных о бюджете, категориях и настройках диаграммы.
 * INPUT: Пользовательский ввод (через UI), данные из URL хэша.
 * OUTPUT: Объект состояния, методы сериализации/десериализации.
 * KEYWORDS: DOMAIN(Logic): StateManagement; CONCEPT(Persistence): URLHash; TECH(Encoding): Base64
 * END_MODULE_CONTRACT
 */

/**
 * START_CHANGE_SUMMARY:
 * LAST_CHANGE: [v1.0.0 - Инициализация модуля состояния, перенос логики URL из main.js]
 * END_CHANGE_SUMMARY
 */

/**
 * START_MODULE_MAP:
 * VAR [10][Глобальная сумма] => totalAmount
 * VAR [10][Список категорий] => categories
 * VAR [5][Флаг загрузки приложения] => isAppLoaded
 * FUNC [8][Сохранение состояния в URL] => saveStateToURL
 * FUNC [8][Загрузка состояния из URL] => loadStateFromURL
 * END_MODULE_MAP
 */

// Глобальные переменные состояния
window.totalAmount = 100000;
window.categories = [
    { id: 1, name: 'Жилье', amount: 30000, color: '#818cf8' },
    { id: 2, name: 'Питание', amount: 40023, color: '#34d399' },
    { id: 3, name: 'Сбережения', amount: 15000, color: '#f472b6' }
];
window.isAppLoaded = false;

// START_FUNCTION_saveStateToURL
/**
 * START_CONTRACT:
 * PURPOSE: Сериализует текущее состояние в JSON, кодирует в Base64 и сохраняет в URL hash.
 * INPUTS: None (использует глобальные переменные и DOM элементы)
 * OUTPUTS: None
 * SIDE_EFFECTS: Изменяет window.location.hash
 * END_CONTRACT
 */
function saveStateToURL() {
    const totalInput = document.getElementById('total-input');
    const chartTypeSelect = document.getElementById('chart-type-select');
    
    // START_BLOCK_SERIALIZE: [Формирование объекта состояния]
    const state = {
        t: Number(totalInput.value),
        c: chartTypeSelect.value,
        items: window.categories.map(cat => ({
            n: cat.name,
            a: cat.amount,
            col: cat.color
        }))
    };
    // END_BLOCK_SERIALIZE
    
    // START_BLOCK_ENCODE: [Кодирование в Base64]
    const jsonStr = JSON.stringify(state);
    const encoded = btoa(encodeURIComponent(jsonStr));
    // END_BLOCK_ENCODE
    
    // START_BLOCK_UPDATE_URL: [Обновление хэша URL]
    window.history.replaceState(null, null, '#' + encoded);
    console.log(`[State][IMP:7][saveStateToURL][UPDATE_URL] Состояние сохранено в URL. Длина: ${encoded.length} [SUCCESS]`);
    // END_BLOCK_UPDATE_URL
}
// END_FUNCTION_saveStateToURL

// START_FUNCTION_loadStateFromURL
/**
 * START_CONTRACT:
 * PURPOSE: Загружает и декодирует состояние из URL hash.
 * INPUTS: None
 * OUTPUTS: 
 * - boolean - Результат загрузки (успех/провал)
 * SIDE_EFFECTS: Обновляет глобальные переменные totalAmount, categories и DOM элементы.
 * END_CONTRACT
 */
function loadStateFromURL() {
    const hash = window.location.hash.substring(1);
    if (!hash) return false;

    const totalInput = document.getElementById('total-input');
    const chartTypeSelect = document.getElementById('chart-type-select');

    try {
        // START_BLOCK_DECODE: [Декодирование из Base64]
        const decoded = decodeURIComponent(atob(hash));
        const state = JSON.parse(decoded);
        // END_BLOCK_DECODE

        // START_BLOCK_APPLY_STATE: [Применение данных к состоянию]
        if (state.t !== undefined) {
            window.totalAmount = state.t;
            totalInput.value = state.t;
        }
        if (state.c) {
            chartTypeSelect.value = state.c;
        }
        if (state.items && Array.isArray(state.items)) {
            window.categories = state.items.map((item, index) => ({
                id: Date.now() + index,
                name: item.n || '',
                amount: Number(item.a) || 0,
                color: item.col || '#000000'
            }));
        }
        console.log(`[State][IMP:9][loadStateFromURL][APPLY_STATE] Состояние успешно загружено из URL [SUCCESS]`);
        return true;
        // END_BLOCK_APPLY_STATE
    } catch (e) {
        console.error("[State][IMP:10][loadStateFromURL][DECODE] Не удалось прочитать данные из URL", e);
        return false;
    }
}
// END_FUNCTION_loadStateFromURL

window.saveStateToURL = saveStateToURL;
window.loadStateFromURL = loadStateFromURL;
