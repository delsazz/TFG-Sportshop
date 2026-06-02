window.addEventListener('admin-tab-loaded', (event) => {
  if (event.detail.tabId !== 'catalogo') return;
  initAdminCatalog();
});

let catalogProducts = [];
let catalogCategories = [];
let selectedSizes = [];
let editingProductId = null;

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

async function initAdminCatalog() {
  const container = document.getElementById('catalogo-container');

  if (!container.dataset.initialized) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <p class="text-sm text-gray-500">Productos de la tienda. Solo se pueden eliminar cuando el stock llega a 0.</p>
          <button onclick="openCatalogForm()" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Nuevo producto</button>
        </div>

        <div id="catalog-error" class="hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></div>

        <form id="catalog-form" onsubmit="submitCatalogForm(event)" class="hidden space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 id="catalog-form-title" class="text-lg font-semibold text-gray-900">Nuevo producto</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block text-sm font-medium text-gray-700">
              Nombre
              <input id="product-name" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label class="block text-sm font-medium text-gray-700">
              Precio
              <input id="product-price" type="number" min="0" step="0.01" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label class="block text-sm font-medium text-gray-700">
              Categoría
              <select id="product-category" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"></select>
            </label>
            <label class="block text-sm font-medium text-gray-700">
              Stock
              <input id="product-stock" type="number" min="0" value="0" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
          </div>

          <label class="block text-sm font-medium text-gray-700">
            Descripción
            <textarea id="product-description" required class="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2"></textarea>
          </label>

          <div>
            <p class="mb-2 text-sm font-medium text-gray-700">Tallas disponibles</p>
            <div id="product-sizes" class="grid grid-cols-4 gap-2 md:grid-cols-8">
              ${AVAILABLE_SIZES.map((size) => `
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" value="${size}" onchange="toggleProductSize('${size}', this.checked)" />
                  ${size}
                </label>
              `).join('')}
            </div>
          </div>

          <label class="block text-sm font-medium text-gray-700">
            Foto del producto
            <input id="product-photo" type="file" accept="image/*" onchange="handleProductPhotoChange(event)" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <div id="product-photo-preview" class="admin-image-preview hidden"></div>

          <div class="flex gap-3 border-t pt-4">
            <button type="submit" id="product-submit" class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Guardar producto</button>
            <button type="button" onclick="closeCatalogForm()" class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
          </div>
        </form>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <input id="product-filter-name" type="text" placeholder="Buscar por nombre" class="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:flex-1" />
          <select id="product-filter-category" class="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-52">
            <option value="">Todas las categorías</option>
          </select>
          <select id="product-filter-stock" class="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-44">
            <option value="">Todo el stock</option>
            <option value="con-stock">Con stock</option>
            <option value="sin-stock">Sin stock</option>
          </select>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table class="admin-products-table text-left">
            <colgroup>
              <col class="admin-products-col-image" />
              <col class="admin-products-col-product" />
              <col class="admin-products-col-category" />
              <col class="admin-products-col-description" />
              <col class="admin-products-col-price" />
              <col class="admin-products-col-stock" />
              <col class="admin-products-col-actions" />
            </colgroup>
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Imagen</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Producto</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Categoría</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Descripción</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Precio</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody id="products-table-body">
              <tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">Cargando productos...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.dataset.initialized = 'true';
    document.getElementById('product-filter-name').addEventListener('input', renderCatalog);
    document.getElementById('product-filter-category').addEventListener('change', renderCatalog);
    document.getElementById('product-filter-stock').addEventListener('change', renderCatalog);
  }

  await fetchCatalogData();
}

async function fetchCatalogData() {
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch('/api/catalogo'),
      fetch('/api/categorias'),
    ]);
    if (!productsResponse.ok || !categoriesResponse.ok) throw new Error('No se pudieron cargar productos y categorías');

    catalogProducts = await productsResponse.json();
    catalogCategories = await categoriesResponse.json();
    renderCategoryOptions();
    document.getElementById('catalog-error').classList.add('hidden');
    renderCatalog();
  } catch (error) {
    showCatalogError(error.message);
  }
}

