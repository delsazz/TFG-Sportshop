window.addEventListener('admin-tab-loaded', (event) => {
  if (event.detail.tabId !== 'categorias') return;
  initAdminCategories();
});

let categoriesData = [];
let editingCategoryId = null;

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
          <p class="text-sm text-gray-500">Categorías disponibles para clasificar productos.</p>
          <button onclick="openCategoryForm()" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Nueva categoría</button>
        </div>

        <div id="categories-error" class="hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></div>

        <form id="category-form" onsubmit="submitCategoryForm(event)" class="hidden space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 id="category-form-title" class="text-lg font-semibold text-gray-900">Nueva categoría</h3>
          <label class="block text-sm font-medium text-gray-700">
            Nombre
            <input id="category-name" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label class="block text-sm font-medium text-gray-700">
            Foto representativa
            <input id="category-image-file" type="file" accept="image/*" onchange="handleCategoryImageChange(event)" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
            <input id="category-image" type="hidden" required />
          </label>
          <div id="category-image-preview" class="admin-image-preview hidden"></div>
          <div class="flex gap-3 border-t pt-4">
            <button type="submit" id="category-submit" class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Guardar categoría</button>
            <button type="button" onclick="closeCategoryForm()" class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
          </div>
        </form>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table class="min-w-full text-left">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Categoría</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Foto</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody id="categories-table-body">
              <tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Cargando categorías...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.dataset.initialized = 'true';
  }

  await fetchCategoriesData();
}

async function fetchCategoriesData() {
  try {
    const response = await fetch('/api/categorias');
    if (!response.ok) throw new Error('No se pudieron cargar las categorías');
    categoriesData = await response.json();
    document.getElementById('categories-error').classList.add('hidden');
    renderCategories();
  } catch (error) {
    showCategoriesError(error.message);
  }
}

function renderCategories() {
  const tbody = document.getElementById('categories-table-body');
  if (!categoriesData.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">No hay categorías.</td></tr>';
    return;
  }

  tbody.innerHTML = categoriesData.map((category) => `
    <tr class="border-t border-gray-100 hover:bg-gray-50">
      <td class="px-4 py-3 font-medium text-gray-900">${category.nombreCategoria}</td>
      <td class="px-4 py-3">
        ${category.imagenUrl ? `<img src="${category.imagenUrl}" alt="${category.nombreCategoria}" class="h-14 w-20 rounded object-cover" />` : '<span class="text-sm text-gray-400">Sin foto</span>'}
      </td>
      <td class="px-4 py-3">
        <button onclick="editCategory(${category.idCategoria})" class="rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100">Editar</button>
      </td>
    </tr>
  `).join('');
}

window.openCategoryForm = function() {
  editingCategoryId = null;
  document.getElementById('category-form-title').textContent = 'Nueva categoría';
  document.getElementById('category-submit').textContent = 'Guardar categoría';
  document.getElementById('category-name').value = '';
  document.getElementById('category-image').value = '';
  document.getElementById('category-image-file').value = '';
  renderCategoryImagePreview('');
  document.getElementById('category-form').classList.remove('hidden');
};

window.closeCategoryForm = function() {
  document.getElementById('category-form').classList.add('hidden');
};

window.editCategory = function(id) {
  const category = categoriesData.find((item) => item.idCategoria === id);
  if (!category) return;

  editingCategoryId = id;
  document.getElementById('category-form-title').textContent = 'Editar categoría';
  document.getElementById('category-submit').textContent = 'Actualizar categoría';
  document.getElementById('category-name').value = category.nombreCategoria || '';
  document.getElementById('category-image').value = category.imagenUrl || '';
  document.getElementById('category-image-file').value = '';
  renderCategoryImagePreview(category.imagenUrl || '');
  document.getElementById('category-form').classList.remove('hidden');
};

window.handleCategoryImageChange = function(event) {
  const file = event.target.files?.[0];
  const imageInput = document.getElementById('category-image');
  if (!file) {
    imageInput.value = '';
    renderCategoryImagePreview('');
    return;
  }
  imageInput.value = `/img/categorias/${file.name}`;
  renderCategoryImagePreview(URL.createObjectURL(file), file.name);
};

window.submitCategoryForm = async function(event) {
  event.preventDefault();
  const name = document.getElementById('category-name').value.trim();
  const image = document.getElementById('category-image').value.trim();
  const payload = {
    nombreCategoria: name,
    slug: slugify(name),
    descripcion: '',
    imagenUrl: image,
    ordenVisualizacion: 0,
    productoIds: [],
  };

  try {
    const response = await fetch(editingCategoryId ? `/api/categorias/${editingCategoryId}` : '/api/categorias', {
      method: editingCategoryId ? 'PUT' : 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('No se pudo guardar la categoría');
    const savedCategory = await response.json();
    const imageFile = document.getElementById('category-image-file').files[0];
    if (imageFile && savedCategory.idCategoria) {
      const formData = new FormData();
      formData.append('file', imageFile);
      const imageResponse = await fetch(`/api/categorias/${savedCategory.idCategoria}/imagen`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!imageResponse.ok) throw new Error('Categoría guardada, pero no se pudo guardar la imagen');
    }
    closeCategoryForm();
    await fetchCategoriesData();
  } catch (error) {
    showCategoriesError(error.message);
  }
};

function showCategoriesError(message) {
  const error = document.getElementById('categories-error');
  error.textContent = message;
  error.classList.remove('hidden');
}

function renderCategoryImagePreview(src, fileName = '') {
  const preview = document.getElementById('category-image-preview');
  if (!preview) return;
  if (!src) {
    preview.innerHTML = '';
    preview.classList.add('hidden');
    return;
  }
  preview.innerHTML = `
    <img src="${escapeHtml(src)}" alt="${escapeHtml(fileName || 'Foto de categoría')}" class="admin-form-image-preview rounded-lg border border-gray-200 object-cover" />
    <span class="text-sm text-gray-500">${escapeHtml(fileName || document.getElementById('category-image').value)}</span>
  `;
  preview.classList.remove('hidden');
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
