import { getProductos, getPedidos, getUsuarios } from './services.js';

document.addEventListener('DOMContentLoaded', async () => {
    const statsGrid = document.getElementById('statsGrid');
    const ordersBody = document.getElementById('ordersBody');

    try {
        const [productos, pedidos, usuarios] = await Promise.all([
            getProductos(),
            getPedidos(),
            getUsuarios()
        ]);

        const stats = calculateStats(productos, pedidos, usuarios);
        renderStats(stats);
        renderRecentOrders(pedidos.slice(0, 5));

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }

    function calculateStats(productos, pedidos, usuarios) {
        const totalVentas = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
        const statusMap = pedidos.reduce((acc, p) => {
            acc[p.estado] = (acc[p.estado] || 0) + 1;
            return acc;
        }, {});

        return {
            productos: productos.length,
            usuarios: usuarios.length,
            pedidos: pedidos.length,
            totalVentas,
            pendientes: statusMap['PENDIENTE'] || 0,
            pagados: statusMap['PAGADO'] || 0,
            enviados: statusMap['ENVIADO'] || 0,
            ticketPromedio: pedidos.length > 0 ? totalVentas / pedidos.length : 0
        };
    }

    function renderStats(stats) {
        const cards = [
            { label: 'Productos', value: stats.productos, color: 'blue' },
            { label: 'Alumnos', value: stats.usuarios, color: 'green' },
            { label: 'Pedidos', value: stats.pedidos, color: 'purple', subtitle: `Total: €${stats.totalVentas.toFixed(2)}` },
            { label: 'Ticket Promedio', value: `€${stats.ticketPromedio.toFixed(2)}`, color: 'amber' }
        ];

        statsGrid.innerHTML = cards.map(card => `
            <div class="rounded-xl border p-6 shadow-sm border-${card.color}-200 bg-${card.color}-50">
                <p class="text-sm font-medium text-${card.color}-900">${card.label}</p>
                <p class="mt-2 text-3xl font-bold text-${card.color}-900">${card.value}</p>
                ${card.subtitle ? `<p class="mt-1 text-xs text-${card.color}-900 opacity-75">${card.subtitle}</p>` : ''}
            </div>
        `).join('');
    }

    function renderRecentOrders(recentPedidos) {
        ordersBody.innerHTML = recentPedidos.map(pedido => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 font-mono text-gray-900">#${pedido.idPedido}</td>
                <td class="px-6 py-3 text-gray-700">${pedido.usuario ? `${pedido.usuario.nombre} ${pedido.usuario.apellidos}` : 'Sin usuario'}</td>
                <td class="px-6 py-3 text-gray-700">${new Date(pedido.fecha).toLocaleDateString('es-ES')}</td>
                <td class="px-6 py-3 font-medium text-gray-900">€${pedido.total.toFixed(2)}</td>
                <td class="px-6 py-3">${badgeEstado(pedido.estado)}</td>
            </tr>
        `).join('');
    }

    function badgeEstado(estado) {
        const styles = {
            PENDIENTE: 'bg-yellow-100 text-yellow-800',
            PAGADO: 'bg-emerald-100 text-emerald-800',
            ENVIADO: 'bg-cyan-100 text-cyan-800',
            CANCELADO: 'bg-red-100 text-red-800',
        };
        const style = styles[estado] || 'bg-gray-100 text-gray-700';
        return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}">${estado}</span>`;
    }
});
