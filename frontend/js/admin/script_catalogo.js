window.addEventListener('admin-tab-loaded', (e) => {
  if (e.detail.tabId !== 'catalogo') return;
  initAdminCatalog();
});

let catalogProducts = [];
let catalogCategories = [];
let catalogHasTallas = false;
let catalogTallasStock = [];
let editingProductId = null;
const TALLAS_DISPONIBLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

async function initAdminCatalog() {
  const container = document.getElementById('catalogo-container');
  if (!container.dataset.initialized) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm text-gray-500">Crea, edita y elimina productos del escaparate.</p>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row">
            <button onclick="openCatalogForm()" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer">
              + Nuevo producto
            </button>
          </div>
        </div>

        <div id="catalog-error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 hidden"></div>

        <form id="catalog-form" onsubmit="submitCatalogForm(event)" class="hidden space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 id="catalog-form-title" class="text-lg font-semibold text-gray-900">Crear nuevo producto</h3>
          
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input id="cat-nombre" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de prenda</label>
              <input id="cat-tipo" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input id="cat-color" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio (€) *</label>
              <input id="cat-precio" type="number" min="0" step="0.01" required class="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select id="cat-categoria" required class="w-full rounded-lg border border-gray-300 px-3 py-2"></select>
            </div>
          </div>

          <div class="flex items-center gap-2 border-t pt-4">
            <input type="checkbox" id="cat-has-tallas" onchange="toggleCatalogTallas(this.checked)" class="rounded border-gray-300 cursor-pointer" />
            <label for="cat-has-tallas" class="text-sm font-medium text-gray-700 cursor-pointer">Esta prenda tiene tallas</label>
          </div>

          <div id="cat-tallas-container" class="hidden border-t pt-4">
            <h4 class="font-medium text-gray-900 mb-3">Seleccionar tallas</h4>
            <div class="grid grid-cols-4 gap-2 md:grid-cols-7" id="cat-tallas-checkboxes">
              ${TALLAS_DISPONIBLES.map(t => `
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value="${t}" onchange="toggleTallaSelection('${t}', this.checked)" class="rounded border-gray-300" id="cb-talla-${t}" />
                  <span class="text-sm">${t}</span>
                </label>
              `).join('')}
            </div>
            <div id="cat-tallas-stock-container" class="mt-4 hidden">
              <h4 class="font-medium text-gray-900 mb-3">Stock por talla</h4>
              <div class="grid gap-3 md:grid-cols-4" id="cat-tallas-inputs"></div>
            </div>
          </div>

          <div id="cat-stock-general-container" class="border-t pt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Stock general</label>
            <input id="cat-stock" type="number" min="0" value="0" class="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </div>

          <div class="flex gap-3 pt-4 border-t">
            <button type="submit" id="btn-cat-submit" class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer">Crear producto</button>
            <button type="button" onclick="closeCatalogForm()" class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancelar</button>
          </div>
        </form>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <input type="text" id="cat-filter-nombre" placeholder="Buscar por nombre..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 sm:flex-1" />
          <select id="cat-filter-cat" class="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-48">
            <option value="">Todas las categorías</option>
          </select>
          <input type="number" id="cat-filter-pmin" placeholder="Precio mín..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-32" />
          <input type="number" id="cat-filter-pmax" placeholder="Precio máx..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-32" />
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table class="min-w-full text-left">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Producto</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Categoría</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Precio</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody id="catalog-tbody">
              <tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Cargando catálogo...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.dataset.initialized = "true";

    document.getElementById('cat-filter-nombre').addEventListener('input', renderCatalog);
    document.getElementById('cat-filter-cat').addEventListener('change', renderCatalog);
    document.getElementById('cat-filter-pmin').addEventListener('input', renderCatalog);
    document.getElementById('cat-filter-pmax').addEventListener('input', renderCatalog);
  }

  await fetchCatalogData();
}

