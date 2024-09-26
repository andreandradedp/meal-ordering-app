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
    const orderNumberDiv = document.getElementById('orderNumber');
    const errorMessageDiv = document.getElementById('errorMessage');
    const nifInput = document.getElementById('nif');
    const phoneInput = document.getElementById('phone');
    const dateInput = document.getElementById('date');

    // Variável para controle do total
    let totalAmount = 0;

    // Preenche o campo de data com a data atual
    dateInput.value = new Date().toISOString().split('T')[0];

    // Adiciona event listeners aos elementos
    itemSelect.addEventListener('change', updatePrice);
    addItemButton.addEventListener('click', addItemToOrder);
    customerForm.addEventListener('submit', registerOrder);

    // Validação do NIF
    nifInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
        if (this.value.length === 9 && !isValidNIF(this.value)) {
            this.setCustomValidity('NIF inválido');
        } else {
            this.setCustomValidity('');
        }
    });

    // Validação do telefone
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
    });

    // Função para validar NIF
    function isValidNIF(nif) {
        if (nif.length !== 9 || /^(\d)\1{8}$/.test(nif) || nif === '123456789') {
            return false;
        }
        return true;
    }

    // Atualiza o preço quando um item é selecionado
    function updatePrice() {
        const selectedItem = itemSelect.value;
        priceInput.value = itemPrices[selectedItem] || '';
    }

    // Adiciona um item ao pedido
    function addItemToOrder(event) {
        event.preventDefault();
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
    if (!validateForm(customerForm) || orderList.children.length === 0) {
        showErrorMessage('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um item ao pedido.');
        return;
    }

    const name = document.getElementById('name').value;
    const nif = document.getElementById('nif').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;

    const orderData = {
        date: date,
        name: name,
        nif: nif,
        phone: phone,
        total: totalAmount.toFixed(2)
    };
    
    showProcessingMessage('Processando seu pedido...');

    fetch('https://script.google.com/macros/s/AKfycbxpsK1Obkwlw2_AODEB8yqTBEKVd4oAEOqdsdHX4DAVqcG9nWtmY2OoaJ3-6P35RWDn/exec', {
        method: 'POST',
        mode: 'no-cors', // Adicione esta linha
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.log('Resposta recebida:', text);
            return { result: 'success', message: 'Pedido registrado com sucesso' };
        }
    })
    .then(data => {
        if (data.result === 'success') {
            orderNumberDiv.textContent = `Registro feito com sucesso! Número de registro: ${data.registrationNumber || 'N/A'}`;
            customerForm.reset();
            orderList.innerHTML = '';
            totalAmount = 0;
            updateTotalAmount();
            clearErrorMessage();
            dateInput.value = new Date().toISOString().split('T')[0];
        } else {
            throw new Error(data.message || 'Falha ao registrar pedido');
        }
    })
    .catch(error => {
        console.error('Erro ao registrar pedido:', error);
        showErrorMessage(`Erro ao registrar pedido: ${error.message}. Por favor, tente novamente.`);
    })
    .finally(() => {
        clearProcessingMessage();
    });
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
        errorMessageDiv.style.color = 'red';
    }

    // Exibe uma mensagem de processamento
    function showProcessingMessage(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.color = 'blue';
    }

    // Limpa a mensagem de erro ou processamento
    function clearErrorMessage() {
        errorMessageDiv.textContent = '';
    }

    // Limpa especificamente a mensagem de processamento
    function clearProcessingMessage() {
        if (errorMessageDiv.style.color === 'blue') {
            errorMessageDiv.textContent = '';
        }
    }
});