function renderCategoryOptions() {
  const filter = document.getElementById('product-filter-category');
  const form = document.getElementById('product-category');
  const options = catalogCategories.map((category) => `<option value="${category.idCategoria}">${category.nombreCategoria}</option>`).join('');
  filter.innerHTML = `<option value="">Todas las categorías</option>${options}`;
  form.innerHTML = options || '<option value="">Sin categorías</option>';
}

function renderCatalog() {
  const tbody = document.getElementById('products-table-body');
  const name = document.getElementById('product-filter-name').value.toLowerCase().trim();
  const category = document.getElementById('product-filter-category').value;
  const stockFilter = document.getElementById('product-filter-stock').value;

  const products = catalogProducts.filter((product) => {
    const stock = Number(product.stock || 0);
    const matchesName = !name || product.nombre.toLowerCase().includes(name);
    const matchesCategory = !category || String(product.categoria?.idCategoria) === category;
    const matchesStock = !stockFilter || (stockFilter === 'con-stock' ? stock > 0 : stock === 0);
    return matchesName && matchesCategory && matchesStock;
  });

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">No hay productos.</td></tr>';
    return;
  }

  tbody.innerHTML = products.map((product) => {
    const stock = Number(product.stock || 0);
    const imageUrl = getProductImageUrl(product);
    const productName = escapeHtml(product.nombre || 'Sin nombre');
    const productDescription = escapeHtml(product.descripcion || 'Sin descripción');
    const categoryName = escapeHtml(product.categoria?.nombreCategoria || 'Sin categoría');
    return `
      <tr class="border-t border-gray-100 align-top hover:bg-gray-50">
        <td class="px-4 py-3">
          ${imageUrl ? `
            <img src="${escapeHtml(imageUrl)}" alt="${productName}" class="admin-product-thumb rounded-lg border border-gray-200 object-cover" loading="lazy" />
          ` : `
            <div class="admin-product-thumb flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
              <i data-lucide="image" class="h-5 w-5"></i>
            </div>
          `}
        </td>
        <td class="px-4 py-3 font-medium text-gray-900">${productName}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${categoryName}</td>
        <td class="px-4 py-3">
          <div class="admin-product-description text-sm leading-6 text-gray-500">${productDescription}</div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700">${Number(product.precio || 0).toFixed(2)} EUR</td>
        <td class="px-4 py-3 text-sm text-gray-700">${stock}</td>
        <td class="px-4 py-3">
          <div class="flex gap-2">
            <button onclick="editCatalogProduct(${product.idProducto})" class="rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100">Editar</button>
            <button onclick="deleteCatalogProduct(${product.idProducto})" ${stock === 0 ? '' : 'disabled'} class="rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
}

function getProductImageUrl(product) {
  const url = product.imagen || product.imagenUrl || product.urlImagen;
  if (!url) return '';
  if (/^(https?:)?\/\//.test(url) || url.startsWith('/')) return url;
  return `/${url}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char]);
}

window.openCatalogForm = function() {
  editingProductId = null;
  selectedSizes = [];
  document.getElementById('catalog-form-title').textContent = 'Nuevo producto';
  document.getElementById('product-submit').textContent = 'Guardar producto';
  document.getElementById('product-name').value = '';
  document.getElementById('product-price').value = '';
  document.getElementById('product-stock').value = 0;
  document.getElementById('product-description').value = '';
  document.getElementById('product-photo').value = '';
  renderProductPhotoPreview('');
  document.querySelectorAll('#product-sizes input').forEach((input) => { input.checked = false; });
  if (catalogCategories.length) document.getElementById('product-category').value = catalogCategories[0].idCategoria;
  document.getElementById('catalog-form').classList.remove('hidden');
};

window.closeCatalogForm = function() {
  document.getElementById('catalog-form').classList.add('hidden');
};

window.toggleProductSize = function(size, checked) {
  selectedSizes = checked
    ? [...new Set([...selectedSizes, size])]
    : selectedSizes.filter((item) => item !== size);
};

