document.addEventListener('DOMContentLoaded', () => {
    const itemPrices = {
        "Take Away Colaborador": 3,
        "Sopa": 1.5,
        "Sopa mensal": 22,
        "Refeição externo": 5
    };

    const orderForm = document.getElementById('orderForm');
    const itemSelect = document.getElementById('item');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('price');
    const addItemButton = document.getElementById('addItem');
    const orderList = document.getElementById('orderList');
    const customerForm = document.getElementById('customerForm');
    const registerOrderButton = document.getElementById('registerOrder');
    const orderNumberDiv = document.getElementById('orderNumber');

    itemSelect.addEventListener('change', () => {
        const selectedItem = itemSelect.value;
        priceInput.value = itemPrices[selectedItem];
    });

    addItemButton.addEventListener('click', () => {
        const item = itemSelect.value;
        const quantity = quantityInput.value;
        const price = priceInput.value;

        if (item && quantity && price) {
            const listItem = document.createElement('li');
            listItem.textContent = `${item} - ${quantity} x ${price}€`;
            orderList.appendChild(listItem);
        }
    });

    registerOrderButton.addEventListener('click', () => {
        const name = document.getElementById('name').value;
        const nif = document.getElementById('nif').value;
        const phone = document.getElementById('phone').value;

        if (name && nif && phone) {
            const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            orderNumberDiv.textContent = `Registo feito com sucesso! Registo número: ${orderNumber}`;
        }
    });
});
