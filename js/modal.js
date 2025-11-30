// Modal Management
const Modal = {
    map: null,
    marker: null,
    userLocation: null,

    init() {
        this.setupEventListeners();
        this.initMap();
        this.setupInputValidations();
    },

    initMap() {
        // Inicializar mapa quando o modal for aberto
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        // Se o mapa já foi inicializado, apenas atualizar a visualização
        if (this.map) {
            this.map.invalidateSize();
            return;
        }

        try {
            // Coordenadas padrão (centro do Brasil - pode ajustar)
            this.map = L.map('map').setView([-14.2350, -51.9253], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            // Adicionar marcador inicial
            this.marker = L.marker([-14.2350, -51.9253], { draggable: true }).addTo(this.map);
            
            // Atualizar localização quando o marcador for arrastado
            this.marker.on('dragend', (e) => {
                const position = this.marker.getLatLng();
                this.userLocation = { lat: position.lat, lng: position.lng };
            });

            // Atualizar marcador quando clicar no mapa
            this.map.on('click', (e) => {
                this.marker.setLatLng(e.latlng);
                this.userLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
            });
        } catch (error) {
            console.error('Erro ao inicializar mapa:', error);
        }
    },

    setupInputValidations() {
        // Validação de nome - apenas letras e espaços
        const nameInput = document.getElementById('customerName');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                let value = e.target.value;
                // Remover números e caracteres especiais, manter apenas letras, espaços e acentos
                value = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
                e.target.value = value;
                this.clearError('nameError');
            });
        }

        // Validação e formatação de telefone
        const phoneInput = document.getElementById('customerPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value;
                // Remover tudo que não for número
                value = value.replace(/\D/g, '');
                
                // Formatar como telefone brasileiro: (11) 99999-9999
                if (value.length > 0) {
                    if (value.length <= 2) {
                        value = `(${value}`;
                    } else if (value.length <= 7) {
                        value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                    } else {
                        value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
                    }
                }
                
                e.target.value = value;
                this.clearError('phoneError');
            });
        }

    },

    setupEventListeners() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');
        const cancelBtn = document.getElementById('cancelBtn');
        const checkoutForm = document.getElementById('checkoutForm');
        const getLocationBtn = document.getElementById('getLocationBtn');

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
                e.stopPropagation();
                console.log('Formulário submetido');
                this.handleCheckout();
            });
        }

        if (getLocationBtn) {
            getLocationBtn.addEventListener('click', () => {
                this.getUserLocation();
            });
        }
    },

    getUserLocation() {
        const btn = document.getElementById('getLocationBtn');
        if (!btn) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obtendo localização...';

        if (!navigator.geolocation) {
            alert('Geolocalização não é suportada pelo seu navegador.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Usar Minha Localização';
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                this.userLocation = { lat, lng };
                
                // Atualizar mapa
                if (this.map && this.marker) {
                    this.map.setView([lat, lng], 15);
                    this.marker.setLatLng([lat, lng]);
                }

                // Tentar buscar endereço via reverse geocoding (opcional)
                this.reverseGeocode(lat, lng);

                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check"></i> Localização obtida!';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Usar Minha Localização';
                }, 2000);
            },
            (error) => {
                alert('Erro ao obter localização. Por favor, selecione manualmente no mapa.');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Usar Minha Localização';
            }
        );
    },

    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            
            if (data && data.address) {
                const addr = data.address;
                
                // Preencher campos automaticamente se disponível
                if (addr.road) document.getElementById('customerStreet').value = addr.road;
                if (addr.house_number) document.getElementById('customerNumber').value = addr.house_number;
                if (addr.suburb || addr.neighbourhood) {
                    document.getElementById('customerNeighborhood').value = addr.suburb || addr.neighbourhood;
                }
            }
        } catch (error) {
            console.log('Erro ao buscar endereço:', error);
        }
    },

    showError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    },

    clearError(fieldId) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    },

    openCheckout() {
        // Verificar se está aberto antes de abrir checkout
        if (typeof Schedule !== 'undefined' && !Schedule.isOpen()) {
            Schedule.showClosedModal();
            return;
        }

        const modalOverlay = document.getElementById('modalOverlay');
        const cartSidebar = document.getElementById('cartSidebar');
        
        if (modalOverlay) {
            // Fechar carrinho se estiver aberto
            if (cartSidebar) {
                cartSidebar.classList.remove('open');
            }
            
            modalOverlay.style.display = 'flex';
            
            // Prevenir scroll do body quando modal estiver aberto
            document.body.style.overflow = 'hidden';
            
            // Limpar formulário
            const form = document.getElementById('checkoutForm');
            if (form) {
                form.reset();
                this.userLocation = null;
            }

            // Reinicializar mapa se necessário
            setTimeout(() => {
                this.initMap();
                if (this.map) {
                    // Resetar mapa para posição padrão
                    this.map.setView([-14.2350, -51.9253], 13);
                    if (this.marker) {
                        this.marker.setLatLng([-14.2350, -51.9253]);
                    }
                    // Invalidar tamanho para garantir que o mapa renderize corretamente
                    setTimeout(() => {
                        if (this.map) {
                            this.map.invalidateSize();
                        }
                    }, 200);
                }
            }, 100);

            // Limpar erros
            const errorElements = document.querySelectorAll('.form-error');
            errorElements.forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });

            // Scroll suave para o topo do modal no mobile
            setTimeout(() => {
                const modalContent = document.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    },

    closeCheckout() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
            // Restaurar scroll do body
            document.body.style.overflow = '';
        }
    },

    handleCheckout() {
        console.log('handleCheckout chamado');
        
        // Limpar erros anteriores
        document.querySelectorAll('.form-error').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });

        // Obter valores dos campos
        const name = document.getElementById('customerName')?.value.trim();
        const phone = document.getElementById('customerPhone')?.value.trim();
        const street = document.getElementById('customerStreet')?.value.trim();
        const number = document.getElementById('customerNumber')?.value.trim();
        const complement = document.getElementById('customerComplement')?.value.trim();
        const neighborhood = document.getElementById('customerNeighborhood')?.value.trim();
        const payment = document.getElementById('paymentMethod')?.value;

        console.log('Valores do formulário:', { name, phone, street, number, neighborhood, payment });
        console.log('Itens no carrinho:', Cart.items);

        let hasError = false;

        // Validações
        if (!name || name.length < 3) {
            this.showError('nameError', 'Nome deve ter pelo menos 3 caracteres');
            hasError = true;
        }

        // Remover formatação para validar
        const phoneDigits = phone.replace(/\D/g, '');
        if (!phoneDigits || phoneDigits.length < 10) {
            this.showError('phoneError', 'Telefone deve ter pelo menos 10 dígitos');
            hasError = true;
        }

        if (!street) {
            this.showError('streetError', 'Rua é obrigatória');
            hasError = true;
        }

        if (!number) {
            this.showError('numberError', 'Número é obrigatório');
            hasError = true;
        }

        if (!neighborhood) {
            this.showError('neighborhoodError', 'Bairro é obrigatório');
            hasError = true;
        }

        if (!payment) {
            this.showError('paymentError', 'Selecione uma forma de pagamento');
            hasError = true;
        }

        console.log('hasError:', hasError);

        // Verificar se o carrinho está vazio
        if (!Cart.items || Cart.items.length === 0) {
            alert('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
            return;
        }

        // Verificar valor mínimo de entrega (R$ 15,00)
        const total = Cart.getTotal();
        const minDeliveryValue = 15.00;
        if (total < minDeliveryValue) {
            const missing = (minDeliveryValue - total).toFixed(2).replace('.', ',');
            alert(`Valor mínimo de entrega é R$ ${minDeliveryValue.toFixed(2).replace('.', ',')}.\nVocê precisa adicionar mais R$ ${missing} em produtos.`);
            return;
        }

        if (hasError) {
            return;
        }

        // Montar endereço completo
        let address = `${street}, ${number}`;
        if (complement) {
            address += ` - ${complement}`;
        }
        address += `, ${neighborhood}`;

        // Preparar dados do pedido (phoneDigits já foi declarado acima)
        const orderData = {
            customer: {
                name,
                phone: phoneDigits,
                phoneFormatted: phone,
                address,
                street,
                number,
                complement,
                neighborhood,
                location: this.userLocation
            },
            payment,
            items: Cart.items,
            total: Cart.getTotal(),
            date: new Date().toLocaleString('pt-BR')
        };

        try {
            // Enviar via WhatsApp
            WhatsApp.sendOrder(orderData);

            // Limpar carrinho
            Cart.clear();

            // Fechar modal
            this.closeCheckout();

            // Feedback
            alert('Pedido enviado com sucesso! Você será redirecionado para o WhatsApp.');
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            alert('Erro ao finalizar pedido. Por favor, tente novamente.');
        }
    }
};

