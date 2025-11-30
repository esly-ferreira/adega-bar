// Modal Management
const Modal = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');
        const cancelBtn = document.getElementById('cancelBtn');
        const checkoutForm = document.getElementById('checkoutForm');

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeCheckout();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeCheckout();
            });
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeCheckout();
                }
            });
        }

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCheckout();
            });
        }
    },

    openCheckout() {
        const modalOverlay = document.getElementById('modalOverlay');
        const cartSidebar = document.getElementById('cartSidebar');
        
        if (modalOverlay) {
            // Fechar carrinho se estiver aberto
            if (cartSidebar) {
                cartSidebar.classList.remove('open');
            }
            
            modalOverlay.style.display = 'flex';
            
            // Limpar formulário
            const form = document.getElementById('checkoutForm');
            if (form) {
                form.reset();
            }
        }
    },

    closeCheckout() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    },

    handleCheckout() {
        const name = document.getElementById('customerName')?.value.trim();
        const phone = document.getElementById('customerPhone')?.value.trim();
        const address = document.getElementById('customerAddress')?.value.trim();
        const payment = document.getElementById('paymentMethod')?.value;

        // Validação
        if (!name || !phone || !address || !payment) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Validar telefone básico
        const phoneRegex = /^[\d\s\(\)\-\+]+$/;
        if (!phoneRegex.test(phone)) {
            alert('Por favor, insira um telefone válido.');
            return;
        }

        // Preparar dados do pedido
        const orderData = {
            customer: {
                name,
                phone,
                address
            },
            payment,
            items: Cart.items,
            total: Cart.getTotal(),
            date: new Date().toLocaleString('pt-BR')
        };

        // Enviar via WhatsApp
        WhatsApp.sendOrder(orderData);

        // Limpar carrinho
        Cart.clear();

        // Fechar modal
        this.closeCheckout();

        // Feedback
        alert('Pedido enviado com sucesso! Você será redirecionado para o WhatsApp.');
    }
};

