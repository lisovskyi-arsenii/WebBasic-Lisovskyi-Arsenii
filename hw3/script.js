const addItemBtn = document.getElementById('add-item-btn');
const itemNameInput = document.getElementById('item-name-input');
const itemsList = document.querySelector('.items');

// Arrays to store items
let activeItems = [];
let boughtItems = [];

function loadItemsFromLocalStorage() {
    const savedActiveItems = JSON.parse(localStorage.getItem('activeItems')) || [];
    const savedBoughtItems = JSON.parse(localStorage.getItem('boughtItems')) || [];

    // Спочатку додаємо активні товари (не куплені)
    savedActiveItems.forEach(item => {
        addItemToDOM(item.name, item.quantity, false);
    });

    // Потім додаємо куплені товари
    savedBoughtItems.forEach(item => {
        addItemToDOM(item.name, item.quantity, true);
    });

    // Оновлюємо масиви
    activeItems = [...savedActiveItems];
    boughtItems = [...savedBoughtItems];
    updateSummaryTags();
}

function saveItemsToLocalStorage() {
    localStorage.setItem('activeItems', JSON.stringify(activeItems));
    localStorage.setItem('boughtItems', JSON.stringify(boughtItems));
}

function initializeItems() {
    const savedActiveItems = localStorage.getItem('activeItems');
    const savedBoughtItems = localStorage.getItem('boughtItems');

    if (savedActiveItems || savedBoughtItems) {
        // Очищуємо HTML перед завантаженням з localStorage
        itemsList.innerHTML = '';
        loadItemsFromLocalStorage();
    } else {
        // Ініціалізуємо з існуючих HTML елементів тільки якщо немає збережених даних
        const existingItems = document.querySelectorAll('.item');
        existingItems.forEach(item => {
            const itemName = item.getAttribute('data-item-name');
            const quantity = parseInt(item.querySelector('.item-quantity').textContent);
            const isBought = item.classList.contains('bought');

            const itemObj = {
                name: itemName,
                quantity: quantity,
                bought: isBought
            };

            if (isBought) {
                boughtItems.push(itemObj);
            } else {
                activeItems.push(itemObj);
            }
        });

        updateSummaryTags();
        saveItemsToLocalStorage();
    }
}

// Викликаємо ініціалізацію при завантаженні сторінки
initializeItems();

addItemBtn.addEventListener('click', () => {
    const itemName = itemNameInput.value.trim();
    if (itemName !== '') {
        addItem(itemName);
        itemNameInput.value = '';
    }
});

// Allow adding items with Enter key
itemNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const itemName = itemNameInput.value.trim();
        if (itemName !== '') {
            addItem(itemName);
            itemNameInput.value = '';
        }
    }
});

function addItemToDOM(name, quantity = 1, bought = false) {
    const li = document.createElement('li');
    li.className = bought ? 'item bought' : 'item';
    li.setAttribute('data-item-name', name);

    const itemNameDisplay = bought ? `<del>${name}</del>` : name;
    const toggleBtnText = bought ? 'Не куплено' : 'Куплено';
    const toggleBtnClass = bought ? 'toggle-bought-btn not-bought' : 'toggle-bought-btn';
    
    if (bought) {
        li.innerHTML = `
            <span class="item-name">${itemNameDisplay}</span>
            <div class="quantity-controls">
                <span class="item-quantity">${quantity}</span>
            </div>
            <button class="${toggleBtnClass} tooltip" data-tooltip="Позначити як не куплений">${toggleBtnText}</button>
            <button class="remove-item-btn tooltip" data-tooltip="Видалити товар" style="display: none;">×</button>
        `;
    } else {
        li.innerHTML = `
            <span class="item-name">${itemNameDisplay}</span>
            <div class="quantity-controls">
                <button class="decrease-quantity tooltip" data-tooltip="Зменшити кількість">-</button>
                <span class="item-quantity">${quantity}</span>
                <button class="increase-quantity tooltip" data-tooltip="Збільшити кількість">+</button>
            </div>
            <button class="${toggleBtnClass} tooltip" data-tooltip="Позначити як куплений">${toggleBtnText}</button>
            <button class="remove-item-btn tooltip" data-tooltip="Видалити товар">×</button>
        `;
    }

    itemsList.appendChild(li);
}

function addItem(name) {
    // Create new item object
    const newItem = {
        name: name,
        quantity: 1,
        bought: false
    };
    
    // Add to active items array
    activeItems.push(newItem);

    addItemToDOM(name, 1, false);

    updateSummaryTags();
    saveItemsToLocalStorage();
}

function removeItem(item) {
    const itemName = item.getAttribute('data-item-name');
    
    // Remove from both arrays
    activeItems = activeItems.filter(i => i.name !== itemName);
    boughtItems = boughtItems.filter(i => i.name !== itemName);
    
    // Remove from DOM
    item.remove();
    updateSummaryTags();
    saveItemsToLocalStorage();
}

function updateSummaryTags() {
    const remainingTags = document.getElementById('remaining-tags');
    const boughtTags = document.getElementById('bought-tags');
    
    // Очищуємо контейнери
    if (remainingTags) remainingTags.innerHTML = '';
    if (boughtTags) boughtTags.innerHTML = '';

    // Додаємо теги для активних товарів
    activeItems.forEach(item => {
        if (remainingTags) {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = `${item.name} <span class="count">${item.quantity}</span>`;
            remainingTags.appendChild(tag);
        }
    });

    // Додаємо теги для куплених товарів
    boughtItems.forEach(item => {
        if (boughtTags) {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = `${item.name} <span class="count">${item.quantity}</span>`;
            boughtTags.appendChild(tag);
        }
    });
}

