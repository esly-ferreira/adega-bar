// WhatsApp Integration
const WhatsApp = {
    // Número do WhatsApp (formato: 5511999999999 - sem caracteres especiais)
    phoneNumber: '5511964374582', // Número da adega

    init() {
        // Carregar número do storage se existir
        const stored = localStorage.getItem('adega_whatsapp');
        if (stored) {
            this.phoneNumber = stored;
        }
    },

    setPhoneNumber(number) {
        // Remove caracteres não numéricos
        this.phoneNumber = number.replace(/\D/g, '');
        localStorage.setItem('adega_whatsapp', this.phoneNumber);
    },

    formatMessage(orderData) {
        const { customer, items, total, payment, date } = orderData;

        let message = `*NOVO PEDIDO - ADEGA BAR*\n\n`;
        message += `*DADOS DO CLIENTE*\n`;
        message += `Nome: ${customer.name}\n`;
        message += `Telefone: ${customer.phone}\n\n`;
        
        message += `*ENDEREÇO DE ENTREGA*\n`;
        message += `Rua: ${customer.street}\n`;
        message += `Número: ${customer.number}\n`;
        if (customer.complement) {
            message += `Complemento: ${customer.complement}\n`;
        }
        message += `Bairro: ${customer.neighborhood}\n`;
        if (customer.location) {
            message += `📍 Localização: https://www.google.com/maps?q=${customer.location.lat},${customer.location.lng}\n`;
        }
        message += `\n`;
        
        message += `*ITENS DO PEDIDO*\n`;
        items.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   Qtd: ${item.quantity}x | R$ ${item.price.toFixed(2).replace('.', ',')} cada\n`;
            message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n\n`;
        });
        
        message += `*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
        message += `*FORMA DE PAGAMENTO*\n`;
        message += `${this.getPaymentMethodName(payment)}\n\n`;
        message += `*DATA/HORA*\n`;
        message += `${date}\n\n`;
        message += `_Pedido gerado automaticamente pelo sistema._`;

        return encodeURIComponent(message);
    },

    getPaymentMethodName(method) {
        const methods = {
            'pix': 'PIX',
            'cartao': 'Cartão',
            'dinheiro': 'Dinheiro'
        };
        return methods[method] || method;
    },

    sendOrder(orderData) {
        if (!this.phoneNumber || this.phoneNumber.length < 10) {
            alert('Número do WhatsApp não configurado. Por favor, configure nas opções.');
            return;
        }

        const message = this.formatMessage(orderData);
        const url = `https://wa.me/${this.phoneNumber}?text=${message}`;
        
        // Abrir WhatsApp em nova aba
        window.open(url, '_blank');
    },

    // Método para configurar o número (pode ser chamado externamente)
    configure() {
        const number = prompt('Digite o número do WhatsApp (com DDD, ex: 11999999999):');
        if (number) {
            this.setPhoneNumber(number);
            alert('Número configurado com sucesso!');
        }
    }
};

