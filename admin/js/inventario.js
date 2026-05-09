import { getProductos, getCategorias } from './services.js';

document.addEventListener('DOMContentLoaded', async () => {
    const inventoryBody = document.getElementById('inventoryBody');
    const filterNombre = document.getElementById('filterNombre');
    const filterCategoria = document.getElementById('filterCategoria');
    const filterEstado = document.getElementById('filterEstado');
    
    const totalStockEl = document.getElementById('totalStock');
    const lowStockEl = document.getElementById('lowStock');
    const noStockEl = document.getElementById('noStock');

    let allProductos = [];
    let allCategorias = [];

    async function loadData() {
        try {
            const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);
            allProductos = prods;
            allCategorias = cats;
            
            renderFilters();
            renderInventory();
            renderSummary();
        } catch (error) {
            console.error('Error al cargar inventario:', error);
        }
    }

    function renderFilters() {
        filterCategoria.innerHTML = '<option value="">Todas las categorías</option>' + 
            allCategorias.map(c => `<option value="${c.idCategoria}">${c.nombreCategoria}</option>`).join('');
    }

    function renderSummary() {
        const total = allProductos.reduce((sum, p) => sum + p.stock, 0);
        const low = allProductos.filter(p => p.stock > 0 && p.stock <= 5).length;
        const none = allProductos.filter(p => p.stock === 0).length;

        totalStockEl.textContent = total;
        lowStockEl.textContent = low;
        noStockEl.textContent = none;
    }

    function renderInventory() {
        const search = filterNombre.value.toLowerCase();
        const catId = filterCategoria.value;
        const status = filterEstado.value;

        const filtered = allProductos.filter(p => {
            const matchSearch = p.nombre.toLowerCase().includes(search);
            const matchCat = !catId || p.categoria.idCategoria == catId;
            let matchStatus = true;
            if (status === 'bajo') matchStatus = p.stock > 0 && p.stock <= 5;
            if (status === 'sin') matchStatus = p.stock === 0;

            return matchSearch && matchCat && matchStatus;
        });

        inventoryBody.innerHTML = filtered.map(p => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">${p.nombre}</div>
                    <div class="text-xs text-gray-500">${p.tipoPrenda || ''} - ${p.color || ''}</div>
                </td>
                <td class="px-6 py-4 text-gray-700">
                    <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        ${p.categoria.nombreCategoria}
                    </span>
                </td>
                <td class="px-6 py-4 font-medium text-gray-900">€${p.precio.toFixed(2)}</td>
                <td class="px-6 py-4 text-right text-gray-900 font-semibold">${p.stock}</td>
                <td class="px-6 py-4 text-center">
                    ${getStatusBadge(p.stock)}
                </td>
            </tr>
        `).join('');
    }

    function getStatusBadge(stock) {
        if (stock === 0) return '<span class="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Sin stock</span>';
        if (stock <= 5) return '<span class="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">Bajo stock</span>';
        return '<span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">En stock</span>';
    }

    [filterNombre, filterCategoria, filterEstado].forEach(el => el.addEventListener('input', renderInventory));

    loadData();
});
