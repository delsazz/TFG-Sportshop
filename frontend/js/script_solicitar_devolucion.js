document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const orderId = Number(params.get('idPedido'));
  const detailId = Number(params.get('idDetalle'));
  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const contentContainer = document.getElementById('content-container');
  let selectedItem;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function imageUrl(path) {
    const value = String(path || '').trim();
    if (!value) return '/img/sportshop.jpg';
    return value.startsWith('/') || /^(https?:|data:)/i.test(value) ? value : `/${value}`;
  }

  function money(value) {
    return `${Number(value || 0).toFixed(2)} EUR`;
  }

  function showError(message) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.textContent = message;
  }

  if (!orderId || !detailId) {
    showError('No se ha seleccionado un producto valido.');
    return;
  }

  document.getElementById('back-to-order').href = `detalle_pedido.html?id=${encodeURIComponent(orderId)}`;

  try {
    const token = typeof getToken === 'function' ? getToken() : sessionStorage.getItem('token');
    if (!token) {
      window.location.href = 'iniciar_sesion.html';
      return;
    }

    const response = await fetch(`/api/pedidos/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('No se pudo cargar el pedido.');

    const pedido = await response.json();
    selectedItem = (pedido.detalles || []).find(item => Number(item.idDetalle) === detailId);
    if (!selectedItem) throw new Error('El producto no pertenece a este pedido.');

    loadingContainer.classList.add('hidden');
    contentContainer.classList.remove('hidden');
    document.getElementById('return-order').textContent = `Pedido #${pedido.idPedido}`;
    document.getElementById('return-quantity').max = selectedItem.cantidad;
    document.getElementById('return-quantity').value = selectedItem.cantidad;
    document.getElementById('return-product').innerHTML = `
      <div class="order-product">
        <img src="${imageUrl(selectedItem.imagen)}" alt="${escapeHtml(selectedItem.nombreProducto || 'Producto')}" />
        <div>
          <strong>${escapeHtml(selectedItem.nombreProducto || 'Producto')}</strong>
          <p class="line-detail">Talla ${escapeHtml(selectedItem.talla || '-')} · ${escapeHtml(selectedItem.cantidad)} unidades · ${money(selectedItem.precioUnitario)} / ud.</p>
        </div>
      </div>
    `;

    document.getElementById('return-form').addEventListener('submit', async event => {
      event.preventDefault();
      const message = document.getElementById('return-message');
      const quantity = Number(document.getElementById('return-quantity').value);
      const reason = document.getElementById('return-reason').value.trim();
      try {
        const submitResponse = await fetch('/api/devoluciones', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idPedido: orderId,
            motivo: reason,
            items: [{ idDetallePedido: detailId, cantidad: quantity }],
          }),
        });
        const data = await submitResponse.json().catch(() => ({}));
        if (!submitResponse.ok) throw new Error(data.message || data.error || 'No se pudo solicitar la devolucion.');
        window.location.href = `detalle_pedido.html?id=${encodeURIComponent(orderId)}`;
      } catch (error) {
        message.textContent = error.message;
        message.className = 'return-form-message return-form-error';
      }
    });
  } catch (error) {
    showError(error.message || 'Error de conexion.');
  }

  if (window.lucide) lucide.createIcons();
});
