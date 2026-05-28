window.addEventListener('admin-tab-loaded', (e) => {
  if (e.detail.tabId !== 'categorias') return;
  initAdminCategories();
});

let categoriesData = [];
let categoriesProducts = [];
let editingCategoryId = null;
let categorySelectedProducts = new Set();

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function initAdminCategories() {
  const container = document.getElementById('categorias-container');
  if (!container.dataset.initialized) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <p class="mt-1 text-sm text-gray-500">Gestiona nombre, slug, foto, descripción y ropa asociada.</p>
          <button onclick="openCategoryForm()" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer">
            + Nueva categoria
          </button>
        </div>

        <div id="cat-error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 hidden"></div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input type="text" id="cat-search" placeholder="Buscar por nombre o slug..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:flex-1" />
          <span id="cat-count" class="text-sm text-gray-500">0 categorias</span>
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table class="min-w-full text-left">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Categoria</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Slug</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Foto</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Ropa</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody id="categorias-tbody">
              <tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Cargando categorias...</td></tr>
            </tbody>
          </table>
        </div>

        <div id="category-modal" class="fixed inset-0 z-50 overflow-y-auto bg-black/50 hidden">
          <div class="flex min-h-full items-center justify-center p-6">
            <div class="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl">
              <h3 id="category-form-title" class="mb-4 text-lg font-bold text-gray-900">Nueva categoria</h3>
              
              <form onsubmit="submitCategoryForm(event)" class="space-y-6">
                <div class="grid gap-6 lg:grid-cols-2">
                  <div class="space-y-4">
                    <div>
                      <label class="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
                      <input type="text" id="cat-name" required oninput="updateCategorySlug()" class="w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </div>
                    <div>
                      <label class="mb-1 block text-sm font-medium text-gray-700">Slug URL *</label>
                      <input type="text" id="cat-slug" required class="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="ejemplo-categoria" />
                    </div>
                    <div>
                      <label class="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                      <textarea id="cat-desc" class="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2"></textarea>
                    </div>
                    <div>
                      <label class="mb-1 block text-sm font-medium text-gray-700">Foto URL</label>
                      <input type="text" id="cat-img" oninput="updateCategoryPreview()" class="w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </div>
                    <div id="cat-preview-container" class="hidden">
                      <p class="mb-2 text-xs text-gray-500">Vista previa</p>
                      <img id="cat-preview" src="" alt="Preview categoria" class="h-40 w-full rounded-lg object-cover" />
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <h4 class="text-sm font-semibold text-gray-900">Ropa de categoria</h4>
                      <p class="mt-1 text-xs text-gray-500">Seleccionar aquí mueve esos productos a esta categoria.</p>
                    </div>

                    <div id="cat-products-list" class="max-h-[28rem] space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3"></div>

                    <div id="cat-current-products-container" class="hidden rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <h5 class="text-sm font-semibold text-gray-900">Actualmente en categoria</h5>
                      <div id="cat-current-products" class="mt-2 flex flex-wrap gap-2"></div>
                    </div>
                  </div>
                </div>

                <div class="flex gap-3 border-t pt-4">
                  <button type="button" onclick="closeCategoryForm()" class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancelar</button>
                  <button type="submit" id="btn-cat-submit" class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer">Crear</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
    container.dataset.initialized = "true";

    document.getElementById('cat-search').addEventListener('input', renderCategories);
  }

  await fetchCategoriesData();
}

async function fetchCategoriesData() {
  try {
    const apiBaseUrl = '/api';
    const [catRes, prodRes] = await Promise.all([
      fetch(`${apiBaseUrl}/categorias`),
      fetch(`${apiBaseUrl}/productos`)
    ]);

    if (!catRes.ok || !prodRes.ok) throw new Error('Error al cargar datos');

    categoriesData = await catRes.json();
    categoriesProducts = await prodRes.json();
    
    document.getElementById('cat-error').classList.add('hidden');
    renderCategories();
  } catch(e) {
    showCategoriesError(e.message);
  }
}

