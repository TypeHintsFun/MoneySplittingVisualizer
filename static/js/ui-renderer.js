/**
 * FILE: static/js/ui-renderer.js
 * VERSION: 1.0.0
 * START_MODULE_CONTRACT:
 * PURPOSE: Отрисовка динамических UI элементов: списка категорий и легенды.
 * SCOPE: Управление DOM элементами категорий, обработчики событий ввода.
 * INPUT: Данные категорий, конфигурация Chart.js (для легенды).
 * OUTPUT: HTML элементы, DOM узлы в контейнере списка.
 * KEYWORDS: DOMAIN(UI): Rendering; CONCEPT(Components): DOMCreation; TECH(Events): InputHandlers
 * END_MODULE_CONTRACT
 */

/**
 * START_CHANGE_SUMMARY:
 * LAST_CHANGE: [v1.0.0 - Извлечение логики отрисовки категорий и легенды из index.html.]
 * END_CHANGE_SUMMARY
 */

/**
 * START_MODULE_MAP:
 * FUNC [9][Создание элемента категории] => createCategoryElement
 * FUNC [8][Генерация легенды чарта] => generateLegend
 * END_MODULE_MAP
 */

// START_FUNCTION_createCategoryElement
/**
 * START_CONTRACT:
 * PURPOSE: Создает DOM-узел для одной категории с полями ввода и ползунком.
 * INPUTS: 
 * - object - cat: {id, name, amount, color}
 * OUTPUTS: 
 * - HTMLElement - Контейнер .category-item
 * SIDE_EFFECTS: Навешивает обработчики событий (input, keydown, click).
 * END_CONTRACT
 */
function createCategoryElement(cat) {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.innerHTML = `
        <div class="cat-top">
            <input type="color" class="cat-color" value="${cat.color}">
            <input type="text" class="cat-name" value="${cat.name}" placeholder="Название">
            <input type="number" class="cat-amount" value="${cat.amount}" min="0">
            <button class="cat-delete" title="Удалить">✕</button>
        </div>
        <input type="range" class="cat-slider" value="${cat.amount}" min="0" max="${window.totalAmount}">
    `;

    // START_BLOCK_ELEMENT_REFS: [Получение ссылок на дочерние элементы]
    const colorIn = div.querySelector('.cat-color');
    const nameIn = div.querySelector('.cat-name');
    const amountIn = div.querySelector('.cat-amount');
    const sliderIn = div.querySelector('.cat-slider');
    const deleteBtn = div.querySelector('.cat-delete');
    // END_BLOCK_ELEMENT_REFS

    // START_BLOCK_EVENT_HANDLERS: [Настройка обработчиков событий]
    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('add-btn').click();
        }
    };

    nameIn.addEventListener('keydown', handleEnterKey);
    amountIn.addEventListener('keydown', handleEnterKey);

    colorIn.addEventListener('input', (e) => { cat.color = e.target.value; window.updateApp(); });
    nameIn.addEventListener('input', (e) => { cat.name = e.target.value; window.updateApp(); });
    
    amountIn.addEventListener('input', (e) => {
        let val = Math.max(0, Number(e.target.value));
        cat.amount = val;
        sliderIn.value = val;
        window.updateApp();
    });

    sliderIn.addEventListener('input', (e) => {
        let val = Number(e.target.value);
        cat.amount = val;
        amountIn.value = val;
        window.updateApp();
    });

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
 * PURPOSE: Динамически перерисовывает легенду под диаграммой.
 * INPUTS: 
 * - object - data: Объект данных Chart.js (labels, datasets)
 * OUTPUTS: None
 * SIDE_EFFECTS: Очищает и заполняет #custom-legend
 * END_CONTRACT
 */
function generateLegend(data) {
    const legendEl = document.getElementById('custom-legend');
    if (!legendEl) return;
    
    legendEl.innerHTML = '';
    const chartType = document.getElementById('chart-type-select').value;

    // START_BLOCK_FILL_LEGEND: [Генерация HTML для элементов легенды]
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
