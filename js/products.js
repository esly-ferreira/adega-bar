// Products Data and Management
const Products = {
    items: [],
    filteredItems: [],
    categories: [],
    currentCategory: 'all',

    init() {
        this.filteredItems = [...this.items];
        this.loadFromStorage();
        
        // Se não houver produtos, tentar carregar do arquivo padrão
        if (this.items.length === 0) {
            this.loadDefaultProducts();
        }
        
        this.organizeByCategories();
        this.render();
    },

    loadFromStorage() {
        const stored = localStorage.getItem('adega_products');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.items = parsed;
                    this.filteredItems = [...this.items];
                }
            } catch (e) {
                console.error('Erro ao carregar produtos do storage:', e);
            }
        }
    },

    saveToStorage() {
        localStorage.setItem('adega_products', JSON.stringify(this.items));
    },

    getCategoryFromName(name) {
        const nameUpper = name.toUpperCase();
        
        // Mapeamento de categorias baseado no nome
        if (nameUpper.includes('CERV') || nameUpper.includes('CERVEJA') || nameUpper.includes('BALDE')) {
            return 'CERVEJA';
        }
        if (nameUpper.includes('WHISKEY') || nameUpper.includes('WHISKY')) {
            return 'WHISKEY';
        }
        if (nameUpper.includes('GIN')) {
            return 'GIN';
        }
        if (nameUpper.includes('VODKA')) {
            return 'VODKA';
        }
        if (nameUpper.includes('VINHO')) {
            return 'VINHO';
        }
        if (nameUpper.includes('CACHAÇA') || nameUpper.includes('PINGA') || nameUpper.includes('PITU') || nameUpper.includes('VELHO') || nameUpper.includes('PARATUDO') || nameUpper.includes('COROTE') || nameUpper.includes('KARIRI') || nameUpper.includes('MARIA MOLE')) {
            return 'PINGA';
        }
        if (nameUpper.includes('DESTILADO') || nameUpper.includes('CONHAQUE') || nameUpper.includes('CAMPARI')) {
            return 'DESTILADOS';
        }
        if (nameUpper.includes('REFRI')) {
            return 'REFRIGERANTE';
        }
        if (nameUpper.includes('ENERG') || nameUpper.includes('RED BULL') || nameUpper.includes('MONSTER') || nameUpper.includes('TNT') || nameUpper.includes('VIBE') || nameUpper.includes('LA NUIT') || nameUpper.includes('BALY') || nameUpper.includes('FUNK')) {
            return 'ENERGÉTICO';
        }
        if (nameUpper.includes('ÁGUA') || nameUpper.includes('SUCO') || nameUpper.includes('GATORADE') || nameUpper.includes('GROSELHA') || nameUpper.includes('DEL VALLE')) {
            return 'ÁGUA/SUCO';
        }
        if (nameUpper.includes('ICE')) {
            return 'ICE';
        }
        if (nameUpper.includes('COMBO')) {
            return 'COMBOS';
        }
        if (nameUpper.includes('DOSE')) {
            return 'DOSES';
        }
        if (nameUpper.includes('NARGUILÉ') || nameUpper.includes('CARVÃO') || nameUpper.includes('ESSÊNCIA') || nameUpper.includes('ROSH') || nameUpper.includes('VASO') || nameUpper.includes('SEDA') || nameUpper.includes('FOGAREIRO') || nameUpper.includes('FURADOR') || nameUpper.includes('ABAFADOR') || nameUpper.includes('PEGADOR') || nameUpper.includes('BORRACHA') || nameUpper.includes('ALUMÍNIO') || nameUpper.includes('KIT')) {
            return 'NARGUILÉ';
        }
        if (nameUpper.includes('CIG') || nameUpper.includes('CIGARRO') || nameUpper.includes('ISQUEIRO') || nameUpper.includes('PALHEIRO')) {
            return 'CIGARROS';
        }
        if (nameUpper.includes('SALGADINHO') || nameUpper.includes('AMENDOIM') || nameUpper.includes('BALA') || nameUpper.includes('CHOCOL') || nameUpper.includes('CHICLETE') || nameUpper.includes('JUJUBA') || nameUpper.includes('PIRULITO') || nameUpper.includes('FINI') || nameUpper.includes('FREEGELLS')) {
            return 'SALGADOS/DOCES';
        }
        if (nameUpper.includes('GELO')) {
            return 'GELO';
        }
        if (nameUpper.includes('DRAFT') || nameUpper.includes('CHOPP')) {
            return 'CHOPP';
        }
        if (nameUpper.includes('BATIDA')) {
            return 'BATIDAS';
        }
        
        return 'OUTROS';
    },

    organizeByCategories() {
        // Organizar produtos por categoria
        const categoriesMap = {};
        
        this.items.forEach(product => {
            if (!product.category) {
                product.category = this.getCategoryFromName(product.name);
            }
            
            const cat = product.category;
            if (!categoriesMap[cat]) {
                categoriesMap[cat] = [];
            }
            categoriesMap[cat].push(product);
        });
        
        // Criar array de categorias ordenadas
        this.categories = Object.keys(categoriesMap).sort();
    },

    getProductsByCategory(category) {
        if (category === 'all') {
            return this.filteredItems;
        }
        return this.filteredItems.filter(p => p.category === category);
    },

    search(query) {
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) {
            this.filteredItems = [...this.items];
        } else {
            this.filteredItems = this.items.filter(product =>
                product.name.toLowerCase().includes(lowerQuery)
            );
        }
        this.render();
    },

    showSuggestions(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer || !query) {
            return;
        }

        const lowerQuery = query.toLowerCase();
        const matches = this.items
            .filter(product => 
                product.name.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 5); // Limitar a 5 sugestões

        if (matches.length > 0) {
            suggestionsContainer.innerHTML = matches.map((product, index) => {
                return `
                    <div class="suggestion-item" data-product-name="${product.name.replace(/"/g, '&quot;')}">
                        <i class="fas fa-search"></i>
                        <span>${this.highlightMatch(product.name, query)}</span>
                    </div>
                `;
            }).join('');
            
            // Adicionar event listeners
            suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    const productName = item.getAttribute('data-product-name');
                    this.selectSuggestion(productName);
                });
            });
            
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    },

    highlightMatch(text, query) {
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);
        
        if (index === -1) return text;
        
        const before = text.substring(0, index);
        const match = text.substring(index, index + query.length);
        const after = text.substring(index + query.length);
        
        return `${before}<strong>${match}</strong>${after}`;
    },

    selectSuggestion(productName) {
        const searchInput = document.getElementById('searchInput');
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (searchInput) {
            searchInput.value = productName;
            this.search(productName);
        }
        
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    },

    filterByCategory(category) {
        this.currentCategory = category;
        this.render();
        
        // Scroll suave para a categoria
        if (category !== 'all') {
            const categoryElement = document.getElementById(`category-${category}`);
            if (categoryElement) {
                categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    },

    renderCategories() {
        const nav = document.getElementById('categoriesNav');
        if (!nav) return;

        const categories = ['all', ...this.categories];
        
        nav.innerHTML = categories.map(cat => {
            const label = cat === 'all' ? 'Todos' : cat;
            const isActive = this.currentCategory === cat ? 'active' : '';
            return `
                <button class="category-btn ${isActive}" onclick="Products.filterByCategory('${cat}')">
                    ${label}
                </button>
            `;
        }).join('');
    },

    render() {
        const container = document.getElementById('productsContainer');
        const emptyState = document.getElementById('emptyState');

        if (!container) return;

        // Renderizar categorias
        this.renderCategories();

        if (this.filteredItems.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        if (this.currentCategory === 'all') {
            // Mostrar todas as categorias
            let html = '';
            this.categories.forEach(category => {
                const categoryProducts = this.getProductsByCategory(category);
                if (categoryProducts.length > 0) {
                    html += `
                        <div class="category-section" id="category-${category}">
                            <h2 class="category-title">${category}</h2>
                            <div class="products-grid">
                                ${categoryProducts.map(product => this.renderProduct(product)).join('')}
                            </div>
                        </div>
                    `;
                }
            });
            container.innerHTML = html;
        } else {
            // Mostrar apenas a categoria selecionada
            const categoryProducts = this.getProductsByCategory(this.currentCategory);
            container.innerHTML = `
                <div class="category-section" id="category-${this.currentCategory}">
                    <h2 class="category-title">${this.currentCategory}</h2>
                    <div class="products-grid">
                        ${categoryProducts.map(product => this.renderProduct(product)).join('')}
                    </div>
                </div>
            `;
        }
    },

    renderProduct(product) {
        return `
            <div class="product-card" data-product-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    <div class="product-actions">
                        <button class="btn-add" onclick="Products.addToCart(${product.id})">
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    addToCart(productId) {
        const product = this.items.find(p => p.id === productId);
        if (product) {
            Cart.addItem(product);
            
            // Micro-animação de feedback
            const card = document.querySelector(`[data-product-id="${productId}"]`);
            if (card) {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            }
        }
    },

    loadDefaultProducts() {
        // Carregar produtos padrão do arquivo produtos-adega.txt
        fetch('produtos-adega.txt')
            .then(response => {
                if (!response.ok) {
                    console.log('Arquivo produtos-adega.txt não encontrado. Use importProductsFromFile() para importar.');
                    return;
                }
                return response.text();
            })
            .then(text => {
                if (text) {
                    const count = this.importFromTXT(text);
                    console.log(`${count} produtos carregados automaticamente.`);
                }
            })
            .catch(error => {
                console.log('Erro ao carregar produtos padrão:', error);
                console.log('Use importProductsFromFile() no console para importar produtos.');
            });
    },

    importFromTXT(text) {
        // Formato esperado: Nome do Produto | Preço | Outras Informações (opcional)
        const lines = text.split('\n').filter(line => line.trim());
        const newProducts = [];

        lines.forEach((line, index) => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 2) {
                const name = parts[0];
                const priceStr = parts[1].replace(/[^\d,.-]/g, '').replace(',', '.');
                const price = parseFloat(priceStr);
                
                const otherInfo = parts[2] || '';
                const image = (otherInfo.startsWith('http://') || otherInfo.startsWith('https://')) 
                    ? otherInfo 
                    : 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=400&fit=crop';

                if (name && !isNaN(price) && price > 0) {
                    const category = this.getCategoryFromName(name);
                    newProducts.push({
                        id: Date.now() + index,
                        name,
                        price,
                        image,
                        category
                    });
                }
            }
        });

        if (newProducts.length > 0) {
            this.items = [...this.items, ...newProducts];
            this.filteredItems = [...this.items];
            this.organizeByCategories();
            this.saveToStorage();
            this.render();
            return newProducts.length;
        }
        return 0;
    }
};
