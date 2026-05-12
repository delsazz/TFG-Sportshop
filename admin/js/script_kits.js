import { getKits, getProductos, getCategorias } from './servicios.js';
import { request } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const kitsBody = document.getElementById('kitsBody');
    const kitForm = document.getElementById('kitForm');
    const filterNombre = document.getElementById('filterNombre');
    const filterCategoria = document.getElementById('filterCategoria');
    const formCategoria = document.getElementById('formCategoria');
    const kitProductsList = document.getElementById('kitProductsList');
    const btnNewKit = document.getElementById('btnNewKit');
    const btnCancel = document.getElementById('btnCancel');
    const alertContainer = document.getElementById('alertContainer');

    let allKits = [];
    let allProductos = [];
    let allCategorias = [];
    let selectedProducts = new Map(); // idProducto -> cantidad

    async function loadData() {
        try {
            const [k, p, c] = await Promise.all([getKits(), getProductos(), getCategorias()]);
            allKits = k;
            allProductos = p;
            allCategorias = c;

            renderFilters();
            renderKits();
            renderProductList();
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    function renderFilters() {
        const options = allCategorias.map(c => `<option value="${c.idCategoria}">${c.nombreCategoria}</option>`).join('');
        formCategoria.innerHTML = options;
        filterCategoria.innerHTML = '<option value="">Todas las categorías</option>' + options;
    }

    function renderProductList() {
        kitProductsList.innerHTML = allProductos.map(p => `
            <div class="flex items-center gap-4 p-2 border rounded">
                <input type="checkbox" class="prod-check w-4 h-4" data-id="${p.idProducto}" ${selectedProducts.has(p.idProducto) ? 'checked' : ''}>
                <div class="flex-1">
                    <div class="font-semibold">${p.nombre}</div>
                    <div class="text-sm text-gray-600">${p.tipoPrenda || ''} - ${p.color || ''}</div>
                </div>
                <div class="flex items-center gap-2 ${selectedProducts.has(p.idProducto) ? '' : 'hidden'}" id="qty-container-${p.idProducto}">
                    <label class="text-sm">Cant:</label>
                    <input type="number" min="1" class="prod-qty w-12 border rounded px-2 py-1" data-id="${p.idProducto}" value="${selectedProducts.get(p.idProducto) || 1}">
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.prod-check').forEach(check => {
            check.addEventListener('change', (e) => {
                const id = parseInt(check.dataset.id);
                const container = document.getElementById(`qty-container-${id}`);
                if (e.target.checked) {
                    selectedProducts.set(id, 1);
                    container.classList.remove('hidden');
                } else {
                    selectedProducts.delete(id);
                    container.classList.add('hidden');
                }
            });
        });

        document.querySelectorAll('.prod-qty').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = parseInt(input.dataset.id);
                if (selectedProducts.has(id)) {
                    selectedProducts.set(id, parseInt(e.target.value) || 1);
                }
            });
        });
    }

    function renderKits() {
        const search = filterNombre.value.toLowerCase();
        const catId = filterCategoria.value;

        const filtered = allKits.filter(k => {
            const matchSearch = k.nombre.toLowerCase().includes(search);
            const matchCat = !catId || (k.categoria && k.categoria.idCategoria == catId);
            return matchSearch && matchCat;
        });

        kitsBody.innerHTML = filtered.map(k => `
            <tr class="border-t hover:bg-gray-50">
                <td class="px-4 py-2 font-semibold">${k.nombre}</td>
                <td class="px-4 py-2">${k.categoria ? k.categoria.nombreCategoria : 'Sin categoría'}</td>
                <td class="px-4 py-2">${k.productos ? k.productos.length : 0}</td>
                <td class="px-4 py-2">${k.precio.toFixed(2)} EUR</td>
                <td class="px-4 py-2">${k.stock}</td>
                <td class="px-4 py-2">
                    <button class="btn-edit text-blue-600 hover:underline" data-id="${k.idKit}">Editar</button>
                    <button class="btn-delete text-red-600 hover:underline ml-2" data-id="${k.idKit}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => editKit(btn.dataset.id)));
        document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => deleteKit(btn.dataset.id)));
    }

    function editKit(id) {
        const k = allKits.find(kit => kit.idKit == id);
        if (!k) return;

        document.getElementById('editingId').value = k.idKit;
        document.getElementById('formNombre').value = k.nombre;
        document.getElementById('formPrecio').value = k.precio;
        document.getElementById('formStock').value = k.stock;
        document.getElementById('formCategoria').value = k.categoria ? k.categoria.idCategoria : '';
        document.getElementById('formDescripcion').value = k.descripcion || '';

        selectedProducts = new Map(k.productos.map(kp => [kp.producto.idProducto, kp.cantidad]));
        renderProductList();

        document.getElementById('formTitle').textContent = 'Editar Kit';
        kitForm.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function deleteKit(id) {
        if (!confirm('¿Seguro que quieres eliminar este kit?')) return;
        try {
            await request(`/admin/kits/${id}`, { method: 'DELETE' });
            loadData();
            showAlert('Kit eliminado', 'green');
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    btnNewKit.addEventListener('click', () => {
        kitForm.reset();
        document.getElementById('editingId').value = '';
        selectedProducts = new Map();
        renderProductList();
        document.getElementById('formTitle').textContent = 'Crear Kit';
        kitForm.classList.remove('hidden');
    });

    btnCancel.addEventListener('click', () => kitForm.classList.add('hidden'));

    kitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editingId').value;
        const payload = {
            nombre: document.getElementById('formNombre').value,
            precio: parseFloat(document.getElementById('formPrecio').value),
            stock: parseInt(document.getElementById('formStock').value),
            categoriaId: parseInt(document.getElementById('formCategoria').value),
            descripcion: document.getElementById('formDescripcion').value,
            productos: Array.from(selectedProducts.entries()).map(([pid, qty]) => ({ productoId: pid, cantidad: qty }))
        };

        try {
            if (id) {
                await request(`/admin/kits/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await request('/admin/kits', { method: 'POST', body: JSON.stringify(payload) });
            }
            kitForm.classList.add('hidden');
            loadData();
            showAlert('Kit guardado', 'green');
        } catch (error) {
            showAlert(error.message, 'red');
        }
    });

    filterNombre.addEventListener('input', renderKits);
    filterCategoria.addEventListener('change', renderKits);

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

