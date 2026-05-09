window.addEventListener('admin-tab-loaded', (e) => {
  if (e.detail.tabId !== 'kits') return;
  initAdminKits();
});

let kitsData = [];
let kitsProducts = [];
let kitsCategories = [];
let editingKitId = null;
let kitSelectedProducts = new Map();

async function initAdminKits() {
  const container = document.getElementById('kits-container');
  if (!container.dataset.initialized) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Gestión de packs y conjuntos.</p>
          <button onclick="openKitForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            + Crear Kit
          </button>
        </div>

        <div id="kits-error" class="p-4 bg-red-100 text-red-800 rounded-lg hidden"></div>

        <form id="kit-form" onsubmit="submitKitForm(event)" class="hidden bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 id="kit-form-title" class="text-lg font-semibold text-gray-900">Crear Kit</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nombre</label>
              <input type="text" id="kit-nombre" required class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Precio</label>
              <input type="number" id="kit-precio" step="0.01" required class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Stock</label>
              <input type="number" id="kit-stock" required class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Categoria</label>
              <select id="kit-categoria" class="w-full border rounded-lg px-3 py-2"></select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Descripción</label>
            <textarea id="kit-descripcion" class="w-full border rounded-lg px-3 py-2 h-20"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">URL Imagen</label>
            <input type="text" id="kit-imagen" class="w-full border rounded-lg px-3 py-2" placeholder="https://..." />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Prendas en el Kit</label>
            <div id="kit-products-list" class="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4"></div>
            <div class="text-sm text-gray-600 mt-2" id="kit-selected-count">Prendas seleccionadas: 0</div>
          </div>

          <div class="flex gap-2 justify-end">
            <button type="button" onclick="closeKitForm()" class="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer">Cancelar</button>
            <button type="submit" id="btn-kit-submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer">Crear</button>
          </div>
        </form>

        <div class="space-y-4">
          <div class="flex gap-4 flex-wrap">
            <input type="text" id="kit-filter-nombre" placeholder="Buscar por nombre..." class="flex-1 min-w-[16rem] border rounded-lg px-4 py-2" />
            <select id="kit-filter-cat" class="border rounded-lg px-4 py-2">
              <option value="">Todas las categorías</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2">Nombre</th>
                  <th class="px-4 py-2">Categoria</th>
                  <th class="px-4 py-2">Prendas</th>
                  <th class="px-4 py-2">Precio</th>
                  <th class="px-4 py-2">Stock</th>
                  <th class="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody id="kits-tbody">
                <tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Cargando kits...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    container.dataset.initialized = "true";

    document.getElementById('kit-filter-nombre').addEventListener('input', renderKits);
    document.getElementById('kit-filter-cat').addEventListener('change', renderKits);
  }

  await fetchKitsData();
}

async function fetchKitsData() {
  try {
    const apiBaseUrl = '/api';
    const [kitsRes, prodRes, catRes] = await Promise.all([
      fetch(`${apiBaseUrl}/kits`),
      fetch(`${apiBaseUrl}/productos`),
      fetch(`${apiBaseUrl}/categorias`)
    ]);

    if (!kitsRes.ok || !prodRes.ok || !catRes.ok) throw new Error('Error al cargar datos');

    kitsData = await kitsRes.json();
    kitsProducts = await prodRes.json();
    kitsCategories = await catRes.json();
    
    const filterCat = document.getElementById('kit-filter-cat');
    const formCat = document.getElementById('kit-categoria');
    
    let filterHtml = '<option value="">Todas las categorías</option>';
    let formHtml = kitsCategories.length ? '' : '<option value="">Sin categorías</option>';
    
    kitsCategories.forEach(c => {
      filterHtml += `<option value="${c.idCategoria}">${c.nombreCategoria}</option>`;
      formHtml += `<option value="${c.idCategoria}">${c.nombreCategoria}</option>`;
    });

    filterCat.innerHTML = filterHtml;
    formCat.innerHTML = formHtml;

    document.getElementById('kits-error').classList.add('hidden');
    renderKits();
  } catch(e) {
    showKitsError(e.message);
  }
}

