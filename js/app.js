// Main Application
const App = {
    init() {
        // Inicializar todos os módulos
        Products.init();
        Schedule.init();
        Cart.init();
        Modal.init();
        WhatsApp.init();
        
        // Configurar busca
        this.setupSearch();
        
        // Verificar se está aberto antes de permitir compras
        this.checkStoreStatus();
        
        // Destacar dia atual no rodapé
        this.highlightToday();
    },

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (searchInput && suggestionsContainer) {
            let searchTimeout;
            let hideTimeout;
            let wasEmpty = true; // Rastreia se o campo estava vazio antes
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                clearTimeout(hideTimeout);
                const query = e.target.value.trim();
                const isEmpty = query.length === 0;
                
                // Se estava vazio e agora tem conteúdo, rolar para o topo
                if (wasEmpty && !isEmpty) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                wasEmpty = isEmpty;
                
                // Mostrar sugestões enquanto digita
                if (query.length > 0) {
                    Products.showSuggestions(query);
                } else {
                    suggestionsContainer.style.display = 'none';
                    Products.search('');
                }
                
                // Debounce para busca completa (sem fechar sugestões)
                searchTimeout = setTimeout(() => {
                    Products.search(query);
                }, 500);
            });

            // Fechar sugestões ao clicar fora (com delay)
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                    clearTimeout(hideTimeout);
                    hideTimeout = setTimeout(() => {
                        suggestionsContainer.style.display = 'none';
                    }, 200);
                }
            });

            // Manter sugestões visíveis ao focar no input
            searchInput.addEventListener('focus', () => {
                clearTimeout(hideTimeout);
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    Products.showSuggestions(query);
                }
            });

            // Fechar sugestões ao pressionar Enter
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(hideTimeout);
                    hideTimeout = setTimeout(() => {
                        suggestionsContainer.style.display = 'none';
                    }, 300);
                }
            });
        }
    },

    checkStoreStatus() {
        // Verificar status ao carregar
        // O Schedule.checkStoreStatus() já faz isso automaticamente
    },

    highlightToday() {
        const scheduleItems = document.querySelectorAll('.schedule-item');
        const today = new Date().getDay(); // 0 = Domingo, 6 = Sábado
        
        // Mapear dias da semana para os itens do rodapé
        const dayMap = {
            0: 0, // Domingo
            1: 1, // Segunda-feira
            2: 2, // Terça-feira
            3: 3, // Quarta-feira
            4: 4, // Quinta-feira
            5: 5, // Sexta-feira
            6: 6  // Sábado
        };
        
        const todayIndex = dayMap[today];
        if (scheduleItems[todayIndex]) {
            scheduleItems[todayIndex].classList.add('schedule-item-today');
        }
    }
};

// Função para esconder tela de carregamento
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        // Aguardar um pouco para garantir que tudo carregou
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Remover do DOM após animação
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }, 800);
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
        // Aguardar carregamento completo
        window.addEventListener('load', hideLoadingScreen);
    });
} else {
    App.init();
    // Se já estiver carregado, aguardar um pouco antes de esconder
    if (document.readyState === 'complete') {
        hideLoadingScreen();
    } else {
        window.addEventListener('load', hideLoadingScreen);
    }
}

// Expor WhatsApp.configure globalmente para fácil acesso
window.configureWhatsApp = () => {
    WhatsApp.configure();
};

// Função para importar produtos via TXT (pode ser chamada via console)
window.importProducts = (text) => {
    const count = Products.importFromTXT(text);
    alert(`${count} produto(s) importado(s) com sucesso!`);
    return count;
};

// Função para abrir leitor de arquivo TXT
window.importProductsFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const count = Products.importFromTXT(text);
                alert(`${count} produto(s) importado(s) com sucesso!`);
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
};

