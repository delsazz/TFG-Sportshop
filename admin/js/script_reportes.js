import { request } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const fechaDesde = document.getElementById('fechaDesde');
    const fechaHasta = document.getElementById('fechaHasta');
    const reportsContent = document.getElementById('reportsContent');
    const noData = document.getElementById('noData');
    const reportsBody = document.getElementById('reportsBody');

    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalStudentsEl = document.getElementById('totalStudents');
    const criticalStockEl = document.getElementById('criticalStock');

    async function loadData() {
        const from = fechaDesde.value;
        const to = fechaHasta.value;
        
        let url = '/admin/informes/pedidos';
        const params = new URLSearchParams();
        if (from) params.append('fechaDesde', from);
        if (to) params.append('fechaHasta', to);
        if (params.toString()) url += `?${params.toString()}`;

        try {
            const [pedidosData, stockData] = await Promise.all([
                request(url),
                request('/admin/informes/stock')
            ]);

            if (!pedidosData || pedidosData.totalPedidos === 0) {
                reportsContent.classList.add('hidden');
                noData.classList.remove('hidden');
            } else {
                noData.classList.add('hidden');
                reportsContent.classList.remove('hidden');
                
                totalOrdersEl.textContent = pedidosData.totalPedidos;
                totalRevenueEl.textContent = `€${pedidosData.importeTotal.toFixed(2)}`;
                totalStudentsEl.textContent = pedidosData.totalAlumnos;
                criticalStockEl.textContent = stockData ? stockData.productosBajoStock : 0;

                reportsBody.innerHTML = pedidosData.pedidos.map(p => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 font-mono text-gray-900">#${p.idPedido}</td>
                        <td class="px-6 py-4 text-gray-700">${p.usuario ? `${p.usuario.nombre} ${p.usuario.apellidos}` : 'N/A'}</td>
                        <td class="px-6 py-4 text-gray-700">${new Date(p.fecha).toLocaleDateString('es-ES')}</td>
                        <td class="px-6 py-4 text-right font-bold text-gray-900">€${p.total.toFixed(2)}</td>
                        <td class="px-6 py-4 text-center">
                            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                                ${p.estado}
                            </span>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error al cargar reportes:', error);
        }
    }

    [fechaDesde, fechaHasta].forEach(el => el.addEventListener('change', loadData));

    loadData();
});
