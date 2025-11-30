// Schedule Management
const Schedule = {
    init() {
        this.updateStatus();
        this.checkStoreStatus();
        
        // Atualizar status a cada minuto
        setInterval(() => {
            this.updateStatus();
            this.checkStoreStatus();
        }, 60000);
    },

    isOpen() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Domingo, 6 = Sábado
        const currentSchedule = ScheduleConfig.schedule[dayOfWeek];
        
        if (!currentSchedule || !currentSchedule.enabled) {
            return false;
        }

        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const [openHour, openMin] = currentSchedule.open.split(':').map(Number);
        const [closeHour, closeMin] = currentSchedule.close.split(':').map(Number);
        
        const openTime = new Date();
        openTime.setHours(openHour, openMin, 0, 0);
        
        const closeTime = new Date();
        closeTime.setHours(closeHour, closeMin, 0, 0);
        
        // Se o horário de fechamento é antes da abertura (ex: 22:00 - 02:00), 
        // significa que fecha no dia seguinte
        if (closeTime < openTime) {
            closeTime.setDate(closeTime.getDate() + 1);
        }
        
        return now >= openTime && now < closeTime;
    },

    updateStatus() {
        const indicator = document.getElementById('statusIndicator');
        const dot = indicator?.querySelector('.status-dot');
        const text = indicator?.querySelector('.status-text');
        
        if (!indicator || !dot || !text) return;

        const isOpen = this.isOpen();
        
        if (isOpen) {
            dot.classList.add('open');
            text.textContent = 'Aberto';
        } else {
            dot.classList.remove('open');
            text.textContent = 'Fechado';
        }
    },

    checkStoreStatus() {
        const isOpen = this.isOpen();
        
        if (!isOpen) {
            // Mostrar modal de fechado apenas uma vez por sessão
            const hasShownModal = sessionStorage.getItem('closedModalShown');
            if (!hasShownModal) {
                this.showClosedModal();
                sessionStorage.setItem('closedModalShown', 'true');
            }
            
            // Desabilitar adição ao carrinho
            this.disableCart();
        } else {
            // Habilitar adição ao carrinho
            this.enableCart();
        }
    },

    showClosedModal() {
        const modal = document.getElementById('closedStoreModal');
        const nextOpeningInfo = document.getElementById('nextOpeningInfo');
        
        if (!modal || !nextOpeningInfo) return;

        const nextSchedule = ScheduleConfig.getNextOpeningTime();
        
        if (nextSchedule) {
            let message = '';
            if (nextSchedule.isToday) {
                message = `Abrimos hoje (${nextSchedule.dayName}) às ${nextSchedule.time}.`;
            } else {
                message = `Abrimos ${nextSchedule.dayName} às ${nextSchedule.time}.`;
            }
            
            nextOpeningInfo.textContent = message;
        } else {
            nextOpeningInfo.textContent = 'Não há horário de atendimento disponível.';
        }

        modal.style.display = 'flex';
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
    },

    hideClosedModal() {
        const modal = document.getElementById('closedStoreModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    disableCart() {
        // Desabilitar botões de adicionar ao carrinho
        const addButtons = document.querySelectorAll('.btn-add');
        addButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
            btn.title = 'Estabelecimento fechado';
        });
        
        // Desabilitar botão de finalizar compra
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('disabled');
            checkoutBtn.title = 'Estabelecimento fechado';
        }
    },

    enableCart() {
        // Habilitar botões de adicionar ao carrinho
        const addButtons = document.querySelectorAll('.btn-add');
        addButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
            btn.title = '';
        });
        
        // Habilitar botão de finalizar compra se necessário
        if (typeof Cart !== 'undefined' && Cart.items && Cart.items.length > 0) {
            const total = Cart.getTotal();
            const checkoutBtn = document.getElementById('checkoutBtn');
            if (checkoutBtn && total >= 15.00) {
                checkoutBtn.disabled = false;
                checkoutBtn.classList.remove('disabled');
            }
        }
    }
};

// Event listener para fechar modal
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeClosedModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            Schedule.hideClosedModal();
        });
    }
    
    const closedModal = document.getElementById('closedStoreModal');
    if (closedModal) {
        closedModal.addEventListener('click', (e) => {
            if (e.target === closedModal) {
                Schedule.hideClosedModal();
            }
        });
    }
});
