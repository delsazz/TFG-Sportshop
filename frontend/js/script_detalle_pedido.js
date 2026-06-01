document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();

  const orderId = Number(new URLSearchParams(window.location.search).get('id'));
  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const contentContainer = document.getElementById('content-container');

  if (!orderId) {
    showError('Pedido no válido');
    return;
  }

  async function fetchPedidoDetalle() {
    try {
      const token = getToken();
      if (!token) {
        window.location.href = 'iniciar_sesion.html';
        return;
      }

      const response = await fetch(`/api/pedidos/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        showError('Pedido no encontrado o no tienes permiso.');
        return;
      }

      renderPedido(await response.json());
    } catch {
      showError('Error de conexión');
    }
  }

  function renderPedido(pedido) {
    loadingContainer.classList.add('hidden');
    contentContainer.classList.remove('hidden');

    document.getElementById('order-title').textContent = `Pedido #${pedido.idPedido}`;
    document.getElementById('order-date').textContent = `Realizado el ${new Date(pedido.fechaPedido).toLocaleDateString('es-ES')}`;
    document.getElementById('order-status').textContent = pedido.estado || 'Desconocido';
    document.getElementById('order-total').textContent = `${Number(pedido.total || 0).toFixed(2)} €`;

    const itemsContainer = document.getElementById('order-items');
    itemsContainer.innerHTML = pedido.detalles?.length
      ? pedido.detalles.map((item) => {
          const subtotal = Number(item.cantidad || 0) * Number(item.precioUnitario || 0);
          return `
            <div class="py-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div>
                <p class="font-medium text-slate-900">${item.nombreProducto}</p>
                <p class="text-sm text-slate-500">Talla: ${item.talla || '-'}</p>
              </div>
              <div class="sm:text-right text-slate-700">
                <p>${item.cantidad} uds x ${Number(item.precioUnitario || 0).toFixed(2)} €</p>
                <p class="font-medium mt-1 text-slate-900">${subtotal.toFixed(2)} €</p>
              </div>
            </div>
          `;
        }).join('')
      : '<p class="py-5 text-slate-500">No hay productos en este pedido.</p>';

    renderDeliveryConfirmation(pedido);
    renderReturnRequest(pedido);
  }

  function renderDeliveryConfirmation(pedido) {
    document.getElementById('delivery-section')?.remove();
    const delivered = String(pedido.estado || '').toUpperCase().includes('ENTREGADO');
    if (!delivered) return;

    const alreadyConfirmed = pedido.entregas?.some((entrega) => entrega.firmaRecepcion);
    const section = document.createElement('section');
    section.id = 'delivery-section';
    section.className = 'mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm';
    section.innerHTML = `
      <h2 class="text-xl font-semibold mb-4">Entrega</h2>
      <label class="flex items-center gap-3 text-slate-700">
        <input id="confirm-delivery-check" type="checkbox" ${alreadyConfirmed ? 'checked disabled' : ''} class="h-5 w-5 rounded border-slate-300" />
        Marcar pedido como entregado
        <span id="delivery-green-tick" class="${alreadyConfirmed ? '' : 'hidden'} text-2xl font-bold text-green-600">✓</span>
      </label>
      <p id="delivery-message" class="mt-3 text-sm text-slate-500">${alreadyConfirmed ? 'Entrega confirmada.' : 'Al marcarlo se confirmará la recepción del pedido.'}</p>
    `;
    contentContainer.appendChild(section);

    document.getElementById('confirm-delivery-check')?.addEventListener('change', async (event) => {
      if (!event.target.checked) return;
      await confirmDelivery(pedido);
    });
  }

  async function confirmDelivery(pedido) {
    const message = document.getElementById('delivery-message');
    try {
      const response = await fetch(`/api/pedidos/${pedido.idPedido}/firmar-entrega`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipoReceptor: 'cliente',
          nombreRecibe: sessionStorage.getItem('userName') || 'Cliente',
          documentoRecibe: 'Confirmado por cliente',
          firmaRecepcion: 'confirmado',
        }),
      });

      if (!response.ok) throw new Error('No se pudo confirmar la entrega');
      document.getElementById('delivery-green-tick').classList.remove('hidden');
      document.getElementById('confirm-delivery-check').disabled = true;
      message.textContent = 'Entrega confirmada.';
    } catch (error) {
      message.textContent = error.message;
      document.getElementById('confirm-delivery-check').checked = false;
    }
  }

  function renderReturnRequest(pedido) {
    document.getElementById('return-section')?.remove();
    const delivered = String(pedido.estado || '').toUpperCase().includes('ENTREGADO');
    if (!delivered || !pedido.detalles?.length) return;

    const section = document.createElement('section');
    section.id = 'return-section';
    section.className = 'mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm';
    section.innerHTML = `
      <h2 class="text-xl font-semibold mb-4">Solicitar devolución</h2>
      <form id="return-form" class="space-y-4">
        <div class="space-y-3">
          ${pedido.detalles.map((item) => `
            <label class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <span>
                <span class="block font-medium text-slate-900">${item.nombreProducto}</span>
                <span class="text-sm text-slate-500">Cantidad comprada: ${item.cantidad}</span>
              </span>
              <input type="number" name="item-${item.idDetalle}" min="0" max="${item.cantidad}" value="0" class="w-20 rounded-lg border border-slate-300 px-2 py-1" />
            </label>
          `).join('')}
        </div>
        <textarea id="return-reason" required class="min-h-24 w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="Comentario indicando por qué solicitas la devolución"></textarea>
        <p id="return-message" class="hidden rounded-xl px-3 py-2 text-sm font-semibold"></p>
        <button type="submit" class="rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Enviar solicitud</button>
      </form>
    `;
    contentContainer.appendChild(section);

    document.getElementById('return-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      await submitReturnRequest(pedido);
    });
  }

  async function submitReturnRequest(pedido) {
    const message = document.getElementById('return-message');
    const items = pedido.detalles
      .map((item) => ({
        idDetallePedido: item.idDetalle,
        cantidad: Number(document.querySelector(`[name="item-${item.idDetalle}"]`).value || 0),
      }))
      .filter((item) => item.cantidad > 0);

    if (!items.length) {
      message.textContent = 'Selecciona al menos un producto para devolver.';
      message.className = 'rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700';
      return;
    }

    try {
      const response = await fetch('/api/devoluciones', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idPedido: pedido.idPedido,
          motivo: document.getElementById('return-reason').value.trim(),
          items,
        }),
      });
      if (!response.ok) throw new Error('No se pudo solicitar la devolución');
      message.textContent = 'Solicitud de devolución enviada.';
      message.className = 'rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-green-700';
      document.getElementById('return-form').reset();
    } catch (error) {
      message.textContent = error.message;
      message.className = 'rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700';
    }
  }

  function showError(message) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.textContent = message;
  }

  fetchPedidoDetalle();
});
