const fallbackCategorias = [
  {
    idCategoria: 1,
    nombreCategoria: 'Ropa deportiva',
    slug: 'ropa-deportiva',
    descripcion: 'Camisetas, pantalones y ropa técnica para entrenar.',
    imagenUrl: '/img/categorias/ropa_deportiva.jpg',
  },
  {
    idCategoria: 2,
    nombreCategoria: 'Calzado',
    slug: 'calzado',
    descripcion: 'Zapatillas y calzado deportivo cómodo.',
    imagenUrl: '/img/categorias/calzado_deportivo.jpg',
  },
  {
    idCategoria: 3,
    nombreCategoria: 'Accesorios',
    slug: 'accesorios',
    descripcion: 'Mochilas y complementos para tu actividad.',
    imagenUrl: '/img/categorias/accesorios_deportivos.jpg',
  },
  {
    idCategoria: 4,
    nombreCategoria: 'Equipamiento',
    slug: 'equipamiento',
    descripcion: 'Material para entrenamiento y fuerza.',
    imagenUrl: '/img/categorias/equipamiento_deportivo.jpg',
  },
  {
    idCategoria: 5,
    nombreCategoria: 'Suplementos',
    slug: 'suplementos',
    descripcion: 'Nutrición deportiva y recuperación muscular.',
    imagenUrl: '/img/categorias/suplementos_deportivos.jpg',
  },
];

const fallbackProductos = [
  {
    idProducto: 1,
    nombre: 'Camiseta Nike Dri-FIT',
    tipoPrenda: 'Ropa deportiva',
    descripcion: 'Camiseta transpirable para entrenamiento diario.',
    composicion: 'Poliéster técnico transpirable',
    instruccionesLavado: 'Lavar a 30 grados, no usar lejía y secar al aire.',
    consejos: 'Evitar plancha directa sobre estampados.',
    color: 'Negro',
    precio: 24.99,
    stock: 40,
    imagen: '/img/productos/camiseta_nike.jpg',
    categoria: fallbackCategorias[0],
  },
  {
    idProducto: 2,
    nombre: 'Zapatillas Adidas Run',
    tipoPrenda: 'Calzado',
    descripcion: 'Zapatillas ligeras para running y gimnasio.',
    composicion: 'Malla textil, goma y espuma EVA',
    instruccionesLavado: 'Limpiar con paño húmedo y no meter en lavadora.',
    consejos: 'Airear después de entrenar.',
    color: 'Blanco',
    precio: 69.99,
    stock: 25,
    imagen: '/img/productos/zapatillas_adidas.jpg',
    categoria: fallbackCategorias[1],
  },
  {
    idProducto: 3,
    nombre: 'Mochila Puma Training',
    tipoPrenda: 'Accesorios',
    descripcion: 'Mochila deportiva con compartimentos amplios.',
    composicion: 'Poliéster resistente',
    instruccionesLavado: 'Limpiar a mano con agua fría.',
    consejos: 'No sobrecargar las cremalleras.',
    color: 'Azul',
    precio: 34.99,
    stock: 18,
    imagen: '/img/productos/mochila_puma.jpg',
    categoria: fallbackCategorias[2],
  },
  {
    idProducto: 4,
    nombre: 'Set de pesas 10 kg',
    tipoPrenda: 'Equipamiento',
    descripcion: 'Kit de mancuernas para fuerza y tonificación.',
    composicion: 'Hierro y recubrimiento protector',
    instruccionesLavado: 'Limpiar con paño seco tras cada uso.',
    consejos: 'Guardar en una superficie estable.',
    color: 'Negro',
    precio: 44.99,
    stock: 12,
    imagen: '/img/productos/pesas_10kg.jpg',
    categoria: fallbackCategorias[3],
  },
  {
    idProducto: 5,
    nombre: 'Proteína Whey Sport',
    tipoPrenda: 'Suplementos',
    descripcion: 'Suplemento proteico para recuperación muscular.',
    composicion: 'Proteína de suero, aromas y edulcorante',
    instruccionesLavado: 'Cerrar bien el envase y mantener seco.',
    consejos: 'Conservar alejado del calor y la humedad.',
    color: 'Vainilla',
    precio: 29.99,
    stock: 30,
    imagen: '/img/productos/proteina_whey.jpg',
    categoria: fallbackCategorias[4],
  },
];

