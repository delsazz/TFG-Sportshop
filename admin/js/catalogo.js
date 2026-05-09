import { getProductos, getCategorias } from './services.js';
import { request } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const catalogBody = document.getElementById('catalogBody');
    const filterNombre = document.getElementById('filterNombre');
    const filterCategoria = document.getElementById('filterCategoria');
    const formCategoria = document.getElementById('formCategoria');
    const productForm = document.getElementById('productForm');
    const btnNewProduct = document.getElementById('btnNewProduct');
    const btnCancel = document.getElementById('btnCancel');
    const alertContainer = document.getElementById('alertContainer');

    let allProductos = [];
    let allCategorias = [];

    async function loadData() {
        try {
            const [productos, categorias] = await Promise.all([
                getProductos(),
                getCategorias()
            ]);
            allProductos = productos;
            allCategorias = categorias;
            
            renderCategorias();
            renderProductos();
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    function renderCategorias() {
        const options = allCategorias.map(cat => `<option value="${cat.idCategoria}">${cat.nombreCategoria}</option>`).join('');
        formCategoria.innerHTML = options;
        filterCategoria.innerHTML = '<option value="">Todas las categorías</option>' + options;
    }

    function renderProductos() {
        const search = filterNombre.value.toLowerCase();
        const catId = filterCategoria.value;

        const filtered = allProductos.filter(p => {
            const matchSearch = p.nombre.toLowerCase().includes(search);
            const matchCat = !catId || p.categoria.idCategoria == catId;
            return matchSearch && matchCat;
        });

        catalogBody.innerHTML = filtered.map(p => `
            <tr class="border-t border-gray-100">
                <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">${p.nombre}</div>
                    <div class="text-sm text-gray-500">${p.tipoPrenda || 'Sin tipo'}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">${p.categoria.nombreCategoria}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${p.precio.toFixed(2)} EUR</td>
                <td class="px-4 py-3 text-sm text-gray-700">${p.stock}</td>
                <td class="px-4 py-3">
                    <div class="flex gap-2">
                        <button class="btn-edit rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100" data-id="${p.idProducto}">Editar</button>
                        <button class="btn-delete rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100" data-id="${p.idProducto}">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Re-attach event listeners
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editProduct(btn.dataset.id));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
        });
    }

    function showAlert(message, color) {
        alertContainer.innerHTML = `
            <div class="rounded-lg border border-${color}-200 bg-${color}-50 px-4 py-3 text-sm text-${color}-700">
                ${message}
            </div>
        `;
        setTimeout(() => alertContainer.innerHTML = '', 5000);
    }

    async function deleteProduct(id) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await request(`/catalogo/${id}`, { method: 'DELETE' });
            allProductos = allProductos.filter(p => p.idProducto != id);
            renderProductos();
            showAlert('Producto eliminado con éxito', 'green');
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    function editProduct(id) {
        const p = allProductos.find(p => p.idProducto == id);
        if (!p) return;

        document.getElementById('editingId').value = p.idProducto;
        document.getElementById('formNombre').value = p.nombre;
        document.getElementById('formTipo').value = p.tipoPrenda || '';
        document.getElementById('formColor').value = p.color || '';
        document.getElementById('formPrecio').value = p.precio;
        document.getElementById('formCategoria').value = p.categoria.idCategoria;
        document.getElementById('formStock').value = p.stock;
        
        document.getElementById('formTitle').textContent = 'Editar producto';
        productForm.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnNewProduct.addEventListener('click', () => {
        productForm.reset();
        document.getElementById('editingId').value = '';
        document.getElementById('formTitle').textContent = 'Crear nuevo producto';
        productForm.classList.remove('hidden');
    });

    btnCancel.addEventListener('click', () => {
        productForm.classList.add('hidden');
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editingId').value;
        const payload = {
            nombre: document.getElementById('formNombre').value,
            tipoPrenda: document.getElementById('formTipo').value,
            color: document.getElementById('formColor').value,
            precio: parseFloat(document.getElementById('formPrecio').value),
            categoriaId: parseInt(document.getElementById('formCategoria').value),
            stock: parseInt(document.getElementById('formStock').value)
        };

        try {
            if (id) {
                const updated = await request(`/catalogo/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                allProductos = allProductos.map(p => p.idProducto == id ? updated : p);
            } else {
                const created = await request('/catalogo', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                allProductos.push(created);
            }
            renderProductos();
            productForm.classList.add('hidden');
            showAlert('Producto guardado con éxito', 'green');
        } catch (error) {
            showAlert(error.message, 'red');
        }
    });

    filterNombre.addEventListener('input', renderProductos);
    filterCategoria.addEventListener('change', renderProductos);

    loadData();
});