async function fetchCatalogData() {
  try {
    const apiBaseUrl = '/api';
    const [prodRes, catRes] = await Promise.all([
      fetch(`${apiBaseUrl}/productos`),
      fetch(`${apiBaseUrl}/categorias`)
    ]);

    if (!prodRes.ok || !catRes.ok) throw new Error('Error al cargar datos');

    catalogProducts = await prodRes.json();
    catalogCategories = await catRes.json();
    
    // populate select options
    const filterCat = document.getElementById('cat-filter-cat');
    const formCat = document.getElementById('cat-categoria');
    
    let filterHtml = '<option value="">Todas las categorías</option>';
    let formHtml = catalogCategories.length ? '' : '<option value="">Sin categorías</option>';
    
    catalogCategories.forEach(c => {
      filterHtml += `<option value="${c.idCategoria}">${c.nombreCategoria}</option>`;
      formHtml += `<option value="${c.idCategoria}">${c.nombreCategoria}</option>`;
    });

    filterCat.innerHTML = filterHtml;
    formCat.innerHTML = formHtml;

    document.getElementById('catalog-error').classList.add('hidden');
    renderCatalog();
  } catch(e) {
    showCatalogError(e.message);
  }
}

function renderCatalog() {
  const tbody = document.getElementById('catalog-tbody');
  
  const fNombre = document.getElementById('cat-filter-nombre').value.toLowerCase();
  const fCat = document.getElementById('cat-filter-cat').value;
  const fPmin = document.getElementById('cat-filter-pmin').value;
  const fPmax = document.getElementById('cat-filter-pmax').value;

  const filtered = catalogProducts.filter(p => {
    const cNombre = !fNombre || p.nombre.toLowerCase().includes(fNombre);
    const cCat = !fCat || p.categoria.idCategoria == fCat;
    const cPmin = !fPmin || p.precio >= Number(fPmin);
    const cPmax = !fPmax || p.precio <= Number(fPmax);
    return cNombre && cCat && cPmin && cPmax;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No hay productos.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr class="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td class="px-4 py-3">
        <div class="font-medium text-gray-900">${p.nombre}</div>
        <div class="text-sm text-gray-500">${p.tipoPrenda || 'Sin tipo'}</div>
      </td>
      <td class="px-4 py-3 text-sm text-gray-700">${p.categoria.nombreCategoria}</td>
      <td class="px-4 py-3 text-sm text-gray-700">${Number(p.precio).toFixed(2)} EUR</td>
      <td class="px-4 py-3 text-sm text-gray-700">${p.stock}</td>
      <td class="px-4 py-3">
        <div class="flex gap-2">
          <button onclick="editCatalogProduct(${p.idProducto})" class="rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 cursor-pointer">Editar</button>
          <button onclick="deleteCatalogProduct(${p.idProducto})" class="rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 cursor-pointer">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.openCatalogForm = function() {
  editingProductId = null;
  catalogHasTallas = false;
  catalogTallasStock = [];
  
  document.getElementById('catalog-form-title').textContent = 'Crear nuevo producto';
  document.getElementById('btn-cat-submit').textContent = 'Crear producto';
  document.getElementById('cat-nombre').value = '';
  document.getElementById('cat-tipo').value = '';
  document.getElementById('cat-color').value = '';
  document.getElementById('cat-precio').value = '';
  document.getElementById('cat-stock').value = 0;
  
  if (catalogCategories.length > 0) {
    document.getElementById('cat-categoria').value = catalogCategories[0].idCategoria;
  }

  document.getElementById('cat-has-tallas').checked = false;
  toggleCatalogTallas(false);
  updateTallasCheckboxes();

  document.getElementById('catalog-form').classList.remove('hidden');
}

window.closeCatalogForm = function() {
  document.getElementById('catalog-form').classList.add('hidden');
}

window.editCatalogProduct = async function(id) {
  const p = catalogProducts.find(x => x.idProducto === id);
  if (!p) return;

  editingProductId = id;
  document.getElementById('catalog-form-title').textContent = 'Editar producto';
  document.getElementById('btn-cat-submit').textContent = 'Actualizar producto';
  document.getElementById('cat-nombre').value = p.nombre;
  document.getElementById('cat-tipo').value = p.tipoPrenda || '';
  document.getElementById('cat-color').value = p.color || '';
  document.getElementById('cat-precio').value = p.precio;
  document.getElementById('cat-stock').value = p.stock;
  document.getElementById('cat-categoria').value = p.categoria.idCategoria;

  document.getElementById('catalog-form').classList.remove('hidden');

  try {
    const res = await fetch(`/api/productos/${id}/tallas`);
    if (res.ok) {
      const tallas = await res.json();
      if (tallas && tallas.length > 0) {
        catalogHasTallas = true;
        catalogTallasStock = tallas;
        document.getElementById('cat-has-tallas').checked = true;
      } else {
        catalogHasTallas = false;
        catalogTallasStock = [];
        document.getElementById('cat-has-tallas').checked = false;
      }
    }
  } catch (err) {
    catalogHasTallas = false;
    catalogTallasStock = [];
  }
  
  toggleCatalogTallas(catalogHasTallas);
  updateTallasCheckboxes();
}

window.toggleCatalogTallas = function(has) {
  catalogHasTallas = has;
  if (has) {
    document.getElementById('cat-tallas-container').classList.remove('hidden');
    document.getElementById('cat-stock-general-container').classList.add('hidden');
  } else {
    document.getElementById('cat-tallas-container').classList.add('hidden');
    document.getElementById('cat-stock-general-container').classList.remove('hidden');
  }
}

window.toggleTallaSelection = function(talla, checked) {
  if (checked) {
    if (!catalogTallasStock.some(t => t.talla === talla)) {
      catalogTallasStock.push({ talla, stock: 0 });
    }
  } else {
    catalogTallasStock = catalogTallasStock.filter(t => t.talla !== talla);
  }
  renderTallasInputs();
}

function updateTallasCheckboxes() {
  TALLAS_DISPONIBLES.forEach(t => {
    const cb = document.getElementById(`cb-talla-${t}`);
    if (cb) {
      cb.checked = catalogTallasStock.some(x => x.talla === t);
    }
  });
  renderTallasInputs();
}

function renderTallasInputs() {
  const container = document.getElementById('cat-tallas-inputs');
  const parent = document.getElementById('cat-tallas-stock-container');
  
  if (catalogTallasStock.length === 0) {
    parent.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  
  parent.classList.remove('hidden');
  container.innerHTML = catalogTallasStock.map(t => `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">${t.talla}</label>
      <input type="number" min="0" value="${t.stock}" onchange="updateTallaStock('${t.talla}', this.value)" class="w-full rounded-lg border border-gray-300 px-3 py-2" />
    </div>
  `).join('');
}

window.updateTallaStock = function(talla, val) {
  const item = catalogTallasStock.find(t => t.talla === talla);
  if (item) item.stock = parseInt(val) || 0;
}

window.submitCatalogForm = async function(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btn-cat-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    const stockGeneral = parseInt(document.getElementById('cat-stock').value) || 0;
    const stockFinal = catalogHasTallas && catalogTallasStock.length > 0
      ? catalogTallasStock.reduce((sum, t) => sum + t.stock, 0)
      : stockGeneral;

    const payload = {
      nombre: document.getElementById('cat-nombre').value,
      tipoPrenda: document.getElementById('cat-tipo').value,
      color: document.getElementById('cat-color').value,
      precio: parseFloat(document.getElementById('cat-precio').value),
      stock: stockFinal,
      categoriaId: parseInt(document.getElementById('cat-categoria').value),
      tallas: catalogHasTallas ? catalogTallasStock : []
    };

    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    
    let res;
    if (editingProductId === null) {
      res = await fetch(`/api/productos`, { method: 'POST', headers, body: JSON.stringify(payload) });
    } else {
      res = await fetch(`/api/productos/${editingProductId}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
    }

    if (!res.ok) throw new Error('No se pudo guardar el producto');
    
    closeCatalogForm();
    await fetchCatalogData();
  } catch (err) {
    showCatalogError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = editingProductId === null ? 'Crear producto' : 'Actualizar producto';
  }
}

window.deleteCatalogProduct = async function(id) {
  if (!confirm('Se eliminará el producto seleccionado. ¿Continuar?')) return;

  try {
    const token = getToken();
    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error('No se pudo eliminar el producto');
    
    catalogProducts = catalogProducts.filter(p => p.idProducto !== id);
    renderCatalog();
    if (editingProductId === id) closeCatalogForm();
  } catch (err) {
    showCatalogError(err.message);
  }
}

function showCatalogError(msg) {
  const el = document.getElementById('catalog-error');
  if(el) {
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  }
}
