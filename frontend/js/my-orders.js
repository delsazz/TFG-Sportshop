document.addEventListener('DOMContentLoaded', async () => {
  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const contentContainer = document.getElementById('content-container');
  const emptyState = document.getElementById('empty-state');
  const ordersList = document.getElementById('orders-list');

  function getEstadoClass(estado) {
    const estadoLower = (estado || '').toLowerCase();
    const clases = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'pagado': 'bg-blue-100 text-blue-800',
      'en preparación': 'bg-purple-100 text-purple-800',
      'entregado': 'bg-green-100 text-green-800',
    };
    return clases[estadoLower] || 'bg-gray-100 text-gray-700';
  }

  async function fetchMisPedidos() {
    try {
      const token = getToken();
      if (!token) {
        window.location.href = '/login.html';
        return;
      }

      const res = await fetch('/api/pedidos/mis-pedidos', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        renderPedidos(data);
      } else {
        showError('No se pudieron cargar tus pedidos');
      }
    } catch (err) {
      showError('Error de conexión');
    }
  }

  function renderPedidos(pedidos) {
    loadingContainer.classList.add('hidden');
    contentContainer.classList.remove('hidden');

    if (!pedidos || pedidos.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    ordersList.innerHTML = '';
    pedidos.forEach(pedido => {
      const a = document.createElement('a');
      a.href = `/order-detail.html?id=${pedido.idPedido}`;
      a.className = 'block bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition sm:p-6';
      
      const dateStr = new Date(pedido.fecha).toLocaleDateString('es-ES');
      const totalStr = (pedido.total || 0).toFixed(2);
      const estadoClass = getEstadoClass(pedido.estado);

      a.innerHTML = `
        <div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <p class="text-sm text-slate-500">
              Pedido #${pedido.idPedido} • ${dateStr}
            </p>
            <p class="text-2xl font-bold mt-1">${totalStr} €</p>
          </div>
          <span class="w-fit px-4 py-1.5 rounded-full text-sm font-medium ${estadoClass}">
            ${pedido.estado || 'Desconocido'}
          </span>
        </div>
      `;
      ordersList.appendChild(a);
    });
  }

  function showError(msg) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.textContent = msg;
  }

  fetchMisPedidos();
});