function renderKits() {
  const tbody = document.getElementById('kits-tbody');
  
  const fNombre = document.getElementById('kit-filter-nombre').value.toLowerCase();
  const fCat = document.getElementById('kit-filter-cat').value;

  const filtered = kitsData.filter(k => {
    const cNombre = !fNombre || k.nombre.toLowerCase().includes(fNombre);
    const cCat = !fCat || (k.categoria && k.categoria.idCategoria == fCat);
    return cNombre && cCat;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No se encontraron kits.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(k => `
    <tr class="border-t hover:bg-gray-50">
      <td class="px-4 py-2 font-semibold">${k.nombre}</td>
      <td class="px-4 py-2">${k.categoria ? k.categoria.nombreCategoria : 'Sin categoría'}</td>
      <td class="px-4 py-2">${k.productos.length}</td>
      <td class="px-4 py-2">${Number(k.precio).toFixed(2)} EUR</td>
      <td class="px-4 py-2">${k.stock}</td>
      <td class="px-4 py-2 space-x-2">
        <button onclick="editKit(${k.idKit})" class="text-blue-600 hover:underline cursor-pointer">Editar</button>
        <button onclick="deleteKit(${k.idKit})" class="text-red-600 hover:underline cursor-pointer">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

window.openKitForm = function() {
  editingKitId = null;
  kitSelectedProducts.clear();
  
  document.getElementById('kit-form-title').textContent = 'Crear Kit';
  document.getElementById('btn-kit-submit').textContent = 'Crear';
  document.getElementById('btn-kit-submit').disabled = true; // disabled until products selected
  
  document.getElementById('kit-nombre').value = '';
  document.getElementById('kit-precio').value = '';
  document.getElementById('kit-stock').value = '';
  document.getElementById('kit-descripcion').value = '';
  document.getElementById('kit-imagen').value = '';
  
  if (kitsCategories.length > 0) {
    document.getElementById('kit-categoria').value = kitsCategories[0].idCategoria;
  }

  renderKitProductsList();
  document.getElementById('kit-form').classList.remove('hidden');
}

window.closeKitForm = function() {
  document.getElementById('kit-form').classList.add('hidden');
}

window.editKit = function(id) {
  const k = kitsData.find(x => x.idKit === id);
  if (!k) return;

  editingKitId = id;
  kitSelectedProducts.clear();
  k.productos.forEach(kp => {
    kitSelectedProducts.set(kp.producto.idProducto, {
      productoId: kp.producto.idProducto,
      cantidad: kp.cantidad
    });
  });

  document.getElementById('kit-form-title').textContent = 'Editar Kit';
  document.getElementById('btn-kit-submit').textContent = 'Actualizar';
  document.getElementById('btn-kit-submit').disabled = kitSelectedProducts.size === 0;

  document.getElementById('kit-nombre').value = k.nombre;
  document.getElementById('kit-precio').value = k.precio;
  document.getElementById('kit-stock').value = k.stock;
  document.getElementById('kit-descripcion').value = k.descripcion || '';
  document.getElementById('kit-imagen').value = k.imagen || '';
  
  if (k.categoria) {
    document.getElementById('kit-categoria').value = k.categoria.idCategoria;
  }

  renderKitProductsList();
  document.getElementById('kit-form').classList.remove('hidden');
}

function renderKitProductsList() {
  const container = document.getElementById('kit-products-list');
  const countLabel = document.getElementById('kit-selected-count');
  
  container.innerHTML = kitsProducts.map(p => {
    const isSelected = kitSelectedProducts.has(p.idProducto);
    const selData = kitSelectedProducts.get(p.idProducto);
    
    let extraHtml = '';
    if (isSelected) {
      extraHtml = `
        <div class="flex items-center gap-2">
          <label class="text-sm">Cantidad:</label>
          <input type="number" min="1" value="${selData.cantidad}" onchange="changeKitProductQuantity(${p.idProducto}, this.value)" class="w-12 border rounded px-2 py-1" />
        </div>
      `;
    }

    return `
      <div class="flex items-center gap-4 p-2 border rounded">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleKitProduct(${p.idProducto})" class="w-4 h-4 cursor-pointer" />
        <div class="flex-1">
          <div class="font-semibold">${p.nombre}</div>
          <div class="text-sm text-gray-600">${p.tipoPrenda || ''} - ${p.color || ''}</div>
          <div class="text-sm font-medium">${Number(p.precio).toFixed(2)} EUR</div>
        </div>
        ${extraHtml}
      </div>
    `;
  }).join('');

  countLabel.textContent = `Prendas seleccionadas: ${kitSelectedProducts.size}`;
  document.getElementById('btn-kit-submit').disabled = kitSelectedProducts.size === 0;
}

window.toggleKitProduct = function(id) {
  if (kitSelectedProducts.has(id)) {
    kitSelectedProducts.delete(id);
  } else {
    kitSelectedProducts.set(id, { productoId: id, cantidad: 1 });
  }
  renderKitProductsList();
}

window.changeKitProductQuantity = function(id, val) {
  const qty = parseInt(val);
  if (qty > 0 && kitSelectedProducts.has(id)) {
    const data = kitSelectedProducts.get(id);
    data.cantidad = qty;
    kitSelectedProducts.set(id, data);
  }
}

window.submitKitForm = async function(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btn-kit-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    const payload = {
      nombre: document.getElementById('kit-nombre').value,
      descripcion: document.getElementById('kit-descripcion').value,
      precio: parseFloat(document.getElementById('kit-precio').value),
      stock: parseInt(document.getElementById('kit-stock').value),
      categoriaId: parseInt(document.getElementById('kit-categoria').value),
      imagen: document.getElementById('kit-imagen').value,
      productos: Array.from(kitSelectedProducts.values())
    };

    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    
    let res;
    if (editingKitId === null) {
      res = await fetch(`/api/kits`, { method: 'POST', headers, body: JSON.stringify(payload) });
    } else {
      res = await fetch(`/api/kits/${editingKitId}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
    }

    if (!res.ok) throw new Error('No se pudo guardar el kit');
    
    closeKitForm();
    await fetchKitsData();
  } catch (err) {
    showKitsError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = editingKitId === null ? 'Crear' : 'Actualizar';
  }
}

window.deleteKit = async function(id) {
  if (!confirm('¿Está seguro de que desea eliminar este kit?')) return;

  try {
    const token = getToken();
    const res = await fetch(`/api/kits/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error('Error al eliminar');
    
    kitsData = kitsData.filter(k => k.idKit !== id);
    renderKits();
    if (editingKitId === id) closeKitForm();
  } catch (err) {
    showKitsError(err.message);
  }
}

function showKitsError(msg) {
  const el = document.getElementById('kits-error');
  if(el) {
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  }
}
