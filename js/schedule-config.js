// Configuração de Horários de Atendimento
const ScheduleConfig = {
  // Horários por dia da semana (0 = Domingo, 6 = Sábado)
  schedule: {
    0: {
      // Domingo
      open: "09:30",
      close: "22:00",
      enabled: true,
    },
    1: {
      // Segunda-feira
      open: "15:00",
      close: "21:00",
      enabled: true,
    },
    2: {
      // Terça-feira
      open: "15:00",
      close: "21:00",
      enabled: true,
    },
    3: {
      // Quarta-feira
      open: "15:00",
      close: "21:00",
      enabled: true,
    },
    4: {
      // Quinta-feira
      open: "15:00",
      close: "21:00",
      enabled: true,
    },
    5: {
      // Sexta-feira
      open: "09:30",
      close: "23:30",
      enabled: true,
    },
    6: {
      // Sábado
      open: "09:30",
      close: "23:59",
      enabled: true,
    },
  },

  // Nomes dos dias da semana
  dayNames: {
    0: "Domingo",
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
  },

  // Obter próximo horário de atendimento
  getNextOpeningTime() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // Verificar se hoje ainda vai abrir
    const todaySchedule = this.schedule[currentDay];
    if (
      todaySchedule &&
      todaySchedule.enabled &&
      currentTime < todaySchedule.open
    ) {
      return {
        day: currentDay,
        dayName: this.dayNames[currentDay],
        time: todaySchedule.open,
        isToday: true,
      };
    }

    // Procurar próximo dia com atendimento habilitado
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const schedule = this.schedule[checkDay];

      if (schedule && schedule.enabled) {
        return {
          day: checkDay,
          dayName: this.dayNames[checkDay],
          time: schedule.open,
          isToday: false,
          daysFromNow: i,
        };
      }
    }

    return null;
  },
};
