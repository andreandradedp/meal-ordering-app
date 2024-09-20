// Espera que o DOM esteja completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    // Objeto com os preços dos itens
    const itemPrices = {
        "Take Away Colaborador": 3,
        "Sopa": 1.5,
        "Sopa mensal": 22,
        "Refeição externo": 5
    };

    // Seleção dos elementos do DOM
    const orderForm = document.getElementById('orderForm');
    const itemSelect = document.getElementById('item');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('price');
    const addItemButton = document.getElementById('addItem');
    const orderList = document.getElementById('orderList');
    const totalAmountDiv = document.getElementById('totalAmount');
    const customerForm = document.getElementById('customerForm');
    const registerOrderButton = document.getElementById('registerOrder');
    const orderNumberDiv = document.getElementById('orderNumber');
    const errorMessageDiv = document.getElementById('errorMessage');

    // Variáveis para controle do total e número sequencial
    let totalAmount = 0;
    let lastSequentialNumber = 0;

    // Adiciona event listeners aos elementos
    itemSelect.addEventListener('change', updatePrice);
    addItemButton.addEventListener('click', addItemToOrder);
    customerForm.addEventListener('submit', registerOrder);

    // Atualiza o preço quando um item é selecionado
    function updatePrice() {
        const selectedItem = itemSelect.value;
        priceInput.value = itemPrices[selectedItem] || '';
    }

    // Adiciona um item ao pedido
    function addItemToOrder(event) {
        event.preventDefault();
        // Valida o formulário antes de adicionar o item
        if (!validateForm(orderForm)) {
            showErrorMessage('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const item = itemSelect.value;
        const quantity = parseInt(quantityInput.value);
        const price = parseFloat(priceInput.value);

        // Cria um novo item na lista de pedidos
        const listItem = document.createElement('li');
        const itemTotal = quantity * price;
        listItem.textContent = `${item} - ${quantity} x ${price.toFixed(2)}€ = ${itemTotal.toFixed(2)}€`;
        orderList.appendChild(listItem);

        // Atualiza o total do pedido
        totalAmount += itemTotal;
        updateTotalAmount();

        // Limpa o formulário e mensagens de erro
        orderForm.reset();
        updatePrice();
        clearErrorMessage();
    }

    // Atualiza o total exibido
    function updateTotalAmount() {
        totalAmountDiv.textContent = `Total: ${totalAmount.toFixed(2)}€`;
    }

    // Registra o pedido
    function registerOrder(event) {
        event.preventDefault();
        // Valida o formulário e verifica se há itens no pedido
        if (!validateForm(customerForm) || orderList.children.length === 0) {
            showErrorMessage('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um item ao pedido.');
            return;
        }

        const name = document.getElementById('name').value;
        const nif = document.getElementById('nif').value;
        const phone = document.getElementById('phone').value;
        const date = document.getElementById('date').value;

        // Gera os números de registro
        lastSequentialNumber++;
        const sequentialNumber = lastSequentialNumber.toString().padStart(6, '0');
        const registrationNumber = generateRegistrationNumber(date, nif, phone, sequentialNumber);

        // Exibe o número de registro
        orderNumberDiv.textContent = `Registro feito com sucesso! Número de registro: ${registrationNumber}`;
        
        // Prepara os dados para enviar à planilha
        const orderData = [sequentialNumber, registrationNumber, date, name, nif, phone, totalAmount.toFixed(2)];
        appendDataToSheet(orderData);

        // Limpa o formulário e reseta o pedido
        customerForm.reset();
        orderList.innerHTML = '';
        totalAmount = 0;
        updateTotalAmount();
        clearErrorMessage();
    }

    // Gera o número de registro conforme a lógica especificada
    function generateRegistrationNumber(date, nif, phone, sequentialNumber) {
        const datePart = date.slice(-2);
        const nifPart = nif.slice(-2);
        const phonePart = phone.slice(-2);
        const sequentialPart = sequentialNumber.slice(-3);
        return `${datePart}${nifPart}${phonePart}${sequentialPart}`;
    }

    // Valida os campos obrigatórios do formulário
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

    // Exibe uma mensagem de erro
    function showErrorMessage(message) {
        errorMessageDiv.textContent = message;
    }

    // Limpa a mensagem de erro
    function clearErrorMessage() {
        errorMessageDiv.textContent = '';
    }

    // Inicializa o cliente GAPI
    function initClient() {
        gapi.client.init({
            'apiKey': process.env.GOOGLE_API_KEY,
            'clientId': process.env.GOOGLE_CLIENT_ID,
            'scope': 'https://www.googleapis.com/auth/spreadsheets',
            'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        }).then(() => {
            console.log('GAPI client initialized.');
        }).catch(error => {
            console.error('Error initializing GAPI client:', error);
        });
    }

    // Carrega o cliente GAPI
    gapi.load('client:auth2', initClient);

    // Adiciona os dados do pedido à planilha do Google
    function appendDataToSheet(data) {
        const params = {
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
        };
        const valueRangeBody = {
            'values': [data]
        };

        gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody)
            .then((response) => {
                console.log('Data appended successfully:', response.result);
            })
            .catch(error => {
                console.error('Error appending data:', error);
            });
    }
});