const legacyCategoryImages = Object.fromEntries(
  fallbackCategorias.flatMap((categoria) => [
    [String(categoria.idCategoria), categoria.imagenUrl],
    [categoria.slug, categoria.imagenUrl],
  ]),
);

const productImageByCategory = {
  'ropa-deportiva': '/img/productos/camiseta_nike.jpg',
  calzado: '/img/productos/zapatillas_adidas.jpg',
  accesorios: '/img/productos/mochila_puma.jpg',
  equipamiento: '/img/productos/pesas_10kg.jpg',
  suplementos: '/img/productos/proteina_whey.jpg',
};

function normalizeSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getProductCategorySlug(product) {
  return product.categoria?.slug
    || normalizeSlug(product.categoria?.nombreCategoria || product.categoria?.categoria || product.categoria);
}

function isSportShopProduct(product) {
  const text = [
    product.nombre,
    product.descripcion,
    product.tipoPrenda,
    product.categoria?.nombreCategoria,
    product.categoria?.categoria,
  ].join(' ').toLowerCase();

  return !/(proteccion|protección|emergencia|sanidad|laboratorio|uniforme|campus|dotes)/i.test(text);
}

function resolveImage(path, fallback) {
  const img = String(path || '').trim();
  if (!img) return fallback;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return img;
  if (img.includes('/')) return `/${img}`;
  if (/\.(png|jpe?g|webp|gif)$/i.test(img)) return `/img/productos/${img}`;
  return fallback;
}

function formatPrice(value) {
  const price = Number(value || 0);
  return `${price.toFixed(2)} EUR`;
}

