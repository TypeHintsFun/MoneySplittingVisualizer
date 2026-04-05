// FILE: static/js/storage-manager.js
// VERSION: 1.0.0
// START_MODULE_CONTRACT:
// PURPOSE: Управление локальным хранилищем (LocalStorage) для тем и профилей.
// SCOPE: Чтение и запись данных в LocalStorage, управление схемой данных.
// INPUT: Запросы на чтение/запись от других модулей.
// OUTPUT: Сохраненные данные или значения по умолчанию.
// KEYWORDS: DOMAIN(Storage): LocalStorage; CONCEPT(Persistence): Profiles; TECH(Web): Serverless
// LINKS: USES_API(Browser): localStorage
// END_MODULE_CONTRACT
//
// START_RATIONALE:
// Q: Почему используется LocalStorage?
// A: Проект является Serverless и размещен на GitHub Pages, поэтому LocalStorage — единственный способ сохранить данные пользователя без бэкенда.
// END_RATIONALE
//
// START_CHANGE_SUMMARY:
// LAST_CHANGE: [v1.0.0 - Создание менеджера хранилища для поддержки профилей и тем.]
// END_CHANGE_SUMMARY
//
// START_MODULE_MAP:
// FUNC [8][Получить текущую тему] => getTheme
// FUNC [8][Сохранить тему] => setTheme
// FUNC [9][Получить все профили] => getProfiles
// FUNC [9][Сохранить профили] => saveProfiles
// FUNC [7][Получить ID текущего профиля] => getCurrentProfileId
// FUNC [7][Установить ID текущего профиля] => setCurrentProfileId
// END_MODULE_MAP

const STORAGE_KEYS = {
    THEME: 'fin_plan_theme',
    PROFILES: 'fin_plan_profiles',
    CURRENT_PROFILE: 'fin_plan_current_profile'
};

// START_FUNCTION_getTheme
// START_CONTRACT:
// PURPOSE: Получает сохраненную тему или тему из настроек браузера.
// INPUTS: None
// OUTPUTS: 
// - string - 'light' или 'dark'
// END_CONTRACT
function getTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) return savedTheme;

    // START_BLOCK_BROWSER_PREFERENCE: [Проверка системной темы]
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
    // END_BLOCK_BROWSER_PREFERENCE
}
// END_FUNCTION_getTheme

// START_FUNCTION_setTheme
// START_CONTRACT:
// PURPOSE: Сохраняет выбранную тему в LocalStorage.
// INPUTS: 
// - string => theme: 'light' или 'dark'
// OUTPUTS: None
// END_CONTRACT
function setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
}
// END_FUNCTION_setTheme

// START_FUNCTION_getProfiles
// START_CONTRACT:
// PURPOSE: Возвращает список всех профилей из LocalStorage.
// INPUTS: None
// OUTPUTS: 
// - Array - Список объектов профилей
// END_CONTRACT
function getProfiles() {
    const profiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return profiles ? JSON.parse(profiles) : [];
}
// END_FUNCTION_getProfiles

// START_FUNCTION_saveProfiles
// START_CONTRACT:
// PURPOSE: Сохраняет список профилей в LocalStorage.
// INPUTS: 
// - Array => profiles: Список объектов профилей
// OUTPUTS: None
// END_CONTRACT
function saveProfiles(profiles) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
}
// END_FUNCTION_saveProfiles

// START_FUNCTION_getCurrentProfileId
// START_CONTRACT:
// PURPOSE: Возвращает ID текущего активного профиля.
// INPUTS: None
// OUTPUTS: 
// - string|null - ID профиля или null
// END_CONTRACT
function getCurrentProfileId() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);
}
// END_FUNCTION_getCurrentProfileId

// START_FUNCTION_setCurrentProfileId
// START_CONTRACT:
// PURPOSE: Устанавливает ID текущего активного профиля.
// INPUTS: 
// - string => id: ID профиля
// OUTPUTS: None
// END_CONTRACT
function setCurrentProfileId(id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, id);
}
// END_FUNCTION_setCurrentProfileId

window.StorageManager = {
    getTheme,
    setTheme,
    getProfiles,
    saveProfiles,
    getCurrentProfileId,
    setCurrentProfileId
};
