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

// START_CHANGE_SUMMARY:
// LAST_CHANGE: [v1.1.0 - Внедрение системы профилей. Синхронизация с LocalStorage вместо URL по умолчанию. Импорт из URL для шеринга.]
// PREV_CHANGE_SUMMARY: [v1.0.0 - Инициализация модуля состояния, перенос логики URL из main.js]
// END_CHANGE_SUMMARY

// START_MODULE_MAP:
// VAR [10][Глобальная сумма] => totalAmount
// VAR [10][Список категорий] => categories
// VAR [5][Флаг загрузки приложения] => isAppLoaded
// VAR [9][Список профилей] => profiles
// VAR [9][ID текущего профиля] => currentProfileId
// FUNC [8][Сохранение состояния в URL] => saveStateToURL
// FUNC [8][Загрузка состояния из URL] => loadStateFromURL
// FUNC [9][Инициализация профилей] => initProfiles
// FUNC [8][Сохранение текущего профиля] => saveCurrentProfile
// FUNC [8][Смена профиля] => switchProfile
// FUNC [7][Создание профиля] => createProfile
// END_MODULE_MAP

// Глобальные переменные состояния
window.totalAmount = 100000;
window.categories = [];
window.profiles = [];
window.currentProfileId = null;
window.isAppLoaded = false;

