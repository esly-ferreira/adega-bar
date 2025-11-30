// Cart Management
const Cart = {
    items: [],

    init() {
        this.loadFromStorage();
        this.render();
        this.setupEventListeners();
    },

    loadFromStorage() {
        const stored = localStorage.getItem('adega_cart');
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch (e) {
                console.error('Erro ao carregar carrinho:', e);
                this.items = [];
            }
        }
    },

    saveToStorage() {
        localStorage.setItem('adega_cart', JSON.stringify(this.items));
    },

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveToStorage();
        this.render();
        this.updateCartButton();
        
        // Animar botão do carrinho
        this.animateCartButton();
        
        // Abrir carrinho automaticamente no desktop
        if (window.innerWidth > 768) {
            this.openCart();
        }
    },

    animateCartButton() {
        const cartButton = document.getElementById('cartToggle');
        const cartCount = document.getElementById('cartCount');
        
        if (cartButton) {
            // Animação de bounce/pulse no botão
            cartButton.classList.add('cart-bounce');
            setTimeout(() => {
                cartButton.classList.remove('cart-bounce');
            }, 600);
        }
        
        if (cartCount) {
            // Animação de pop no contador
            cartCount.classList.add('count-pop');
            setTimeout(() => {
                cartCount.classList.remove('count-pop');
            }, 400);
        }
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.render();
        this.updateCartButton();
    },

    updateQuantity(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveToStorage();
                this.render();
                this.updateCartButton();
            }
        }
    },

    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    clear() {
        this.items = [];
        this.saveToStorage();
        this.render();
        this.updateCartButton();
        // Fechar carrinho e voltar para o topo
        this.closeCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    render() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartFooter = document.getElementById('cartFooter');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartItems || !cartEmpty || !cartFooter) return;

        if (this.items.length === 0) {
            cartItems.style.display = 'none';
            cartEmpty.style.display = 'block';
            cartFooter.style.display = 'none';
        } else {
            cartItems.style.display = 'block';
            cartEmpty.style.display = 'none';
            cartFooter.style.display = 'block';

            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-item-id="${item.id}">
                    <div class="cart-item-image-wrapper">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image" 
                        onerror="this.onerror=null; Products.handleImageError(this, '${item.code || ''}')">
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="Cart.updateQuantity(${item.id}, -1)">−</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="Cart.updateQuantity(${item.id}, 1)">+</button>
                            <button class="remove-item" onclick="Cart.removeItem(${item.id})">Remover</button>
                        </div>
                    </div>
                </div>
            `).join('');

            if (cartTotal) {
                cartTotal.textContent = `R$ ${this.getTotal().toFixed(2).replace('.', ',')}`;
            }

            // Verificar valor mínimo e atualizar botão/aviso
            this.updateMinValueCheck();
        }
    },

    updateMinValueCheck() {
        const minValue = 15.00;
        const total = this.getTotal();
        const checkoutBtn = document.getElementById('checkoutBtn');
        const minValueWarning = document.getElementById('minValueWarning');

        if (total < minValue) {
            // Desabilitar botão
            if (checkoutBtn) {
                checkoutBtn.disabled = true;
                checkoutBtn.classList.add('disabled');
            }
            // Mostrar aviso
            if (minValueWarning) {
                const missing = (minValue - total).toFixed(2).replace('.', ',');
                minValueWarning.querySelector('span').textContent = `Valor mínimo de entrega: R$ ${minValue.toFixed(2).replace('.', ',')}. Faltam R$ ${missing}`;
                minValueWarning.style.display = 'flex';
            }
        } else {
            // Habilitar botão
            if (checkoutBtn) {
                checkoutBtn.disabled = false;
                checkoutBtn.classList.remove('disabled');
            }
            // Esconder aviso
            if (minValueWarning) {
                minValueWarning.style.display = 'none';
            }
        }
    },

    updateCartButton() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    setupEventListeners() {
        const cartToggle = document.getElementById('cartToggle');
        const cartClose = document.getElementById('cartClose');
        const cartSidebar = document.getElementById('cartSidebar');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cartToggle) {
            cartToggle.addEventListener('click', () => {
                this.toggleCart();
            });
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => {
                this.closeCart();
            });
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length > 0) {
                    const total = this.getTotal();
                    if (total >= 15.00) {
                        Modal.openCheckout();
                    } else {
                        Toast.warning('Valor mínimo de entrega é R$ 15,00. Adicione mais produtos para finalizar a compra.');
                    }
                }
            });
        }

        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (this.items.length > 0) {
                    // Limpar carrinho diretamente com feedback via toast
                    this.clear();
                    Toast.info('Carrinho limpo com sucesso!');
                }
            });
        }

        // Fechar carrinho ao clicar fora (mobile)
        if (cartSidebar) {
            cartSidebar.addEventListener('click', (e) => {
                if (e.target === cartSidebar) {
                    this.closeCart();
                }
            });
        }

        // Atualizar contador inicial
        this.updateCartButton();
    },

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
        }
    },

    openCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('open');
        }
    },

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
        }
    }
};

