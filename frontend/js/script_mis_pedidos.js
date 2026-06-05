document.addEventListener('DOMContentLoaded', async () => {
  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const contentContainer = document.getElementById('content-container');
  const emptyState = document.getElementById('empty-state');
  const ordersList = document.getElementById('orders-list');

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

  function statusClass(estado) {
    const value = String(estado || '').toLowerCase();
    if (value.includes('entregado')) return 'status-delivered';
    if (value.includes('pagado')) return 'status-paid';
    if (value.includes('pendiente')) return 'status-pending';
    return 'status-default';
  }

  function canRequestReturn(pedido) {
    const estado = String(pedido.estado || '').toLowerCase();
    return estado.includes('entregado') && Array.isArray(pedido.detalles) && pedido.detalles.length > 0;
  }

  async function fetchMisPedidos() {
    try {
      const token = getToken();
      if (!token) {
        window.location.href = 'iniciar_sesion.html?from=mis_pedidos.html';
        return;
      }

      const res = await fetch('/api/pedidos/mis-pedidos', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('No se pudieron cargar tus pedidos');
      }

      const data = await res.json();
      renderPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      showError(err.message || 'Error de conexion');
    }
  }

  function renderPedidos(pedidos) {
    loadingContainer.classList.add('hidden');
    contentContainer.classList.remove('hidden');
    ordersList.innerHTML = '';

    if (!pedidos.length) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    ordersList.innerHTML = pedidos.map(renderPedido).join('');
    ordersList.querySelectorAll('[data-return-order]').forEach(button => {
      button.addEventListener('click', () => solicitarDevolucion(pedidos.find(p => String(p.idPedido) === button.dataset.returnOrder)));
    });
  }

  function renderPedido(pedido) {
    const lineas = Array.isArray(pedido.detalles) ? pedido.detalles : [];
    const totalUnidades = lineas.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
    return `
      <article class="order-card">
        <div class="order-summary">
          <div>
            <h2>Pedido #${escapeHtml(pedido.idPedido)}</h2>
            <p class="order-meta">${formatDate(pedido.fechaPedido || pedido.fecha)} · ${totalUnidades} unidades · ${money(pedido.total)}</p>
          </div>
          <span class="status-badge ${statusClass(pedido.estado)}">${escapeHtml(pedido.estado || 'Sin estado')}</span>
        </div>
        <div class="order-lines">
          ${lineas.length ? lineas.map(renderLinea).join('') : '<p class="line-detail">Este pedido no tiene lineas asociadas.</p>'}
        </div>
        <div class="order-footer">
          <a class="orders-link" href="detalle_pedido.html?id=${encodeURIComponent(pedido.idPedido)}">Ver detalle completo</a>
          <button type="button" class="return-button" data-return-order="${escapeHtml(pedido.idPedido)}" ${canRequestReturn(pedido) ? '' : 'disabled'}>
            Solicitar devolucion
          </button>
        </div>
      </article>
    `;
  }

  function renderLinea(item) {
    const subtotal = Number(item.precioUnitario || 0) * Number(item.cantidad || 0);
    return `
      <div class="order-line">
        <img src="${imageUrl(item.imagen)}" alt="${escapeHtml(item.nombreProducto || 'Producto')}" />
        <div>
          <p class="line-title">${escapeHtml(item.nombreProducto || 'Producto')}</p>
          <p class="line-detail">${item.talla ? `Talla ${escapeHtml(item.talla)} · ` : ''}${escapeHtml(item.cantidad || 0)} unidades · ${money(item.precioUnitario)} / ud.</p>
        </div>
        <strong class="line-price">${money(subtotal)}</strong>
      </div>
    `;
  }

  async function solicitarDevolucion(pedido) {
    if (!pedido || !canRequestReturn(pedido)) return;
    const motivo = window.prompt('Motivo de la devolucion');
    if (motivo === null) return;

    try {
      const response = await fetch('/api/devoluciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          idPedido: pedido.idPedido,
          motivo: motivo.trim() || 'Solicitud de devolucion',
          items: pedido.detalles.map(item => ({
            idDetallePedido: item.idDetalle,
            cantidad: item.cantidad,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || 'No se pudo solicitar la devolucion');
      }
      window.location.href = 'mis_devoluciones.html';
    } catch (error) {
      showError(error.message);
    }
  }

  function showError(msg) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.textContent = msg;
  }

  if (window.lucide) lucide.createIcons();
  fetchMisPedidos();
});
