document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();

  const urlParams = new URLSearchParams(window.location.search);
  const orderIdStr = urlParams.get('id');
  const orderId = parseInt(orderIdStr, 10);

  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const contentContainer = document.getElementById('content-container');
  
  if (!orderId || isNaN(orderId)) {
    showError('Pedido no válido');
    return;
  }

  async function fetchPedidoDetalle() {
    try {
      const token = getToken();
      if (!token) {
        window.location.href = '/iniciar_sesion.html';
        return;
      }

      const res = await fetch(`/api/pedidos/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        renderPedido(data);
      } else {
        showError('Pedido no encontrado o no tienes permiso.');
      }
    } catch (err) {
      showError('Error de conexión');
    }
  }

  function renderPedido(pedido) {
    loadingContainer.classList.add('hidden');
    contentContainer.classList.remove('hidden');

    document.getElementById('order-title').textContent = `Pedido #${pedido.idPedido}`;
    document.getElementById('order-date').textContent = `Realizado el ${new Date(pedido.fecha).toLocaleDateString('es-ES')}`;
    document.getElementById('order-status').textContent = pedido.estado || 'Desconocido';
    document.getElementById('order-total').textContent = `${(pedido.total || 0).toFixed(2)} €`;

    const itemsContainer = document.getElementById('order-items');
    itemsContainer.innerHTML = '';

    if (pedido.detalles && pedido.detalles.length > 0) {
      pedido.detalles.forEach(item => {
        const div = document.createElement('div');
        div.className = 'py-5 flex flex-col gap-3 sm:flex-row sm:justify-between';
        
        const subtotal = item.cantidad * item.precioUnitario;
        
        div.innerHTML = `
          <div>
            <p class="font-medium text-slate-900">${item.nombreProducto}</p>
            <p class="text-sm text-slate-500">Talla: ${item.talla}</p>
          </div>
          <div class="sm:text-right text-slate-700">
            <p>${item.cantidad} uds × ${item.precioUnitario.toFixed(2)} €</p>
            <p class="font-medium mt-1 text-slate-900">
              ${subtotal.toFixed(2)} €
            </p>
          </div>
        `;
        itemsContainer.appendChild(div);
      });
    } else {
      itemsContainer.innerHTML = '<p class="py-5 text-slate-500">No hay productos en este pedido.</p>';
    }
  }

  function showError(msg) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.textContent = msg;
  }

  fetchPedidoDetalle();
});

