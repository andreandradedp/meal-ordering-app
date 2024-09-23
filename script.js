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
       const totalAmountDiv = document.getElementById('totalAmount');
       const customerForm = document.getElementById('customerForm');
       const orderNumberDiv = document.getElementById('orderNumber');
       const errorMessageDiv = document.getElementById('errorMessage');

       let totalAmount = 0;
       let lastSequentialNumber = 0;

       itemSelect.addEventListener('change', updatePrice);
       addItemButton.addEventListener('click', addItemToOrder);
       customerForm.addEventListener('submit', registerOrder);

       function updatePrice() {
           const selectedItem = itemSelect.value;
           priceInput.value = itemPrices[selectedItem] || '';
       }

       function addItemToOrder(event) {
           event.preventDefault();
           if (!validateForm(orderForm)) {
               showErrorMessage('Por favor, preencha todos os campos obrigatórios.');
               return;
           }

           const item = itemSelect.value;
           const quantity = parseInt(quantityInput.value);
           const price = parseFloat(priceInput.value);

           const listItem = document.createElement('li');
           const itemTotal = quantity * price;
           listItem.textContent = `${item} - ${quantity} x ${price.toFixed(2)}€ = ${itemTotal.toFixed(2)}€`;
           orderList.appendChild(listItem);

           totalAmount += itemTotal;
           updateTotalAmount();

           orderForm.reset();
           updatePrice();
           clearErrorMessage();
       }

       function updateTotalAmount() {
           totalAmountDiv.textContent = `Total: ${totalAmount.toFixed(2)}€`;
       }

       function registerOrder(event) {
           event.preventDefault();
           if (!validateForm(customerForm) || orderList.children.length === 0) {
               showErrorMessage('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um item ao pedido.');
               return;
           }

           const name = document.getElementById('name').value;
           const nif = document.getElementById('nif').value;
           const phone = document.getElementById('phone').value;
           const date = document.getElementById('date').value;

           lastSequentialNumber++;
           const sequentialNumber = lastSequentialNumber.toString().padStart(6, '0');
           const registrationNumber = generateRegistrationNumber(date, nif, phone, sequentialNumber);

           const orderData = [sequentialNumber, registrationNumber, date, name, nif, phone, totalAmount.toFixed(2)];
           
           // Enviar dados para o Google Apps Script
           fetch('https://script.google.com/macros/s/AKfycbx9_UlHgrW7COti42YIFLtDOW-2vhdObVoWpGtEtXyqx4hSDsaoYLSQ75a0RZxADgk/exec', {
               method: 'POST',
               mode: 'no-cors',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({ orderData: orderData }),
           })
           .then(() => {
               orderNumberDiv.textContent = `Registro feito com sucesso! Número de registro: ${registrationNumber}`;
               customerForm.reset();
               orderList.innerHTML = '';
               totalAmount = 0;
               updateTotalAmount();
               clearErrorMessage();
           })
           .catch(error => {
               console.error('Erro ao registrar pedido:', error);
               showErrorMessage('Erro ao registrar pedido. Por favor, tente novamente.');
           });
       }

       function generateRegistrationNumber(date, nif, phone, sequentialNumber) {
           const datePart = date.slice(-2);
           const nifPart = nif.slice(-2);
           const phonePart = phone.slice(-2);
           const sequentialPart = sequentialNumber.slice(-3);
           return `${datePart}${nifPart}${phonePart}${sequentialPart}`;
       }

       function validateForm(form) {
           let isValid = true;
           form.querySelectorAll('[required]').forEach(input => {
               if (!input.value) {
                   input.classList.add('error');
                   isValid = false;
               } else {
                   input.classList.remove('error');
               }
           });
           return isValid;
       }

       function showErrorMessage(message) {
           errorMessageDiv.textContent = message;
       }

       function clearErrorMessage() {
           errorMessageDiv.textContent = '';
       }
   });