function renderCategories() {
  const tbody = document.getElementById('categorias-tbody');
  const searchStr = document.getElementById('cat-search').value.toLowerCase();

  const filtered = categoriesData.filter(c => 
    `${c.nombreCategoria} ${c.slug}`.toLowerCase().includes(searchStr)
  );

  document.getElementById('cat-count').textContent = `${filtered.length} categorias`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No hay categorias.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr class="border-t border-gray-100 align-top hover:bg-gray-50 transition-colors">
      <td class="px-4 py-3">
        <div class="font-medium text-gray-900">${c.nombreCategoria}</div>
        ${c.descripcion ? `<div class="mt-1 max-w-md text-xs text-gray-500">${c.descripcion}</div>` : ''}
      </td>
      <td class="px-4 py-3 text-sm text-gray-700">${c.slug}</td>
      <td class="px-4 py-3">
        ${c.imagenUrl ? `<img src="${c.imagenUrl}" alt="${c.nombreCategoria}" class="h-14 w-20 rounded object-cover" />` : `<span class="text-sm text-gray-400">Sin foto</span>`}
      </td>
      <td class="px-4 py-3 text-sm text-gray-700">${c.totalProductos ?? 0}</td>
      <td class="px-4 py-3">
        <div class="flex gap-2">
          <button onclick="editCategory(${c.idCategoria})" class="rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 cursor-pointer">Editar</button>
          <button onclick="deleteCategory(${c.idCategoria})" class="rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 cursor-pointer">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.updateCategorySlug = function() {
  const nameInput = document.getElementById('cat-name');
  const slugInput = document.getElementById('cat-slug');
  if (editingCategoryId === null) {
    slugInput.value = slugify(nameInput.value);
  }
}

window.updateCategoryPreview = function() {
  const url = document.getElementById('cat-img').value;
  const container = document.getElementById('cat-preview-container');
  const img = document.getElementById('cat-preview');
  
  if (url) {
    img.src = url;
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
}

window.openCategoryForm = function() {
  editingCategoryId = null;
  categorySelectedProducts.clear();
  
  document.getElementById('category-form-title').textContent = 'Nueva categoria';
  document.getElementById('btn-cat-submit').textContent = 'Crear';
  
  document.getElementById('cat-name').value = '';
  document.getElementById('cat-slug').value = '';
  document.getElementById('cat-desc').value = '';
  document.getElementById('cat-img').value = '';
  
  updateCategoryPreview();
  renderCategoryProductsList();
  
  document.getElementById('cat-current-products-container').classList.add('hidden');
  document.getElementById('category-modal').classList.remove('hidden');
}

window.closeCategoryForm = function() {
  document.getElementById('category-modal').classList.add('hidden');
}

window.editCategory = function(id) {
  const c = categoriesData.find(x => x.idCategoria === id);
  if (!c) return;

  editingCategoryId = id;
  categorySelectedProducts.clear();
  
  const currentProducts = categoriesProducts.filter(p => p.categoria.idCategoria === id);
  currentProducts.forEach(p => categorySelectedProducts.add(p.idProducto));

  document.getElementById('category-form-title').textContent = 'Editar categoria';
  document.getElementById('btn-cat-submit').textContent = 'Actualizar';

  document.getElementById('cat-name').value = c.nombreCategoria;
  document.getElementById('cat-slug').value = c.slug;
  document.getElementById('cat-desc').value = c.descripcion || '';
  document.getElementById('cat-img').value = c.imagenUrl || '';
  
  updateCategoryPreview();
  renderCategoryProductsList();
  
  const curContainer = document.getElementById('cat-current-products-container');
  const curList = document.getElementById('cat-current-products');
  
  curContainer.classList.remove('hidden');
  if (currentProducts.length === 0) {
    curList.innerHTML = '<span class="text-xs text-gray-500">Sin productos asignados.</span>';
  } else {
    curList.innerHTML = currentProducts.map(p => `
      <span class="rounded-full bg-white px-3 py-1 text-xs text-gray-700 ring-1 ring-gray-200">${p.nombre}</span>
    `).join('');
  }

  document.getElementById('category-modal').classList.remove('hidden');
}

function renderCategoryProductsList() {
  const container = document.getElementById('cat-products-list');
  
  const availableProducts = categoriesProducts
    .filter(p => editingCategoryId === null || p.categoria.idCategoria !== editingCategoryId || categorySelectedProducts.has(p.idProducto))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  container.innerHTML = availableProducts.map(p => {
    const isChecked = categorySelectedProducts.has(p.idProducto);
    const classes = isChecked ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white';
    return `
      <label class="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 ${classes}">
        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCategoryProduct(${p.idProducto})" class="mt-1 cursor-pointer" />
        <div class="min-w-0">
          <div class="font-medium text-gray-900">${p.nombre}</div>
          <div class="text-xs text-gray-500">${p.tipoPrenda || ''} · ${p.categoria.nombreCategoria}</div>
        </div>
      </label>
    `;
  }).join('');
}

window.toggleCategoryProduct = function(id) {
  if (categorySelectedProducts.has(id)) {
    categorySelectedProducts.delete(id);
  } else {
    categorySelectedProducts.add(id);
  }
  renderCategoryProductsList();
}

window.submitCategoryForm = async function(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btn-cat-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    const rawName = document.getElementById('cat-name').value.trim();
    const rawSlug = document.getElementById('cat-slug').value.trim();
    
    const payload = {
      nombreCategoria: rawName,
      slug: slugify(rawSlug || rawName),
      descripcion: document.getElementById('cat-desc').value.trim(),
      imagenUrl: document.getElementById('cat-img').value.trim(),
      ordenVisualizacion: 0,
      productoIds: Array.from(categorySelectedProducts)
    };

    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    
    let res;
    if (editingCategoryId === null) {
      res = await fetch(`/api/categorias`, { method: 'POST', headers, body: JSON.stringify(payload) });
    } else {
      res = await fetch(`/api/categorias/${editingCategoryId}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
    }

    if (!res.ok) throw new Error('No se pudo guardar la categoria');
    
    closeCategoryForm();
    await fetchCategoriesData();
  } catch (err) {
    showCategoriesError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = editingCategoryId === null ? 'Crear' : 'Actualizar';
  }
}

window.deleteCategory = async function(id) {
  if (!confirm('Eliminar categoria')) return;

  try {
    const token = getToken();
    const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error('No se pudo eliminar la categoria');
    
    await fetchCategoriesData();
  } catch (err) {
    showCategoriesError(err.message);
  }
}

function showCategoriesError(msg) {
  const el = document.getElementById('cat-error');
  if(el) {
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  }
}