// Add event delegation for all item interactions
itemsList.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (!item) return;

    if (e.target.classList.contains('remove-item-btn')) {
        removeItem(item);
    } else if (e.target.classList.contains('toggle-bought-btn')) {
        const itemName = item.getAttribute('data-item-name');
        const quantityControls = item.querySelector('.quantity-controls');
        const removeBtn = item.querySelector('.remove-item-btn');
        const isBought = item.classList.contains('bought');
        
        if (isBought) {
            // Change to not bought
            item.classList.remove('bought');
            const itemNameElement = item.querySelector('.item-name');
            itemNameElement.innerHTML = itemName;
            e.target.textContent = 'Куплено';
            e.target.classList.remove('not-bought');
            
            // Move from bought to active items
            const boughtItem = boughtItems.find(i => i.name === itemName);
            if (boughtItem) {
                boughtItem.bought = false;
                activeItems.push(boughtItem);
                boughtItems = boughtItems.filter(i => i.name !== itemName);
            }
            
            // Show quantity controls and remove button
            const quantitySpan = quantityControls.querySelector('.item-quantity');
            quantityControls.innerHTML = `
                <button class="decrease-quantity tooltip" data-tooltip="Зменшити кількість">-</button>
                <span class="item-quantity">${quantitySpan.textContent}</span>
                <button class="increase-quantity tooltip" data-tooltip="Збільшити кількість">+</button>
            `;
            if (removeBtn) removeBtn.style.display = 'flex';
        } else {
            // Change to bought
            item.classList.add('bought');
            const itemNameElement = item.querySelector('.item-name');
            itemNameElement.innerHTML = `<del>${itemName}</del>`;
            e.target.textContent = 'Не куплено';
            e.target.classList.add('not-bought');
            
            // Move from active to bought items
            const activeItem = activeItems.find(i => i.name === itemName);
            if (activeItem) {
                activeItem.bought = true;
                boughtItems.push(activeItem);
                activeItems = activeItems.filter(i => i.name !== itemName);
            }
            
            // Hide quantity controls and remove button
            const quantitySpan = quantityControls.querySelector('.item-quantity');
            quantityControls.innerHTML = `<span class="item-quantity">${quantitySpan.textContent}</span>`;
            if (removeBtn) removeBtn.style.display = 'none';
        }
        updateSummaryTags();
        saveItemsToLocalStorage();
    } else if (e.target.classList.contains('increase-quantity')) {
        const quantitySpan = item.querySelector('.item-quantity');
        let quantity = parseInt(quantitySpan.textContent);
        quantity++;
        quantitySpan.textContent = quantity;
        
        // Update quantity in array
        const itemName = item.getAttribute('data-item-name');
        const itemToUpdate = activeItems.find(i => i.name === itemName);
        if (itemToUpdate) {
            itemToUpdate.quantity = quantity;
        }
        
        updateSummaryTags();
        saveItemsToLocalStorage(); // Додано збереження
    } else if (e.target.classList.contains('decrease-quantity')) {
        const quantitySpan = item.querySelector('.item-quantity');
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity > 1) {
            quantity--;
            quantitySpan.textContent = quantity;
            
            // Update quantity in array
            const itemName = item.getAttribute('data-item-name');
            const itemToUpdate = activeItems.find(i => i.name === itemName);
            if (itemToUpdate) {
                itemToUpdate.quantity = quantity;
            }
            
            updateSummaryTags();
            saveItemsToLocalStorage();
        } else {
            removeItem(item);
        }
    } else if (e.target.classList.contains('item-name') && !item.classList.contains('bought')) {
        const itemNameSpan = e.target;
        const oldName = item.getAttribute('data-item-name');
        const quantity = parseInt(item.querySelector('.item-quantity').textContent);
        // Створюємо input
        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldName;
        input.className = 'editable-input';
        input.style.width = (oldName.length + 2) + 'ch';
        itemNameSpan.replaceWith(input);
        input.focus();
        input.select();

        // Зберігаємо нову назву при втраті фокусу або Enter
        function finishEdit() {
            let newName = input.value.trim();
            if (!newName) newName = oldName;
            // Якщо назва не змінилася — просто повертаємо span
            if (newName === oldName) {
                input.replaceWith(createItemNameSpan(newName));
                return;
            }
            // Перевірка на дублікат
            if (
                activeItems.some(i => i.name === newName) ||
                boughtItems.some(i => i.name === newName)
            ) {
                alert('Такий товар вже існує!');
                input.replaceWith(createItemNameSpan(oldName));
                return;
            }
            // Оновлюємо у масиві
            const itemObj = activeItems.find(i => i.name === oldName);
            if (itemObj) itemObj.name = newName;
            item.setAttribute('data-item-name', newName);
            // Оновлюємо DOM
            input.replaceWith(createItemNameSpan(newName));
            updateSummaryTags();
            saveItemsToLocalStorage();
        }
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                input.blur();
            }
        });
    }
});

// Допоміжна функція для створення span з назвою
function createItemNameSpan(name) {
    const span = document.createElement('span');
    span.className = 'item-name';
    span.textContent = name;
    return span;
}