// START_FUNCTION_initProfiles
// START_CONTRACT:
// PURPOSE: Загружает профили из LocalStorage, обрабатывает импорт из URL.
// INPUTS: None
// OUTPUTS: None
// SIDE_EFFECTS: Обновляет window.profiles, window.currentProfileId, вызывает загрузку данных.
// END_CONTRACT
function initProfiles() {
    window.profiles = window.StorageManager.getProfiles();
    window.currentProfileId = window.StorageManager.getCurrentProfileId();

    // START_BLOCK_URL_IMPORT: [Импорт из URL (Sharing)]
    const sharedState = loadStateFromURL();
    if (sharedState) {
        console.log("[State][IMP:9][initProfiles][IMPORT] Обнаружен общий доступ через URL. Импорт в новый профиль. [INFO]");
        const newProfile = createProfile(`Импорт от ${new Date().toLocaleDateString()}`, sharedState);
        window.currentProfileId = newProfile.id;
        window.StorageManager.setCurrentProfileId(window.currentProfileId);
        // Очищаем хэш, чтобы при перезагрузке не создавать дубликат
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    // END_BLOCK_URL_IMPORT

    // START_BLOCK_DEFAULT_PROFILE: [Создание профиля по умолчанию, если их нет]
    if (window.profiles.length === 0) {
        createProfile("Основной план", {
            t: 100000,
            c: "doughnut",
            items: [
                { n: 'Жилье', a: 30000, col: '#818cf8' },
                { n: 'Питание', a: 40023, col: '#34d399' },
                { n: 'Сбережения', a: 15000, col: '#f472b6' }
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
// PURPOSE: Применяет данные профиля к глобальному состоянию и UI.
// INPUTS: 
// - string => id: ID профиля
// OUTPUTS: None
// SIDE_EFFECTS: Обновляет window.totalAmount, window.categories, DOM элементы.
// END_CONTRACT
function applyProfile(id) {
    const profile = window.profiles.find(p => p.id === id);
    if (!profile) return;

    window.totalAmount = profile.data.t;
    window.categories = profile.data.items.map((item, idx) => ({
        id: Date.now() + idx,
        name: item.n,
        amount: item.a,
        color: item.col
    }));

    const totalInput = document.getElementById('total-input');
    const chartTypeSelect = document.getElementById('chart-type-select');
    if (totalInput) totalInput.value = window.totalAmount;
    if (chartTypeSelect) chartTypeSelect.value = profile.data.c;

    console.log(`[State][IMP:8][applyProfile] Профиль '${profile.name}' применен. [SUCCESS]`);
}
// END_FUNCTION_applyProfile

// START_FUNCTION_saveCurrentProfile
// START_CONTRACT:
// PURPOSE: Сохраняет текущее состояние в активный профиль в LocalStorage.
// INPUTS: None
// OUTPUTS: None
// SIDE_EFFECTS: Обновляет window.profiles и LocalStorage.
// END_CONTRACT
function saveCurrentProfile() {
    if (!window.currentProfileId) return;

    const totalInput = document.getElementById('total-input');
    const chartTypeSelect = document.getElementById('chart-type-select');

    const profileIndex = window.profiles.findIndex(p => p.id === window.currentProfileId);
    if (profileIndex === -1) return;

    window.profiles[profileIndex].data = {
        t: Number(totalInput.value),
        c: chartTypeSelect.value,
        items: window.categories.map(cat => ({
            n: cat.name,
            a: cat.amount,
            col: cat.color
        }))
    };

    window.StorageManager.saveProfiles(window.profiles);
    console.log(`[State][IMP:7][saveCurrentProfile] Состояние сохранено в профиль '${window.profiles[profileIndex].name}'. [SUCCESS]`);
}
// END_FUNCTION_saveCurrentProfile

// START_FUNCTION_createProfile
// START_CONTRACT:
// PURPOSE: Создает новый профиль с указанным именем и данными.
// INPUTS: 
// - string => name: Имя профиля
// - object => data: Данные профиля (опционально)
// OUTPUTS: 
// - object - Созданный профиль
// END_CONTRACT
function createProfile(name, data = null) {
    const newProfile = {
        id: 'prof_' + Date.now(),
        name: name,
        data: data || {
            t: 0,
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
// PURPOSE: Переключает активный профиль и перезагружает UI.
// INPUTS: 
// - string => id: ID профиля
// OUTPUTS: None
// END_CONTRACT
function switchProfile(id) {
    window.currentProfileId = id;
    window.StorageManager.setCurrentProfileId(id);
    
    // Перезагрузка UI (упрощенно через reload или очистку)
    window.location.reload(); 
}
// END_FUNCTION_switchProfile

// START_FUNCTION_getStateAsURLHash
/**
 * START_CONTRACT:
 * PURPOSE: Сериализует текущее состояние в JSON, кодирует в Base64 для использования в URL hash.
 * INPUTS: None (использует глобальные переменные и DOM элементы)
 * OUTPUTS: 
 * - string - Закодированный хэш состояния
 * END_CONTRACT
 */
function getStateAsURLHash() {
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
    
    console.log(`[State][IMP:7][getStateAsURLHash][GENERATE] Хэш состояния сгенерирован. [SUCCESS]`);
    return '#' + encoded;
}
// END_FUNCTION_getStateAsURLHash

// START_FUNCTION_saveStateToURL
/**
 * START_CONTRACT:
 * PURPOSE: Обновляет хэш в URL текущей страницы.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Изменяет window.location.hash
 * END_CONTRACT
 */
function saveStateToURL() {
    const hash = getStateAsURLHash();
    
    // START_BLOCK_UPDATE_URL: [Обновление хэша URL]
    window.history.replaceState(null, null, hash);
    console.log(`[State][IMP:7][saveStateToURL][UPDATE_URL] Состояние сохранено в адресную строку. [SUCCESS]`);
    // END_BLOCK_UPDATE_URL
}
// END_FUNCTION_saveStateToURL

// START_FUNCTION_loadStateFromURL
/**
 * START_CONTRACT:
 * PURPOSE: Загружает и декодирует состояние из URL hash без применения к UI.
 * INPUTS: None
 * OUTPUTS: 
 * - object|null - Объект состояния или null
 * END_CONTRACT
 */
function loadStateFromURL() {
    const hash = window.location.hash.substring(1);
    if (!hash) return null;

    try {
        const decoded = decodeURIComponent(atob(hash));
        return JSON.parse(decoded);
    } catch (e) {
        console.error("[State][IMP:10][loadStateFromURL][DECODE] Не удалось прочитать данные из URL", e);
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
