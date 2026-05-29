window.addEventListener('admin-tab-loaded', async (e) => {
  if (e.detail.tabId !== 'dashboard') return;

  const apiBaseUrl = '/api';
  const token = getToken();

  if (!token) return;

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  const errorContainer = document.getElementById('dashboard-error');
  
  try {
    errorContainer.classList.add('hidden');

    const [productosRes, pedidosRes, usuariosRes] = await Promise.all([
      fetch(`${apiBaseUrl}/productos`, { headers }),
      fetch(`${apiBaseUrl}/pedidos`, { headers }),
      fetch(`${apiBaseUrl}/usuarios`, { headers })
    ]);

    if (!productosRes.ok || !pedidosRes.ok || !usuariosRes.ok) {
      throw new Error('Error al cargar datos');
    }

    const productos = await productosRes.json();
    const pedidos = await pedidosRes.json();
    const usuarios = await usuariosRes.json();

    const statusMap = pedidos.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});

    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const ticketPromedio = pedidos.length > 0 ? totalVentas / pedidos.length : 0;
    const productosActivos = productos.filter(p => p.stock > 0).length;

    // Fill UI
    document.getElementById('stat-productos').textContent = productos.length;
    document.getElementById('stat-productos-sub').textContent = `${productosActivos} en stock`;
    
    document.getElementById('stat-clientes').textContent = usuarios.length;
    
    document.getElementById('stat-pedidos').textContent = pedidos.length;
    document.getElementById('stat-ventas-sub').textContent = `Venta total: €${totalVentas.toFixed(2)}`;
    
    document.getElementById('stat-ticket').textContent = `€${ticketPromedio.toFixed(2)}`;
    document.getElementById('stat-ticket-sub').textContent = `${pedidos.length} pedidos`;

    document.getElementById('stat-pendientes').textContent = statusMap['PENDIENTE'] || 0;
    document.getElementById('stat-enviados').textContent = statusMap['ENVIADO'] || 0;
    document.getElementById('stat-pagados').textContent = statusMap['PAGADO'] || 0;
    document.getElementById('stat-cancelados').textContent = statusMap['CANCELADO'] || 0;

    // Recent orders
    const recientes = pedidos.slice(0, 5);
    const recentOrdersContainer = document.getElementById('dashboard-recent-orders-container');
    
    if (recientes.length === 0) {
      recentOrdersContainer.innerHTML = '<div class="px-6 py-8 text-center text-gray-500">No hay pedidos registrados</div>';
    } else {
      let rows = recientes.map(pedido => {
        const dateStr = new Date(pedido.fechaPedido).toLocaleDateString('es-ES');
        const userStr = pedido.usuario ? `${pedido.usuario.nombre} ${pedido.usuario.apellidos}` : 'Sin usuario';
        return `
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-3 font-mono text-gray-900">#${pedido.idPedido}</td>
            <td class="px-6 py-3 text-gray-700">${userStr}</td>
            <td class="px-6 py-3 text-gray-700">${dateStr}</td>
            <td class="px-6 py-3 font-medium text-gray-900">€${(pedido.total || 0).toFixed(2)}</td>
            <td class="px-6 py-3">${badgeEstado(pedido.estado)}</td>
          </tr>
        `;
      }).join('');

      recentOrdersContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left font-medium text-gray-700">ID Pedido</th>
                <th class="px-6 py-3 text-left font-medium text-gray-700">Cliente</th>
                <th class="px-6 py-3 text-left font-medium text-gray-700">Fecha</th>
                <th class="px-6 py-3 text-left font-medium text-gray-700">Total</th>
                <th class="px-6 py-3 text-left font-medium text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

  } catch (err) {
    errorContainer.textContent = err.message || 'No se pudieron cargar los indicadores';
    errorContainer.classList.remove('hidden');
  }
});

function badgeEstado(estado) {
  const styles = {
    'PENDIENTE': 'bg-yellow-100 text-yellow-800',
    'EN_PROCESO': 'bg-blue-100 text-blue-800',
    'COMPLETADO': 'bg-green-100 text-green-800',
    'CANCELADO': 'bg-red-100 text-red-800',
    'PAGADO': 'bg-emerald-100 text-emerald-800',
    'ENVIADO': 'bg-cyan-100 text-cyan-800',
    'ENTREGADO': 'bg-green-100 text-green-800',
    'ENTREGADO_PARCIAL': 'bg-orange-100 text-orange-800',
  };
  const cls = styles[estado] ?? 'bg-gray-100 text-gray-700';
  return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}">${estado}</span>`;
}
