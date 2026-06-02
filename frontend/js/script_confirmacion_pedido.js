document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();

  const notFoundContainer = document.getElementById('not-found-container');
  const confirmationContainer = document.getElementById('confirmation-container');
  const orderSubtitle = document.getElementById('order-subtitle');
  const orderNumber = document.getElementById('order-number');
  const orderStatus = document.getElementById('order-status');
  const orderDate = document.getElementById('order-date');
  const orderTotal = document.getElementById('order-total');
  const paymentMethodName = document.getElementById('payment-method-name');
  const paymentMethodStatus = document.getElementById('payment-method-status');
  const orderItems = document.getElementById('order-items');
  const orderItemsCount = document.getElementById('order-items-count');

  const order = getStoredOrder();
  const urlOrderId = new URLSearchParams(window.location.search).get('idPedido');
  const idPedido = order?.idPedido || urlOrderId;

  if (!idPedido) {
    showNotFound();
    return;
  }

  const initialOrder = {
    idPedido,
    paymentMethod: 'tarjeta',
    paymentStatus: 'confirmado',
    ...order,
  };

  renderOrder(initialOrder);
  await refreshOrderFromApi(idPedido, initialOrder);

  function getStoredOrder() {
    try {
      return JSON.parse(sessionStorage.getItem('lastOrder') || 'null');
    } catch {
      return null;
    }
  }

  function renderOrder(pedido) {
    const latestPayment = getLatestPayment(pedido);
    const method = latestPayment?.metodoPago || pedido.paymentMethod || pedido.metodoPago || 'tarjeta';
    const paymentStatus = latestPayment?.estado || pedido.paymentStatus || 'confirmado';
    const status = pedido.estado || paymentStatus || 'pendiente';
    const items = getOrderItems(pedido);
    const total = getOrderTotal(pedido, items, latestPayment);

    notFoundContainer.classList.add('hidden');
    confirmationContainer.classList.remove('hidden');

    orderSubtitle.textContent = `Hemos recibido el pedido #${pedido.idPedido}. Te avisaremos cuando avance su preparación.`;
    orderNumber.textContent = `#${pedido.idPedido}`;
    orderStatus.textContent = formatText(status);
    orderDate.textContent = formatDate(pedido.fecha || pedido.fechaPedido || latestPayment?.fechaPago);
    orderTotal.textContent = formatCurrency(total);
    paymentMethodName.textContent = formatPaymentMethod(method);
    paymentMethodStatus.textContent = `Estado del pago: ${formatText(paymentStatus)}`;

    renderItems(items);
    lucide.createIcons();
  }

  async function refreshOrderFromApi(idPedido, fallbackOrder) {
    const token = typeof getToken === 'function' ? getToken() : null;
    if (!token) return;

    try {
      const response = await fetch(`/api/pedidos/${idPedido}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;
      const apiOrder = await response.json();
      const mergedOrder = {
        ...fallbackOrder,
        ...apiOrder,
        paymentMethod: fallbackOrder.paymentMethod || apiOrder.metodoPago,
        paymentStatus: fallbackOrder.paymentStatus,
      };
      sessionStorage.setItem('lastOrder', JSON.stringify(mergedOrder));
      renderOrder(mergedOrder);
    } catch {
      // The stored order is enough to show the confirmation after checkout.
    }
  }

  function getLatestPayment(pedido) {
    if (!Array.isArray(pedido?.pagos) || !pedido.pagos.length) return null;
    return [...pedido.pagos].sort((a, b) => {
      const dateA = new Date(a.fechaPago || a.fechaConfirmacion || 0).getTime();
      const dateB = new Date(b.fechaPago || b.fechaConfirmacion || 0).getTime();
      return dateB - dateA;
    })[0];
  }

  function getOrderItems(pedido) {
    return pedido?.detalles || pedido?.lineas || pedido?.items || [];
  }

  function getOrderTotal(pedido, items, payment) {
    if (pedido?.total != null) return Number(pedido.total);
    if (payment?.monto != null) return Number(payment.monto);
    return items.reduce((acc, item) => {
      const unitPrice = Number(item.precioUnitario || item.precio || 0);
      const quantity = Number(item.cantidad || 1);
      return acc + unitPrice * quantity;
    }, 0);
  }

  function renderItems(items) {
    const count = items.reduce((acc, item) => acc + Number(item.cantidad || 1), 0);
    orderItemsCount.textContent = `${count} ${count === 1 ? 'producto' : 'productos'}`;

    if (!items.length) {
      orderItems.innerHTML = '<p class="confirmation-no-items">No hay productos guardados para este pedido.</p>';
      return;
    }

    orderItems.innerHTML = items.map((item) => {
      const name = item.nombreProducto || item.nombre || 'Producto';
      const size = item.talla || '-';
      const quantity = Number(item.cantidad || 1);
      const unitPrice = Number(item.precioUnitario || item.precio || 0);
      const subtotal = unitPrice * quantity;

      return `
        <article class="confirmation-item">
          <div>
            <h3>${escapeHtml(name)}</h3>
            <p>Talla ${escapeHtml(size)}</p>
          </div>
          <div class="confirmation-item-values">
            <span>${quantity} x ${formatCurrency(unitPrice)}</span>
            <strong>${formatCurrency(subtotal)}</strong>
          </div>
        </article>
      `;
    }).join('');
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(value || 0));
  }

  function formatDate(value) {
    if (!value) return 'Hoy';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Hoy';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatPaymentMethod(value) {
    const method = String(value || 'tarjeta').toLowerCase();
    if (method.includes('tarjeta')) return 'Tarjeta de credito';
    if (method.includes('transferencia')) return 'Transferencia bancaria';
    if (method.includes('bizum')) return 'Bizum';
    return formatText(method);
  }

  function formatText(value) {
    return String(value || '-')
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/^\w/, (letter) => letter.toUpperCase());
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char]));
  }

  function showNotFound() {
    confirmationContainer.classList.add('hidden');
    notFoundContainer.classList.remove('hidden');
    lucide.createIcons();
  }
});
