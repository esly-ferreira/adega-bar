// Products Data and Management
const Products = {
  items: [],
  filteredItems: [],
  categories: [],
  currentCategory: "all",

  init() {
    this.filteredItems = [...this.items];

    // SEMPRE carregar do arquivo primeiro (não usar localStorage para produtos)
    this.loadDefaultProducts();
  },

  loadFromStorage() {
    const stored = localStorage.getItem("adega_products");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.items = parsed;
          this.filteredItems = [...this.items];
        }
      } catch (e) {
        console.error("Erro ao carregar produtos do storage:", e);
      }
    }
  },

  saveToStorage() {
    localStorage.setItem("adega_products", JSON.stringify(this.items));
  },

  getCategoryFromName(name) {
    const nameUpper = name.toUpperCase();

    // Mapeamento de categorias baseado no nome
    if (
      nameUpper.includes("CERV") ||
      nameUpper.includes("CERVEJA") ||
      nameUpper.includes("BALDE")
    ) {
      return "CERVEJA";
    }
    if (nameUpper.includes("WHISKEY") || nameUpper.includes("WHISKY")) {
      return "WHISKEY";
    }
    if (nameUpper.includes("GIN")) {
      return "GIN";
    }
    if (nameUpper.includes("VODKA")) {
      return "VODKA";
    }
    if (nameUpper.includes("VINHO")) {
      return "VINHO";
    }
    if (
      nameUpper.includes("CACHAÇA") ||
      nameUpper.includes("PINGA") ||
      nameUpper.includes("PITU") ||
      nameUpper.includes("VELHO") ||
      nameUpper.includes("PARATUDO") ||
      nameUpper.includes("COROTE") ||
      nameUpper.includes("KARIRI") ||
      nameUpper.includes("MARIA MOLE")
    ) {
      return "PINGA";
    }
    if (
      nameUpper.includes("DESTILADO") ||
      nameUpper.includes("CONHAQUE") ||
      nameUpper.includes("CAMPARI")
    ) {
      return "DESTILADOS";
    }
    if (nameUpper.includes("REFRI")) {
      return "REFRIGERANTE";
    }
    if (
      nameUpper.includes("ENERG") ||
      nameUpper.includes("RED BULL") ||
      nameUpper.includes("MONSTER") ||
      nameUpper.includes("TNT") ||
      nameUpper.includes("VIBE") ||
      nameUpper.includes("LA NUIT") ||
      nameUpper.includes("BALY") ||
      nameUpper.includes("FUNK")
    ) {
      return "ENERGÉTICO";
    }
    if (
      nameUpper.includes("ÁGUA") ||
      nameUpper.includes("SUCO") ||
      nameUpper.includes("GATORADE") ||
      nameUpper.includes("GROSELHA") ||
      nameUpper.includes("DEL VALLE")
    ) {
      return "ÁGUA/SUCO";
    }
    if (nameUpper.includes("ICE")) {
      return "ICE";
    }
    if (nameUpper.includes("COMBO")) {
      return "COMBOS";
    }
    if (nameUpper.includes("DOSE")) {
      return "DOSES";
    }
    if (
      nameUpper.includes("NARGUILÉ") ||
      nameUpper.includes("CARVÃO") ||
      nameUpper.includes("ESSÊNCIA") ||
      nameUpper.includes("ROSH") ||
      nameUpper.includes("VASO") ||
      nameUpper.includes("SEDA") ||
      nameUpper.includes("FOGAREIRO") ||
      nameUpper.includes("FURADOR") ||
      nameUpper.includes("ABAFADOR") ||
      nameUpper.includes("PEGADOR") ||
      nameUpper.includes("BORRACHA") ||
      nameUpper.includes("ALUMÍNIO") ||
      nameUpper.includes("KIT")
    ) {
      return "NARGUILÉ";
    }
    if (
      nameUpper.includes("CIG") ||
      nameUpper.includes("CIGARRO") ||
      nameUpper.includes("ISQUEIRO") ||
      nameUpper.includes("PALHEIRO")
    ) {
      return "CIGARROS";
    }
    if (
      nameUpper.includes("SALGADINHO") ||
      nameUpper.includes("AMENDOIM") ||
      nameUpper.includes("BALA") ||
      nameUpper.includes("CHOCOL") ||
      nameUpper.includes("CHICLETE") ||
      nameUpper.includes("JUJUBA") ||
      nameUpper.includes("PIRULITO") ||
      nameUpper.includes("FINI") ||
      nameUpper.includes("FREEGELLS")
    ) {
      return "SALGADOS/DOCES";
    }
    if (nameUpper.includes("GELO")) {
      return "GELO";
    }
    if (nameUpper.includes("DRAFT") || nameUpper.includes("CHOPP")) {
      return "CHOPP";
    }
    if (nameUpper.includes("BATIDA")) {
      return "BATIDAS";
    }

    return "OUTROS";
  },

  organizeByCategories() {
    // Organizar produtos por categoria
    const categoriesMap = {};

    this.items.forEach((product) => {
      if (!product.category) {
        product.category = this.getCategoryFromName(product.name);
      }

      const cat = product.category;
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = [];
      }
      categoriesMap[cat].push(product);
    });

    // Ordem customizada das categorias
    const categoryOrder = [
      "CERVEJA",
      "CHOPP",
      "COMBOS",
      "DOSES",
      "ENERGÉTICO",
      "GELO",
      "ICE",
      "REFRIGERANTE",
      "ÁGUA/SUCO",
      "BATIDAS",
    ];

    // Criar array de categorias na ordem especificada
    const orderedCategories = [];
    const allCategories = Object.keys(categoriesMap);

    // Adicionar categorias na ordem especificada
    categoryOrder.forEach((category) => {
      if (allCategories.includes(category)) {
        orderedCategories.push(category);
      }
    });

    // Adicionar categorias restantes que não estão na ordem especificada (em ordem alfabética)
    const remainingCategories = allCategories
      .filter((cat) => !categoryOrder.includes(cat))
      .sort();
    orderedCategories.push(...remainingCategories);

    this.categories = orderedCategories;
  },

  getProductsByCategory(category) {
    if (category === "all") {
      return this.filteredItems;
    }
    return this.filteredItems.filter((p) => p.category === category);
  },

  search(query) {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter((product) =>
        product.name.toLowerCase().includes(lowerQuery)
      );
    }
    this.render();
  },

  showSuggestions(query) {
    const suggestionsContainer = document.getElementById("searchSuggestions");
    if (!suggestionsContainer || !query) {
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matches = this.items
      .filter((product) => product.name.toLowerCase().includes(lowerQuery))
      .slice(0, 5); // Limitar a 5 sugestões

    if (matches.length > 0) {
      suggestionsContainer.innerHTML = matches
        .map((product, index) => {
          return `
                    <div class="suggestion-item" data-product-name="${product.name.replace(
                      /"/g,
                      "&quot;"
                    )}">
                        <i class="fas fa-search"></i>
                        <span>${this.highlightMatch(product.name, query)}</span>
                    </div>
                `;
        })
        .join("");

      // Adicionar event listeners
      suggestionsContainer
        .querySelectorAll(".suggestion-item")
        .forEach((item, index) => {
          item.addEventListener("click", () => {
            const productName = item.getAttribute("data-product-name");
            this.selectSuggestion(productName);
          });
        });

      suggestionsContainer.style.display = "block";
    } else {
      suggestionsContainer.style.display = "none";
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
    const searchInput = document.getElementById("searchInput");
    const suggestionsContainer = document.getElementById("searchSuggestions");

    if (searchInput) {
      searchInput.value = productName;
      this.search(productName);
    }

    if (suggestionsContainer) {
      suggestionsContainer.style.display = "none";
    }
  },

  filterByCategory(category) {
    this.currentCategory = category;
    this.render();

    // Scroll suave para a categoria
    if (category !== "all") {
      const categoryElement = document.getElementById(`category-${category}`);
      if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  },

  renderCategories() {
    const nav = document.getElementById("categoriesNav");
    if (!nav) return;

    const categories = ["all", ...this.categories];

    nav.innerHTML = categories
      .map((cat) => {
        const label = cat === "all" ? "Todos" : cat;
        const isActive = this.currentCategory === cat ? "active" : "";
        return `
                <button class="category-btn ${isActive}" onclick="Products.filterByCategory('${cat}')">
                    ${label}
                </button>
            `;
      })
      .join("");
  },

  render() {
    const container = document.getElementById("productsContainer");
    const emptyState = document.getElementById("emptyState");

    if (!container) return;

    // Renderizar categorias
    this.renderCategories();

    if (this.filteredItems.length === 0) {
      container.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    if (this.currentCategory === "all") {
      // Mostrar todas as categorias
      let html = "";
      this.categories.forEach((category) => {
        const categoryProducts = this.getProductsByCategory(category);
        if (categoryProducts.length > 0) {
          html += `
                        <div class="category-section" id="category-${category}">
                            <h2 class="category-title">${category}</h2>
                            <div class="products-grid">
                                ${categoryProducts
                                  .map((product) => this.renderProduct(product))
                                  .join("")}
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
                <div class="category-section" id="category-${
                  this.currentCategory
                }">
                    <h2 class="category-title">${this.currentCategory}</h2>
                    <div class="products-grid">
                        ${categoryProducts
                          .map((product) => this.renderProduct(product))
                          .join("")}
                    </div>
                </div>
            `;
    }
  },

  renderProduct(product) {
    const isOpen = Schedule && Schedule.isOpen ? Schedule.isOpen() : true;
    const disabledClass = !isOpen ? "disabled" : "";
    const disabledAttr = !isOpen ? "disabled" : "";

    // Categorias que devem ter o ícone de floco de neve (bebidas geladas)
    const coldCategories = [
      "CERVEJA",
      "CHOPP",
      "COMBOS",
      "DOSES",
      "ENERGÉTICO",
      "GELO",
      "ICE",
      "REFRIGERANTE",
      "ÁGUA/SUCO",
      "BATIDAS",
    ];

    const showSnowflake = coldCategories.includes(product.category);

    return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${
      product.name
    }" class="product-image" loading="lazy" 
                    onerror="this.onerror=null; Products.handleImageError(this, '${
                      product.code || ""
                    }')">
                    ${
                      showSnowflake
                        ? '<i class="fas fa-snowflake cold-icon"></i>'
                        : ""
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    ${
                      product.price === 0
                        ? '<p class="product-unavailable">Não está disponível no site</p>'
                        : `<p class="product-price">R$ ${product.price
                            .toFixed(2)
                            .replace(".", ",")}</p>`
                    }
                    <div class="product-actions">
                        ${
                          product.price === 0
                            ? '<button class="btn-add disabled" disabled>Indisponível</button>'
                            : `<button class="btn-add ${disabledClass}" onclick="Products.addToCart(${product.id})" ${disabledAttr}>Adicionar</button>`
                        }
                    </div>
                    ${
                      product.code
                        ? `<p class="product-code">Código: ${product.code}</p>`
                        : ""
                    }
                </div>
            </div>
        `;
  },

  addToCart(productId) {
    // Verificar se está aberto antes de adicionar
    if (!Schedule.isOpen()) {
      Schedule.showClosedModal();
      return;
    }

    const product = this.items.find((p) => p.id === productId);
    if (product) {
      // Verificar se o produto está disponível (preço > 0)
      if (product.price === 0) {
        return; // Não adicionar produtos indisponíveis
      }
      Cart.addItem(product);

      // Micro-animação de feedback
      const card = document.querySelector(`[data-product-id="${productId}"]`);
      if (card) {
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
          card.style.transform = "";
        }, 150);
      }
    }
  },

  loadDefaultProducts() {
    // Carregar produtos sempre do arquivo produtos-adega.txt
    fetch("produtos-adega.txt?" + new Date().getTime()) // Cache busting para sempre pegar versão atualizada
      .then((response) => {
        if (!response.ok) {
          console.log("Arquivo produtos-adega.txt não encontrado.");
          // Se não encontrar arquivo, tentar carregar do storage como fallback
          this.loadFromStorage();
          this.organizeByCategories();
          this.render();
          return;
        }
        return response.text();
      })
      .then((text) => {
        if (text) {
          // Limpar produtos antigos
          this.items = [];
          this.filteredItems = [];

          // Importar do arquivo
          const count = this.importFromTXT(text);
          console.log(
            `${count} produtos carregados do arquivo produtos-adega.txt`
          );

          // Organizar e renderizar
          this.organizeByCategories();
          this.render();
        }
      })
      .catch((error) => {
        console.log("Erro ao carregar produtos:", error);
        // Fallback: tentar carregar do storage
        this.loadFromStorage();
        this.organizeByCategories();
        this.render();
      });
  },

  // Função para gerar o caminho da imagem baseado no código
  getImagePath(code) {
    if (!code) return null; // Retornar null para produtos sem código
    // Tentar webp primeiro (mais moderno e eficiente), depois png
    return `images/${code}.webp`;
  },

  // Função para lidar com erro de imagem
  handleImageError(img, code) {
    if (!code) {
      this.showBeerIcon(img);
      return;
    }

    // Tentar diferentes extensões
    const extensions = ["webp", "png", "jpg", "jpeg"];
    const currentSrc = img.src || "";
    const currentExt = currentSrc.split(".").pop()?.toLowerCase().split("?")[0];
    const currentIndex = extensions.indexOf(currentExt);

    // Tentar próxima extensão
    if (currentIndex < extensions.length - 1) {
      const nextExt = extensions[currentIndex + 1];
      // Garantir que o onerror será chamado novamente
      img.onerror = () => {
        img.onerror = null;
        this.handleImageError(img, code);
      };
      img.src = `images/${code}.${nextExt}`;
    } else {
      // Se todas as extensões falharam, mostrar ícone de cerveja
      this.showBeerIcon(img);
    }
  },

  // Função para mostrar ícone de garrafa de cerveja quando imagem não for encontrada
  showBeerIcon(img) {
    if (!img) return;

    // Prevenir múltiplas chamadas
    if (img.dataset.beerIconShown === "true") return;
    img.dataset.beerIconShown = "true";

    // Esconder a imagem
    img.style.display = "none";
    img.style.visibility = "hidden";

    // Criar ou obter o wrapper
    const wrapper = img.parentElement;
    if (!wrapper) return;

    // Verificar se já existe um ícone
    let iconElement = wrapper.querySelector(".beer-icon-fallback");
    if (!iconElement) {
      // Criar o ícone
      iconElement = document.createElement("div");
      iconElement.className = "beer-icon-fallback";
      iconElement.innerHTML = '<i class="fas fa-wine-bottle"></i>';
      wrapper.appendChild(iconElement);
    }

    // Garantir que o ícone seja visível
    iconElement.style.display = "flex";
  },

  importFromTXT(text) {
    // Formato esperado: Nome do Produto | Código | Preço
    // Ou formato antigo: Nome do Produto | Preço (para compatibilidade)
    const lines = text.split("\n").filter((line) => line.trim());
    const newProducts = [];

    lines.forEach((line, index) => {
      const parts = line.split("|").map((p) => p.trim());

      let name, code, price;

      if (parts.length >= 3) {
        // Novo formato: Nome | Código | Preço
        name = parts[0];
        code = parts[1];
        const priceStr = parts[2].replace(/[^\d,.-]/g, "").replace(",", ".");
        price = parseFloat(priceStr);
      } else if (parts.length >= 2) {
        // Formato antigo: Nome | Preço (compatibilidade)
        name = parts[0];
        code = null;
        const priceStr = parts[1].replace(/[^\d,.-]/g, "").replace(",", ".");
        price = parseFloat(priceStr);
      }

      if (name && !isNaN(price) && price >= 0) {
        const category = this.getCategoryFromName(name);
        const image = code ? this.getImagePath(code) : null;

        newProducts.push({
          id: Date.now() + index,
          name,
          code: code || null,
          price,
          image:
            image ||
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3C/svg%3E",
          category,
        });
      }
    });

    if (newProducts.length > 0) {
      this.items = newProducts; // Substituir completamente (não adicionar aos existentes)
      this.filteredItems = [...this.items];
      this.organizeByCategories();
      // NÃO salvar no localStorage - sempre usar o arquivo como fonte de verdade
      this.render();
      return newProducts.length;
    }
    return 0;
  },
};
