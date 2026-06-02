document.addEventListener('DOMContentLoaded', async () => {
  const orderId = Number(new URLSearchParams(window.location.search).get('id'));
  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const contentContainer = document.getElementById('content-container');

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function imageUrl(path) {
    const value = String(path || '').trim();
    if (!value) return '/img/sportshop.jpg';
    if (/^(https?:|data:)/i.test(value)) return value;
    return value.startsWith('/') ? value : `/${value}`;
  }

  function formatDate(value) {
    if (!value) return 'Fecha no disponible';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES');
  }

  function money(value) {
    return `${Number(value || 0).toFixed(2)} EUR`;
  }

  function orderStatusClass(estado) {
    const value = String(estado || '').toLowerCase();
    if (value.includes('entregado')) return 'status-delivered';
    if (value.includes('pagado')) return 'status-paid';
    if (value.includes('pendiente')) return 'status-pending';
    return 'status-default';
  }

  function returnBadge(estado) {
    const normalized = String(estado || '').toUpperCase();
    const styles = {
      SOLICITADA: 'status-pending',
      ACEPTADA: 'status-accepted',
      RECHAZADA: 'status-rejected',
    };
    const labels = {
      SOLICITADA: 'Solicitada',
      ACEPTADA: 'Aceptada',
      RECHAZADA: 'Rechazada',
    };
    return `<span class="status-badge ${styles[normalized] || 'status-default'}">${labels[normalized] || escapeHtml(normalized)}</span>`;
  }

  function latestReturnsByItem(devoluciones) {
    const byItem = new Map();
    devoluciones.forEach(devolucion => {
      if (Number(devolucion.idPedido) !== orderId) return;
      (devolucion.items || []).forEach(item => {
        const current = byItem.get(String(item.idDetallePedido));
        if (!current || new Date(devolucion.fechaSolicitud || 0) >= new Date(current.fechaSolicitud || 0)) {
          byItem.set(String(item.idDetallePedido), devolucion);
        }
      });
    });
    return byItem;
  }

  function returnCell(item, pedido, devolucionesByItem) {
    const devolucion = devolucionesByItem.get(String(item.idDetalle));
    if (devolucion) return `<div class="return-cell">${returnBadge(devolucion.estado)}</div>`;

    return `
      <a class="orders-link" href="solicitar_devolucion.html?idPedido=${encodeURIComponent(pedido.idPedido)}&idDetalle=${encodeURIComponent(item.idDetalle)}">
        Solicitar devolucion
      </a>
    `;
  }

  function renderPedido(pedido, devoluciones) {
    const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];
    const devolucionesByItem = latestReturnsByItem(devoluciones);
    const status = pedido.estado || 'Sin estado';

    loadingContainer.classList.add('hidden');
    contentContainer.classList.remove('hidden');
    document.getElementById('order-title').textContent = `Pedido #${pedido.idPedido}`;
    document.getElementById('order-date').textContent = `Realizado el ${formatDate(pedido.fecha || pedido.fechaPedido)}`;
    document.getElementById('order-status').textContent = status;
    document.getElementById('order-status').className = `status-badge ${orderStatusClass(status)}`;
    document.getElementById('order-total').textContent = money(pedido.total);

    document.getElementById('order-items').innerHTML = detalles.length
      ? detalles.map(item => {
          const subtotal = Number(item.cantidad || 0) * Number(item.precioUnitario || 0);
          return `
            <tr>
              <td>
                <div class="order-product">
                  <img src="${imageUrl(item.imagen)}" alt="${escapeHtml(item.nombreProducto || 'Producto')}" />
                  <strong>${escapeHtml(item.nombreProducto || 'Producto')}</strong>
                </div>
              </td>
              <td>${escapeHtml(item.talla || '-')}</td>
              <td>${escapeHtml(item.cantidad || 0)}</td>
              <td class="table-price">${money(item.precioUnitario)}</td>
              <td class="table-price">${money(subtotal)}</td>
              <td><span class="status-badge ${orderStatusClass(status)}">${escapeHtml(status)}</span></td>
              <td>${returnCell(item, pedido, devolucionesByItem)}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="7">No hay productos en este pedido.</td></tr>';

    if (window.lucide) lucide.createIcons();
  }

  function showError(message) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.textContent = message;
  }

  if (!orderId) {
    showError('Pedido no valido.');
    return;
  }

  try {
    const token = typeof getToken === 'function' ? getToken() : sessionStorage.getItem('token');
    if (!token) {
      window.location.href = 'iniciar_sesion.html';
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const [pedidoResponse, devolucionesResponse] = await Promise.all([
      fetch(`/api/pedidos/${orderId}`, { headers }),
      fetch('/api/devoluciones/mis-devoluciones', { headers }),
    ]);
    if (!pedidoResponse.ok) throw new Error('Pedido no encontrado o no tienes permiso.');

    const pedido = await pedidoResponse.json();
    const devoluciones = devolucionesResponse.ok ? await devolucionesResponse.json() : [];
    renderPedido(pedido, Array.isArray(devoluciones) ? devoluciones : []);
  } catch (error) {
    showError(error.message || 'Error de conexion.');
  }
});