window.editCatalogProduct = async function(id) {
  const product = catalogProducts.find((item) => item.idProducto === id);
  if (!product) return;

  editingProductId = id;
  selectedSizes = [];
  document.getElementById('catalog-form-title').textContent = 'Editar producto';
  document.getElementById('product-submit').textContent = 'Actualizar producto';
  document.getElementById('product-name').value = product.nombre || '';
  document.getElementById('product-price').value = product.precio || 0;
  document.getElementById('product-stock').value = product.stock || 0;
  document.getElementById('product-description').value = product.descripcion || '';
  document.getElementById('product-category').value = product.categoria?.idCategoria || '';
  document.getElementById('product-photo').value = '';
  renderProductPhotoPreview(getProductImageUrl(product));

  try {
    const response = await fetch(`/api/catalogo/${id}/tallas`);
    const sizes = response.ok ? await response.json() : [];
    selectedSizes = sizes.map((item) => item.talla || item.nombre).filter(Boolean);
  } catch {
    selectedSizes = [];
  }

  document.querySelectorAll('#product-sizes input').forEach((input) => {
    input.checked = selectedSizes.includes(input.value);
  });
  document.getElementById('catalog-form').classList.remove('hidden');
};

window.submitCatalogForm = async function(event) {
  event.preventDefault();
  const submit = document.getElementById('product-submit');
  submit.disabled = true;
  submit.textContent = 'Guardando...';

  try {
    const stock = Number(document.getElementById('product-stock').value || 0);
    const payload = {
      nombre: document.getElementById('product-name').value.trim(),
      descripcion: document.getElementById('product-description').value.trim(),
      precio: Number(document.getElementById('product-price').value || 0),
      stock,
      categoriaId: Number(document.getElementById('product-category').value),
      tallas: selectedSizes.map((talla) => ({ talla, stock: 0 })),
    };
    const token = getToken();
    const response = await fetch(editingProductId ? `/api/catalogo/${editingProductId}` : '/api/catalogo', {
      method: editingProductId ? 'PUT' : 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('No se pudo guardar el producto');

    const savedProduct = await response.json();
    const photo = document.getElementById('product-photo').files[0];
    if (photo && savedProduct.idProducto) {
      const formData = new FormData();
      formData.append('file', photo);
      formData.append('esPrincipal', 'true');
      const imageResponse = await fetch(`/api/catalogo/${savedProduct.idProducto}/imagen`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!imageResponse.ok) throw new Error('Producto guardado, pero no se pudo subir la foto');
    }

    closeCatalogForm();
    await fetchCatalogData();
  } catch (error) {
    showCatalogError(error.message);
  } finally {
    submit.disabled = false;
    submit.textContent = editingProductId ? 'Actualizar producto' : 'Guardar producto';
  }
};

window.handleProductPhotoChange = function(event) {
  const file = event.target.files?.[0];
  if (!file) {
    renderProductPhotoPreview('');
    return;
  }
  renderProductPhotoPreview(URL.createObjectURL(file), file.name);
};

window.deleteCatalogProduct = async function(id) {
  const product = catalogProducts.find((item) => item.idProducto === id);
  if (!product || Number(product.stock || 0) !== 0) {
    showCatalogError('Solo se pueden eliminar productos con stock 0');
    return;
  }
  if (!confirm('Se eliminará el producto sin stock. ¿Continuar?')) return;

  try {
    const response = await fetch(`/api/catalogo/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) throw new Error('No se pudo eliminar el producto');
    catalogProducts = catalogProducts.filter((item) => item.idProducto !== id);
    renderCatalog();
  } catch (error) {
    showCatalogError(error.message);
  }
};

function showCatalogError(message) {
  const error = document.getElementById('catalog-error');
  error.textContent = message;
  error.classList.remove('hidden');
}

function renderProductPhotoPreview(src, fileName = '') {
  const preview = document.getElementById('product-photo-preview');
  if (!preview) return;
  if (!src) {
    preview.innerHTML = '';
    preview.classList.add('hidden');
    return;
  }
  preview.innerHTML = `
    <img src="${escapeHtml(src)}" alt="${escapeHtml(fileName || 'Foto del producto')}" class="admin-form-image-preview rounded-lg border border-gray-200 object-cover" />
    <span class="text-sm text-gray-500">${escapeHtml(fileName || 'Imagen actual')}</span>
  `;
  preview.classList.remove('hidden');
}
