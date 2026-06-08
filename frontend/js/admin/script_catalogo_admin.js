window.addEventListener('admin-tab-loaded', (event) => {
  if (event.detail.tabId !== 'catalogo') return;
  initAdminCatalog();
});

let catalogProducts = [];
let catalogCategories = [];
let selectedSizes = [];
let editingProductId = null;

const AVAILABLE_SIZES = ['Sin tallas', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

async function initAdminCatalog() {
  const container = document.getElementById('catalogo-container');

  if (!container.dataset.initialized) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="catalog-top-row">
          <p class="catalog-info-text">Productos de la tienda. Solo se pueden eliminar cuando el stock llega a 0.</p>
          <button onclick="openCatalogForm()" class="catalog-btn-new">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo producto
          </button>
        </div>

        <div id="catalog-error" class="hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></div>

        <form id="catalog-form" onsubmit="submitCatalogForm(event)" class="catalog-form-panel hidden space-y-4">
          <h3 id="catalog-form-title">Nuevo producto</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block text-sm font-medium text-gray-700">
              Nombre
              <input id="product-name" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            </label>
            <label class="block text-sm font-medium text-gray-700">
              Precio (€)
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
                <label class="flex items-center gap-2 text-sm ${size === 'Sin tallas' ? 'col-span-4 md:col-span-8' : ''}">
                  <input type="checkbox" value="${size}" onchange="toggleProductSize('${size}', this.checked)" />
                  ${size === 'Sin tallas' ? 'Este producto no tiene tallas' : size}
                </label>
              `).join('')}
            </div>
          </div>

          <label class="block text-sm font-medium text-gray-700">
            Foto del producto
            <input id="product-photo" type="file" accept="image/*" onchange="handleProductPhotoChange(event)" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <div id="product-photo-preview" class="admin-image-preview hidden"></div>

          <div class="catalog-form-footer">
            <button type="submit" id="product-submit" class="catalog-btn-submit">Guardar producto</button>
            <button type="button" onclick="closeCatalogForm()" class="catalog-btn-cancel">Cancelar</button>
          </div>
        </form>

        <div style="display:flex;gap:12px;align-items:center;padding:16px 20px;background:linear-gradient(135deg,#1e293b,#334155);border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,0.15);flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:200px;">
            <span style="color:#94a3b8;font-size:13px;font-weight:600;white-space:nowrap;">🔍 Buscar:</span>
            <input id="product-filter-name" type="text" placeholder="Nombre del producto..." style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:13px;font-weight:500;outline:none;" />
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:#94a3b8;font-size:13px;font-weight:600;white-space:nowrap;">📂 Categoría:</span>
            <select id="product-filter-category" style="padding:8px 12px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:13px;font-weight:500;outline:none;cursor:pointer;min-width:150px;">
              <option value="">Todas</option>
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:#94a3b8;font-size:13px;font-weight:600;white-space:nowrap;">📦 Stock:</span>
            <select id="product-filter-stock" style="padding:8px 12px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:13px;font-weight:500;outline:none;cursor:pointer;min-width:130px;">
              <option value="">Todo el stock</option>
              <option value="con-stock">Con stock</option>
              <option value="sin-stock">Sin stock</option>
            </select>
          </div>
          <button id="catalog-apply-filters" style="padding:9px 24px;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:transform 0.15s;box-shadow:0 2px 8px rgba(37,99,235,0.4);white-space:nowrap;" onmouseenter="this.style.transform='scale(1.03)'" onmouseleave="this.style.transform='scale(1)'">Aplicar filtros</button>
        </div>

        <div class="catalog-table-wrapper">
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
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
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
    document.getElementById('catalog-apply-filters').addEventListener('click', renderCatalog);
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
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="catalog-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
          <p>No hay productos con los filtros seleccionados</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = products.map((product) => {
    const stock = Number(product.stock || 0);
    const imageUrl = getProductImageUrl(product);
    const productName = escapeHtml(product.nombre || 'Sin nombre');
    const productDescription = escapeHtml(product.descripcion || 'Sin descripción');
    const categoryName = escapeHtml(product.categoria?.nombreCategoria || 'Sin categoría');
    const stockClass = stock === 0 ? 'no-stock' : stock <= 5 ? 'low-stock' : 'in-stock';
    const stockLabel = stock === 0 ? 'Sin stock' : stock <= 5 ? `Bajo (${stock})` : stock;
    return `
      <tr>
        <td>
          ${imageUrl ? `
            <img src="${escapeHtml(imageUrl)}" alt="${productName}" class="admin-product-thumb" loading="lazy" />
          ` : `
            <div class="admin-product-thumb flex items-center justify-center" style="background:#f8fafc;color:#cbd5e1">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-4 4 4"/><circle cx="8.5" cy="13.5" r="1.5"/></svg>
            </div>
          `}
        </td>
        <td>
          <div class="catalog-product-name">${productName}</div>
        </td>
        <td>
          <span class="catalog-category-badge">${categoryName}</span>
        </td>
        <td>
          <div class="admin-product-description">${productDescription}</div>
        </td>
        <td>
          <div class="catalog-price">${Number(product.precio || 0).toFixed(2)}<span>EUR</span></div>
        </td>
        <td>
          <span class="catalog-stock-badge ${stockClass}">${stockLabel}</span>
        </td>
        <td>
          <div class="flex gap-2">
            <button onclick="editCatalogProduct(${product.idProducto})" class="catalog-btn-edit">
              ✏️ Editar
            </button>
            <button onclick="deleteCatalogProduct(${product.idProducto})" class="catalog-btn-delete">
              🗑️ Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
}

function getProductImageUrl(product) {
  const url = String(product.imagen || product.imagenUrl || product.urlImagen || '').trim();
  if (!url) return '';
  if (/^(https?:)?\/\//.test(url) || url.startsWith('/')) return url;
  if (url.includes('/')) return `/${url}`;
  if (/\.(png|jpe?g|webp|gif)$/i.test(url)) return `/img/productos/${url}`;
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
  if (!product) return;

  if (!confirm('Se eliminará el producto. ¿Continuar?')) return;

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
