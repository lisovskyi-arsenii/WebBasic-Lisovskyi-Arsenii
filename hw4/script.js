const logo = document.querySelector('.header_logo');

logo.addEventListener('click', () => {
    location.href = 'index.html';
    location.reload();
});

document.getElementById('year').innerHTML = new Date().getFullYear();

// Cart logic
const cartCount = document.querySelector('.header_cart-count');
let totalCartItems = 0;

// Add price data for each pizza
const pizzaPrices = {
    'Margherita': 12.99,
    'Pepperoni': 13.99,
    'Vegetarian': 12.49,
    'Hawaiian': 14.49,
    'BBQ Chicken': 15.99,
    'Four Cheese': 13.49,
    'Spinach & Feta': 13.99,
    'Seafood': 16.99,
    'Mushroom': 12.99
};

// For each pizza card, set up quantity and add-to-cart logic
const pizzaCards = document.querySelectorAll('.pizza-card');
pizzaCards.forEach(card => {
    const minusBtn = card.querySelector('.qty-btn.minus');
    const plusBtn = card.querySelector('.qty-btn.plus');
    const qtyValue = card.querySelector('.qty-value');
    const addCartBtn = card.querySelector('.add-cart-btn');
    const pizzaName = card.querySelector('.pizza-name').textContent;
    let qty = 1;

    minusBtn.addEventListener('click', () => {
        if (qty > 1) {
            qty--;
            qtyValue.textContent = qty;
        }
    });
    plusBtn.addEventListener('click', () => {
        qty++;
        qtyValue.textContent = qty;
    });
    addCartBtn.addEventListener('click', () => {
        totalCartItems += qty;
        cartCount.textContent = totalCartItems;
        // Add to cart object
        if (cart[pizzaName]) {
            cart[pizzaName] += qty;
        } else {
            cart[pizzaName] = qty;
        }
        qty = 1;
        qtyValue.textContent = qty;
    });
});

// Cart modal logic
const cartModal = document.getElementById('cartModal');
const closeCartModal = document.getElementById('closeCartModal');
const cartIcon = document.querySelector('.header_cart');
const cartItemsContainer = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');

let cart = {};

cartIcon.addEventListener('click', () => {
    updateCartModal();
    cartModal.classList.add('open');
});
closeCartModal.addEventListener('click', () => {
    cartModal.classList.remove('open');
});
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('open');
    }
});

function updateCartModal() {
    cartItemsContainer.innerHTML = '';
    const items = Object.entries(cart);
    let total = 0;
    if (items.length === 0) {
        cartEmpty.style.display = 'block';
        document.getElementById('cartTotal').textContent = '';
        return;
    }
    cartEmpty.style.display = 'none';
    items.forEach(([name, qty]) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        const price = pizzaPrices[name] || 0;
        itemDiv.textContent = `${name} x ${qty} — $${(price * qty).toFixed(2)}`;
        cartItemsContainer.appendChild(itemDiv);
        total += price * qty;
    });
    document.getElementById('cartTotal').textContent = `Total: $${total.toFixed(2)}`;
}


