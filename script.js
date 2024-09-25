document.addEventListener('DOMContentLoaded', () => {
    // ... (código anterior permanece o mesmo)

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
        
        fetch('https://script.google.com/macros/s/AKfycbwEUCn0EMw5hjYUZnxfE7hhLH5VmskMez3YbfvEya4/dev', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        })
        .then(response => response.text())
        .then(text => {
            try {
                return JSON.parse(text);
            } catch (error) {
                console.error('Erro ao analisar resposta:', error);
                return { result: 'error', message: 'Erro ao processar resposta do servidor' };
            }
        })
        .then(data => {
            if (data.result === 'success') {
                orderNumberDiv.textContent = `Registro feito com sucesso! Número de registro: ${data.registrationNumber}`;
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
            showErrorMessage('Erro ao registrar pedido. Por favor, tente novamente.');
        });
    }

    // ... (resto do código permanece o mesmo)
});
