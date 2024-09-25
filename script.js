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

    // Variável para controle do total
    let totalAmount = 0;

    // Função para formatar a data como DD/MM/YYYY
    function formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Preenche o campo de data com a data atual
    const dateInput = document.getElementById('date');
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
        if (nif.length !== 9 || /^(\d)\1{8}$/.test(nif) || nif === '123
