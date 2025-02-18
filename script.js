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
    const registerOrderButton = document.getElementById('registerOrder'); // Seleciona o botão

    // Variável para controle do total
    let totalAmount = 0;
    // Array para armazenar os itens do pedido
    let orderItems = [];

    // Função para formatar a data como YYYY-MM-DD
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Preenche o campo de data com a data atual
    const dateInput = document.getElementById('date');
    dateInput.value = formatDate(new Date());

    // Adiciona event listeners aos elementos
    itemSelect.addEventListener('change', updatePrice);
    orderForm.addEventListener('submit', addItemToOrder);
    customerForm.addEventListener('submit', registerOrder);

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

        // Adiciona o item ao array de itens do pedido
        orderItems.push(`${item} - ${quantity} x ${price.toFixed(2)}€`);

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

    // Tratamento de dados
    function validateConsent() {
        const consentimento = document.querySelector('input[name="consentimento"]:checked');
        if (!consentimento || consentimento.value === 'nao-autorizo') {
            showErrorMessage('Para prosseguir com o pedido, é necessário autorizar o tratamento dos dados.');
            return false;
        }
        return true;
    }

    // Registra o pedido
    function registerOrder(event) {
        event.preventDefault();

        // Validação dos campos obrigatórios e do consentimento
        if (!validateForm(customerForm) || orderList.children.length === 0 || !validateConsent()) {
            showErrorMessage('Por favor, preencha todos os campos obrigatórios, adicione pelo menos um item ao pedido e autorize o tratamento de dados.');
            return;
        }

        // Chama a função para validar NIF e Telefone
        if (!validateSequentialNumbers(document.getElementById('nif')) || 
            !validateSequentialNumbers(document.getElementById('phone'))) {
            showErrorMessage('NIF ou Telefone inválidos.');
            return;
        }

        // Obtém o local selecionado
        const localSelecionado = document.querySelector('input[name="local"]:checked').value;

        const orderData = {
            date: document.getElementById('date').value,
            name: document.getElementById('name').value,
            nif: document.getElementById('nif').value,
            phone: document.getElementById('phone').value,
            items: orderItems.join('; '),
            totalAmount: totalAmount.toFixed(2).replace(".", ","),
            message: document.getElementById('message').value,
            local: localSelecionado // Adiciona o local ao objeto de dados
        };

        // Desabilita o botão e exibe um spinner
        registerOrderButton.disabled = true;
        registerOrderButton.innerHTML = '<span class="spinner"></span> Registrando...';

        // Envia o pedido para o servidor
        fetch('https://script.google.com/macros/s/AKfycbwQLwJWq8LrcWUz_CsPgJQZMWHtmi305p7MbDpsrA822OlZ4M8Ati3zLvmViTSfi0Gn/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            })
            .then(response => {
                if (response.type === 'opaque') {
                    // Com 'no-cors', não podemos acessar o conteúdo da resposta
                    // Retornamos uma mensagem de sucesso simples
                    return {status: 'success', message: 'Pedido registado com sucesso!'};
                }
                if (!response.ok) {
                    throw new Error('Erro na resposta do servidor: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    // Exibe a mensagem de sucesso simplificada
                    orderNumberDiv.textContent = data.message;
                    customerForm.reset();
                    orderList.innerHTML = '';
                    orderItems = [];
                    totalAmount = 0;
                    updateTotalAmount();
                    clearErrorMessage();
                    dateInput.value = formatDate(new Date());
                } else {
                    throw new Error(data.message || 'Erro desconhecido ao registrar pedido');
                }
            })
            .catch(error => {
                console.error('Erro ao registrar pedido:', error);
                showErrorMessage('Erro ao registrar pedido. Por favor, tente novamente. Detalhes: ' + error.message);
            })
            .finally(() => {
                // Reabilita o botão após o processamento (em caso de sucesso ou erro)
                registerOrderButton.disabled = false;
                registerOrderButton.innerHTML = 'Registar Pedido';
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

    // Função para validar números sequenciais
    function validateSequentialNumbers(input) {
        const value = input.value;
        if (/^(0{9}|123456789)$/.test(value)) {
            return false;
        }
        // Verifica se são números sequenciais
        const sequence = value.split('').map(Number);
        for (let i = 1; i < sequence.length; i++) {
            if (sequence[i] !== sequence[i - 1] + 1 && sequence[i] !== sequence[i - 1] - 1) {
                return true; // Não é sequencial
            }
        }
        return false; // É sequencial
    }

    // Exibe uma mensagem de erro
    function showErrorMessage(message) {
        errorMessageDiv.textContent = message;
    }

    // Limpa a mensagem de erro
    function clearErrorMessage() {
        errorMessageDiv.textContent = '';
    }
});