function addItemToCheckoutDraft(item) {
  const current = JSON.parse(sessionStorage.getItem('checkoutDraft') || '[]');
  const existing = current.find((cartItem) => cartItem.productoId === item.productoId && cartItem.talla === item.talla);

  if (existing) {
    existing.cantidad += item.cantidad;
  } else {
    current.push(item);
  }

  sessionStorage.setItem('checkoutDraft', JSON.stringify(current));
  window.dispatchEvent(new Event('cart-changed'));
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || 'ropa-deportiva';
  const apiBaseUrl = '/api';
  const pagesBase = window.location.pathname.includes('/src/pages/') ? '/src/pages/' : '/';
  const pageHref = (file) => `${pagesBase}${file}`;

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const contentEl = document.getElementById('catalog-content');
  const productsGrid = document.getElementById('products-grid');
  const addedModal = document.getElementById('added-modal');
  const addedProductName = document.getElementById('added-product-name');
  const closeAddedModal = document.getElementById('close-added-modal');

  closeAddedModal.addEventListener('click', () => addedModal.classList.add('hidden'));

  function showAddedModal(name) {
    addedProductName.textContent = name;
    addedModal.classList.remove('hidden');
  }

  function openAccountMenu() {
    const accountButton = document.querySelector('[data-account-toggle]');
    const accountPanel = document.querySelector('[data-account-panel]');
    const cartPanel = document.querySelector('[data-cart-panel]');

    if (accountButton && accountPanel) {
      if (cartPanel) cartPanel.hidden = true;
      accountPanel.hidden = false;
      accountButton.focus();
      return;
    }

    window.location.href = pageHref('iniciar_sesion.html');
  }

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('No se pudo cargar');
    return response.json();
  }

  async function loadCategory() {
    try {
      return await fetchJson(`${apiBaseUrl}/categorias/slug/${slug}`);
    } catch {
      return fallbackCategorias.find((categoria) => categoria.slug === slug) || fallbackCategorias[0];
    }
  }

  async function loadProducts() {
    try {
      const products = await fetchJson(`${apiBaseUrl}/catalogo`);
      return Array.isArray(products) && products.length ? products : fallbackProductos;
    } catch {
      return fallbackProductos;
    }
  }

  function renderCategory(categoria) {
    const imgEl = document.getElementById('categoria-img');
    const imgUrl = categoria.imagenUrl || legacyCategoryImages[categoria.slug] || legacyCategoryImages[String(categoria.idCategoria)];

    if (imgUrl) {
      imgEl.src = imgUrl;
      imgEl.alt = categoria.nombreCategoria || 'Categoría SportShop';
      imgEl.classList.remove('hidden');
    }

    document.getElementById('categoria-nombre').textContent = categoria.nombreCategoria || 'Catálogo SportShop';
    document.getElementById('categoria-desc').textContent = categoria.descripcion || 'Productos deportivos de esta categoría.';
  }

  function renderProduct(product, categoriaSlug) {
    const productSlug = getProductCategorySlug(product) || categoriaSlug;
    const fallbackImage = productImageByCategory[productSlug] || '/img/sportshop.jpg';
    const imgSrc = resolveImage(product.imagen || product.imagenUrl, fallbackImage);
    const stock = Number(product.stock || 0);
    const description = product.descripcion || `${product.tipoPrenda || 'Producto deportivo'} de ${product.categoria?.nombreCategoria || 'SportShop'}.`;
    const composicion = product.composicion || 'Composición no indicada';
    const lavado = product.instruccionesLavado || 'Consultar etiqueta del producto';
    const consejos = product.consejos || 'Guardar en un lugar seco y aireado despues de cada uso.';

    const html = `
      <article class="catalog-product-card">
        <a href="${pageHref('detalle_producto.html')}?id=${product.idProducto}" class="catalog-product-link">
          <div class="catalog-product-image">
            <img src="${imgSrc}" alt="${product.nombre}" />
          </div>
          <div class="catalog-product-body">
            <div class="catalog-product-heading">
              <div>
                <p class="catalog-product-category">${product.categoria?.nombreCategoria || product.tipoPrenda || 'SportShop'}</p>
                <h3>${product.nombre}</h3>
              </div>
              <span class="catalog-stock">Stock ${stock}</span>
            </div>
            <p class="catalog-product-description">${description}</p>
            <dl class="catalog-product-details">
              <div>
                <dt>Composición</dt>
                <dd>${composicion}</dd>
              </div>
              <div>
                <dt>Cuidado y lavado</dt>
                <dd>${lavado}</dd>
              </div>
              <div>
                <dt>Consejos</dt>
                <dd>${consejos}</dd>
              </div>
            </dl>
            <div class="catalog-product-meta">
              <span class="catalog-price">${formatPrice(product.precio)}</span>
              <span class="catalog-color">${product.color || ''}</span>
            </div>
          </div>
        </a>
        <div class="catalog-product-actions">
          <button class="add-btn catalog-add-button"
            data-id="${product.idProducto}"
            data-name="${product.nombre}"
            data-price="${Number(product.precio || 0)}"
            data-image="${imgSrc}">
            Añadir al carrito
          </button>
        </div>
      </article>
    `;

    productsGrid.insertAdjacentHTML('beforeend', html);
  }

  async function loadData() {
    try {
      const categoria = await loadCategory();
      const categoriaSlug = categoria.slug || slug;
      const allProductos = await loadProducts();
      const productosCat = allProductos.filter((product) => getProductCategorySlug(product) === categoriaSlug && isSportShopProduct(product));
      const productosMostrar = productosCat.length
        ? productosCat
        : fallbackProductos.filter((product) => getProductCategorySlug(product) === categoriaSlug);

      renderCategory(categoria);
      productsGrid.innerHTML = '';

      if (productosMostrar.length) {
        productosMostrar.forEach((product) => renderProduct(product, categoriaSlug));
      } else {
        productsGrid.innerHTML = `
          <div class="col-span-full rounded-xl bg-white p-10 text-center text-gray-600">
            No hay productos disponibles en esta categoría.
          </div>
        `;
      }

      loadingEl.classList.add('hidden');
      errorEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.textContent = `Error: ${err.message}`;
      errorEl.classList.remove('hidden');
    }
  }

  productsGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('.add-btn');
    if (!btn) return;

    if (!sessionStorage.getItem('token')) {
      openAccountMenu();
      return;
    }

    addItemToCheckoutDraft({
      productoId: Number(btn.dataset.id),
      nombre: btn.dataset.name,
      talla: 'M',
      cantidad: 1,
      precioUnitario: Number(btn.dataset.price),
      imagen: btn.dataset.image,
    });
    showAddedModal(btn.dataset.name);
  });

  loadData();
});
