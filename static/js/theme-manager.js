/**
 * FILE: static/js/theme-manager.js
 * VERSION: 1.0.0
 * START_MODULE_CONTRACT:
 * PURPOSE: Переключение тем оформления и управление копированием ссылки.
 * SCOPE: Управление атрибутами темы DOM, взаимодействие с буфером обмена.
 * INPUT: События нажатия кнопок переключения темы и копирования.
 * OUTPUT: Изменение data-theme на <html>, статус копирования в UI.
 * KEYWORDS: DOMAIN(UI): Theme; TECH(Storage): localStorage; CONCEPT(UX): ClipboardFeedback
 * END_MODULE_CONTRACT
 */

// START_CHANGE_SUMMARY:
// LAST_CHANGE: [v1.0.1 - Подключение StorageManager для сохранения темы и автоматического определения предпочтений браузера.]
// PREV_CHANGE_SUMMARY: [v1.0.0 - Извлечение логики тем и буфера обмена из index.html.]
// END_CHANGE_SUMMARY

// START_MODULE_MAP:
// FUNC [8][Переключение темы] => toggleTheme
// FUNC [8][Применение темы при загрузке] => applyStoredTheme
// FUNC [9][Копирование ссылки в буфер] => copyLinkToClipboard
// END_MODULE_MAP

// START_FUNCTION_applyStoredTheme
// START_CONTRACT:
// PURPOSE: Применяет тему из LocalStorage или браузерных настроек при инициализации.
// INPUTS: None
// OUTPUTS: None
// SIDE_EFFECTS: Изменяет data-theme на <html>, обновляет текст #theme-toggle.
// END_CONTRACT
function applyStoredTheme() {
    const root = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const theme = window.StorageManager.getTheme();
    
    // START_BLOCK_APPLY_THEME: [Применение темы]
    root.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    console.log(`[Theme][IMP:8][applyStoredTheme] Тема '${theme}' применена. [SUCCESS]`);
    // END_BLOCK_APPLY_THEME
}
// END_FUNCTION_applyStoredTheme

// START_FUNCTION_toggleTheme
/**
 * START_CONTRACT:
 * PURPOSE: Переключает тему между 'light' и 'dark'. Обновляет иконку кнопки и сохраняет в LocalStorage.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Изменяет data-theme на <html>, обновляет текст #theme-toggle, пишет в LocalStorage.
 * END_CONTRACT
 */
function toggleTheme() {
    const root = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // START_BLOCK_UPDATE_THEME: [Переключение атрибута и сохранение]
    root.setAttribute('data-theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    window.StorageManager.setTheme(newTheme);
    console.log(`[Theme][IMP:9][toggleTheme] Тема переключена на '${newTheme}' и сохранена. [SUCCESS]`);
    // END_BLOCK_UPDATE_THEME
    
    // START_BLOCK_SYNC_CHART: [Синхронизация цветов чарта]
    if (window.updateApp) window.updateApp(); 
    // END_BLOCK_SYNC_CHART
}
// END_FUNCTION_toggleTheme

// START_FUNCTION_copyLinkToClipboard
/**
 * START_CONTRACT:
 * PURPOSE: Копирует текущий URL с хэшем состояния в буфер обмена. Показывает временный статус успеха.
 * INPUTS: None
 * OUTPUTS: None
 * SIDE_EFFECTS: Читает window.location.href, пишет в navigator.clipboard.
 * END_CONTRACT
 */
function copyLinkToClipboard() {
    const copyBtn = document.getElementById('copy-link-btn');
    const copyText = document.getElementById('copy-link-text');
    
    // START_BLOCK_GENERATE_STATEFUL_URL: [Генерация URL с актуальным состоянием]
    // Если в URL нет хэша или он не актуален, нам нужно сгенерировать ссылку из текущего состояния.
    // Т.к. мы теперь храним данные в LocalStorage, нам нужно явно вызвать сериализацию в URL перед копированием.
    if (window.saveStateToURL) {
        window.saveStateToURL();
    }
    const currentURL = window.location.href;
    // END_BLOCK_GENERATE_STATEFUL_URL
    
    // START_BLOCK_COPY_PROCESS: [Операция копирования]
    console.log(`[Theme][IMP:7][copyLinkToClipboard][START_COPY] Инициация копирования ссылки: ${currentURL.length} chars`);
    
    navigator.clipboard.writeText(currentURL).then(() => {
        // START_BLOCK_UI_FEEDBACK: [Индикация успеха]
        copyBtn.classList.add('copied');
        copyText.textContent = 'Скопировано!';
        console.log(`[Theme][IMP:8][copyLinkToClipboard][SUCCESS] Ссылка скопирована успешно`);
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyText.textContent = 'Скопировать ссылку';
            console.log(`[Theme][IMP:6][copyLinkToClipboard][RESET] Статус кнопки сброшен`);
        }, 2000);
        // END_BLOCK_UI_FEEDBACK
    }).catch(err => {
        console.error(`[Theme][IMP:10][copyLinkToClipboard][ERROR] Ошибка копирования: ${err.message}`);
        alert('Не удалось скопировать ссылку. Пожалуйста, скопируйте её вручную из адресной строки.');
    });
    // END_BLOCK_COPY_PROCESS
}
// END_FUNCTION_copyLinkToClipboard

window.toggleTheme = toggleTheme;
window.applyStoredTheme = applyStoredTheme;
window.copyLinkToClipboard = copyLinkToClipboard;
