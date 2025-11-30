// Schedule Management
const Schedule = {
    // Horários fixos por dia da semana
    schedule: {
        0: { open: '09:30', close: '22:00' }, // Domingo
        1: { open: '15:00', close: '21:00' }, // Segunda
        2: { open: '15:00', close: '21:00' }, // Terça
        3: { open: '15:00', close: '21:00' }, // Quarta
        4: { open: '15:00', close: '21:00' }, // Quinta
        5: { open: '09:30', close: '23:30' }, // Sexta
        6: { open: '09:30', close: '23:30' }  // Sábado
    },

    init() {
        this.updateStatus();
        
        // Atualizar status a cada minuto
        setInterval(() => this.updateStatus(), 60000);
    },

    isOpen() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Domingo, 6 = Sábado
        const currentSchedule = this.schedule[dayOfWeek];
        
        if (!currentSchedule) {
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
    }
};
