import { getCategorias } from './servicios.js';
import { request } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const categoriesBody = document.getElementById('categoriesBody');
    const filterNombre = document.getElementById('filterNombre');
    const catCount = document.getElementById('catCount');
    const categoryModal = document.getElementById('categoryModal');
    const categoryForm = document.getElementById('categoryForm');
    const btnNewCategory = document.getElementById('btnNewCategory');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const alertContainer = document.getElementById('alertContainer');

    let allCategorias = [];

    async function loadData() {
        try {
            allCategorias = await getCategorias();
            renderCategories();
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    function renderCategories() {
        const search = filterNombre.value.toLowerCase();
        const filtered = allCategorias.filter(c => 
            c.nombreCategoria.toLowerCase().includes(search) || 
            (c.slug && c.slug.toLowerCase().includes(search))
        );

        catCount.textContent = `${filtered.length} categorías`;

        categoriesBody.innerHTML = filtered.map(c => `
            <tr class="border-t border-gray-100 align-top hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">${c.nombreCategoria}</div>
                    <div class="mt-1 max-w-md text-xs text-gray-500">${c.descripcion || ''}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">${c.slug || ''}</td>
                <td class="px-4 py-3">
                    ${c.imagenUrl ? `<img src="${c.imagenUrl}" class="h-10 w-16 rounded object-cover">` : '<span class="text-xs text-gray-400">Sin foto</span>'}
                </td>
                <td class="px-4 py-3">
                    <div class="flex gap-2">
                        <button class="btn-edit rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100" data-id="${c.idCategoria}">Editar</button>
                        <button class="btn-delete rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100" data-id="${c.idCategoria}">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editCategory(btn.dataset.id));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteCategory(btn.dataset.id));
        });
    }

    function editCategory(id) {
        const c = allCategorias.find(c => c.idCategoria == id);
        if (!c) return;

        document.getElementById('editingId').value = c.idCategoria;
        document.getElementById('formNombre').value = c.nombreCategoria;
        document.getElementById('formSlug').value = c.slug || '';
        document.getElementById('formDescripcion').value = c.descripcion || '';
        document.getElementById('formImagen').value = c.imagenUrl || '';

        document.getElementById('modalTitle').textContent = 'Editar categoría';
        categoryModal.classList.remove('hidden');
    }

    async function deleteCategory(id) {
        if (!confirm('¿Seguro que quieres eliminar esta categoría?')) return;
        try {
            await request(`/categorias/${id}`, { method: 'DELETE' });
            allCategorias = allCategorias.filter(c => c.idCategoria != id);
            renderCategories();
            showAlert('Categoría eliminada', 'green');
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    btnNewCategory.addEventListener('click', () => {
        categoryForm.reset();
        document.getElementById('editingId').value = '';
        document.getElementById('modalTitle').textContent = 'Nueva categoría';
        categoryModal.classList.remove('hidden');
    });

    btnCancelModal.addEventListener('click', () => {
        categoryModal.classList.add('hidden');
    });

    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editingId').value;
        const payload = {
            nombreCategoria: document.getElementById('formNombre').value,
            slug: document.getElementById('formSlug').value,
            descripcion: document.getElementById('formDescripcion').value,
            imagenUrl: document.getElementById('formImagen').value
        };

        try {
            if (id) {
                await request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await request('/categorias', { method: 'POST', body: JSON.stringify(payload) });
            }
            categoryModal.classList.add('hidden');
            loadData();
            showAlert('Categoría guardada con éxito', 'green');
        } catch (error) {
            showAlert(error.message, 'red');
        }
    });

    filterNombre.addEventListener('input', renderCategories);

    function showAlert(message, color) {
        alertContainer.innerHTML = `
            <div class="rounded-lg border border-${color}-200 bg-${color}-50 px-4 py-3 text-sm text-${color}-700">
                ${message}
            </div>
        `;
        setTimeout(() => alertContainer.innerHTML = '', 5000);
    }

    loadData();
});

