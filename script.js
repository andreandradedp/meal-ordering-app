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
    const message = document.getElementById('message').value || ''; // Adicione um campo de mensagem no seu HTML se não existir

    const orderData = {
        date: date,
        name: name,
        nif: nif,
        phone: phone,
        items: orderItems.join('; '),
        totalAmount: totalAmount.toFixed(2),
        message: message
    };

    fetch('https://script.google.com/macros/s/AKfycbwwCxDajuzCBnPHAShWL5GO-GpAz0xzfoPR1GsruzKtzLUtFIbwOyqs0hadfAKC8t6H/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            orderNumberDiv.textContent = `${data.message} Número do registro: ${data.orderNumber}`;
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
        showErrorMessage('Erro ao registrar pedido. Por favor, tente novamente.');
    });
}
