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
    },

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (searchInput && suggestionsContainer) {
            let searchTimeout;
            let hideTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                clearTimeout(hideTimeout);
                const query = e.target.value.trim();
                
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
        if (!Schedule.isOpen()) {
            // Desabilitar adição ao carrinho se estiver fechado
            // (opcional - pode ser removido se quiser permitir pedidos mesmo fechado)
            console.log('Loja está fechada');
        }
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
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

