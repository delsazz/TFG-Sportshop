const legacyCategoryImages = {
  '1': '/img/categorias/ropa_deportiva.jpg',
  '2': '/img/categorias/calzado_deportivo.jpg',
  '3': '/img/categorias/accesorios_deportivos.jpg',
  '4': '/img/categorias/equipamiento_deportivo.jpg',
  '5': '/img/categorias/suplementos_deportivos.jpg',
  'ropa-deportiva': '/img/categorias/ropa_deportiva.jpg',
  'calzado': '/img/categorias/calzado_deportivo.jpg',
  'accesorios': '/img/categorias/accesorios_deportivos.jpg',
  'equipamiento': '/img/categorias/equipamiento_deportivo.jpg',
  'suplementos': '/img/categorias/suplementos_deportivos.jpg',
};

function addItemToCheckoutDraft(item) {
  const current = JSON.parse(sessionStorage.getItem('checkoutDraft') || '[]');
  current.push(item);
  sessionStorage.setItem('checkoutDraft', JSON.stringify(current));
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || '';
  const isLoggedIn = !!sessionStorage.getItem('token');
  const apiBaseUrl = '/api';

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const contentEl = document.getElementById('catalog-content');
  const productsGrid = document.getElementById('products-grid');

  // Modals
  const loginModal = document.getElementById('login-modal');
  const closeLoginModal = document.getElementById('close-login-modal');
  closeLoginModal.addEventListener('click', () => loginModal.classList.add('hidden'));

  const addedModal = document.getElementById('added-modal');
  const addedProductName = document.getElementById('added-product-name');
  const closeAddedModal = document.getElementById('close-added-modal');
  closeAddedModal.addEventListener('click', () => addedModal.classList.add('hidden'));

  function showLoginModal() {
    loginModal.classList.remove('hidden');
  }

  function showAddedModal(name) {
    addedProductName.textContent = name;
    addedModal.classList.remove('hidden');
  }

  // Fetch Category
  async function loadData() {
    try {
      // Fetch category
      const catRes = await fetch(`${apiBaseUrl}/categorias/slug/${slug}`);
      if (!catRes.ok) throw new Error('Categoria no encontrada');
      const categoria = await catRes.json();

      // Set header
      const imgEl = document.getElementById('categoria-img');
      const imgUrl = categoria.imagenUrl || legacyCategoryImages[categoria.slug] || legacyCategoryImages[String(categoria.idCategoria)];
      if (imgUrl) {
        imgEl.src = imgUrl;
        imgEl.classList.remove('hidden');
      }
      document.getElementById('categoria-nombre').textContent = categoria.nombreCategoria;
      document.getElementById('categoria-desc').textContent = categoria.descripcion || 'Uniformes y ropa profesional de esta categoria.';

      // Fetch products
      const prodRes = await fetch(`${apiBaseUrl}/productos`);
      if (prodRes.ok) {
        const allProductos = await prodRes.json();
        const productosCat = allProductos.filter(p => p.categoria && p.categoria.slug === slug);
        
        productosCat.forEach(product => {
          renderProduct(product);
        });
      }

      // Fetch kits (only if API supports it, simplified for now)
      if (categoria.idCategoria) {
        const kitsRes = await fetch(`${apiBaseUrl}/kits/categoria/${categoria.idCategoria}`);
        if (kitsRes.ok) {
          const kits = await kitsRes.json();
          kits.forEach(kit => renderKit(kit));
        }
      }

      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.textContent = `Error: ${err.message}`;
      errorEl.classList.remove('hidden');
    }
  }

  function renderProduct(product) {
    let imgSrc = '';
    if (product.imagen) {
      const img = product.imagen.trim();
      imgSrc = img.startsWith('http') ? img : (img.startsWith('/') ? img : `/${img}`);
    }

    const html = `
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl">
        <a href="/producto.html?id=${product.idProducto}">
          <div class="flex h-56 items-center justify-center bg-gray-100">
            ${imgSrc 
              ? `<img src="${imgSrc}" alt="${product.nombre}" class="h-full w-full object-cover" />`
              : `<span class="px-6 text-center text-lg font-semibold text-gray-500">${product.nombre}</span>`
            }
          </div>
          <div class="p-6">
            <h3 class="mb-1 text-xl font-semibold text-gray-900">${product.nombre}</h3>
            <p class="text-sm text-gray-500">${product.tipoPrenda || ''}</p>
            <span class="mt-4 inline-block text-3xl font-bold text-slate-900">
              ${parseFloat(product.precio).toFixed(2)} EUR
            </span>
          </div>
        </a>
        <div class="px-6 pb-6">
          <button class="add-btn mt-4 w-full rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800" data-id="${product.idProducto}" data-name="${product.nombre}" data-price="${product.precio}">
            Añadir
          </button>
        </div>
      </div>
    `;
    productsGrid.insertAdjacentHTML('beforeend', html);
  }

  function renderKit(kit) {
    // Simplified Kit Card
    const html = `
      <div class="overflow-hidden rounded-xl border-2 border-blue-200 bg-blue-50 transition-all duration-300 hover:shadow-xl">
        <div class="p-6">
          <h3 class="mb-1 text-xl font-bold text-blue-900">KIT: ${kit.nombre}</h3>
          <p class="text-sm text-blue-700">${kit.descripcion || ''}</p>
          <span class="mt-4 inline-block text-3xl font-bold text-blue-900">
            ${parseFloat(kit.precioTotal || 0).toFixed(2)} EUR
          </span>
        </div>
        <div class="px-6 pb-6">
          <button class="add-kit-btn mt-4 w-full rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700" data-id="${kit.idKit}" data-name="${kit.nombre}">
            Añadir Kit Completo
          </button>
        </div>
      </div>
    `;
    productsGrid.insertAdjacentHTML('afterbegin', html);
  }

  // Event Delegation for Buttons
  productsGrid.addEventListener('click', (e) => {
    if (e.target.closest('.add-btn')) {
      const btn = e.target.closest('.add-btn');
      if (!isLoggedIn) {
        showLoginModal();
        return;
      }
      addItemToCheckoutDraft({
        productoId: parseInt(btn.dataset.id),
        nombre: btn.dataset.name,
        talla: 'M',
        cantidad: 1,
        precioUnitario: parseFloat(btn.dataset.price)
      });
      showAddedModal(btn.dataset.name);
    }
    if (e.target.closest('.add-kit-btn')) {
      const btn = e.target.closest('.add-kit-btn');
      if (!isLoggedIn) {
        showLoginModal();
        return;
      }
      // Simple implementation: normally you would add all kit products
      showAddedModal(btn.dataset.name);
    }
  });

  loadData();
});
