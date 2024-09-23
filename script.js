// Espera que o DOM (estrutura da página) esteja completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    // Objeto com os preços dos itens disponíveis
    const itemPrices = {
        "Take Away Colaborador": 3,
        "Sopa": 1.5,
        "Sopa mensal": 22,
        "Refeição externo": 5
    };

    // Seleção dos elementos do DOM que serão manipulados
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

    // Variáveis para controle do total do pedido e número sequencial
    let totalAmount = 0;
    let lastSequentialNumber = 0;

    // Adiciona eventos aos elementos
    itemSelect.addEventListener('change', updatePrice);
    addItemButton.addEventListener('click', addItemToOrder);
    customerForm.addEventListener('submit', registerOrder);

    // Função para atualizar o preço quando um item é selecionado
    function updatePrice() {
        const selectedItem = itemSelect.value;
        priceInput.value = itemPrices[selectedItem] || '';
    }

    // Função para adicionar um item ao pedido
    function addItemToOrder(event) {
        event.preventDefault(); // Impede o envio do formulário
        if (!validateForm(orderForm)) {
            showErrorMessage('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Obtém os valores do item selecionado
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

    // Função para atualizar o total exibido
    function updateTotalAmount() {
        totalAmountDiv.textContent = `Total: ${totalAmount.toFixed(2)}€`;
    }

    // Função para registrar o pedido
    function registerOrder(event) {
        event.preventDefault(); // Impede o envio do formulário
        if (!validateForm(customerForm) || orderList.children.length === 0) {
            showErrorMessage('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um item ao pedido.');
            return;
        }

        // Obtém os dados do cliente
        const name = document.getElementById('name').value;
        const nif = document.getElementById('nif').value;
        const phone = document.getElementById('phone').value;
        const date = document.getElementById('date').value;

        // Gera os números de registro
        lastSequentialNumber++;
        const sequentialNumber = lastSequentialNumber.toString().padStart(6, '0');
        const registrationNumber = generateRegistrationNumber(date, nif, phone, sequentialNumber);

        // Prepara os dados para enviar à planilha
        const orderData = [sequentialNumber, registrationNumber, date, name, nif, phone, totalAmount.toFixed(2)];
        
        // Envia dados para o Google Apps Script
        fetch('URL_DO_SEU_GOOGLE_APPS_SCRIPT', {
            method: 'POST',
            mode: 'no-cors', // Necessário para evitar problemas de CORS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderData: orderData }),
        })
        .then(() => {
            // Exibe mensagem de sucesso
            orderNumberDiv.textContent = `Registro feito com sucesso! Número de registro: ${registrationNumber}`;
            // Limpa o formulário e reseta o pedido
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

    // Função para gerar o número de registro
    function generateRegistrationNumber(date, nif, phone, sequentialNumber) {
        const datePart = date.slice(-2);
        const nifPart = nif.slice(-2);
        const phonePart = phone.slice(-2);
        const sequentialPart = sequentialNumber.slice(-3);
        return `${datePart}${nifPart}${phonePart}${sequentialPart}`;
    }

    // Função para validar os campos obrigatórios do formulário
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

    // Função para exibir mensagem de erro
    function showErrorMessage(message) {
        errorMessageDiv.textContent = message;
    }

    // Função para limpar mensagem de erro
    function clearErrorMessage() {
        errorMessageDiv.textContent = '';
    }
});
