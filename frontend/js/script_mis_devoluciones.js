const content = document.querySelector('#page-content');

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
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString('es-ES');
}

function money(value) {
  return `${Number(value || 0).toFixed(2)} EUR`;
}

async function loadMyReturns() {
  const token = typeof getToken === 'function' ? getToken() : sessionStorage.getItem('token');
  if (!token) {
    window.location.href = 'iniciar_sesion.html?from=mis_devoluciones.html';
    return;
  }

  content.innerHTML = '<div class="orders-state">Cargando devoluciones...</div>';

  try {
    const response = await fetch('/api/devoluciones/mis-devoluciones', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('No se pudieron cargar tus devoluciones');

    const devoluciones = await response.json();
    renderReturns(Array.isArray(devoluciones) ? devoluciones : []);
  } catch (error) {
    content.innerHTML = `<div class="orders-state orders-error">${escapeHtml(error.message)}</div>`;
  }
}

function renderReturns(devoluciones) {
  if (!devoluciones.length) {
    content.innerHTML = `
      <div class="orders-empty">
        <h2>Todavia no has solicitado devoluciones</h2>
        <p>Cuando solicites una devolucion desde tus pedidos, veras aqui su estado y la respuesta del administrador.</p>
        <a href="mis_pedidos.html" class="orders-link">Ir a mis pedidos</a>
      </div>
    `;
    return;
  }

  content.innerHTML = `<div class="orders-list">${devoluciones.map(renderReturn).join('')}</div>`;
}

function renderReturn(devolucion) {
  const items = Array.isArray(devolucion.items) ? devolucion.items : [];
  return `
    <article class="return-card">
      <div class="return-summary">
        <div>
          <h2>Devolucion #${escapeHtml(devolucion.idDevolucion)}</h2>
          <p class="return-meta">Pedido #${escapeHtml(devolucion.idPedido)} · Solicitada el ${formatDate(devolucion.fechaSolicitud)}</p>
        </div>
        ${returnBadge(devolucion.estado)}
      </div>

      <div class="return-lines">
        ${items.length ? items.map(renderItem).join('') : '<p class="line-detail">No hay productos asociados a esta devolucion.</p>'}
      </div>

      <div class="return-admin">
        <p class="line-detail"><strong>Motivo del usuario:</strong> ${escapeHtml(devolucion.motivo || 'Sin comentario')}</p>
        <p class="line-detail"><strong>Respuesta del administrador:</strong> ${escapeHtml(devolucion.comentariosAdmin || pendingText(devolucion.estado))}</p>
        ${devolucion.fechaResolucion ? `<p class="line-detail"><strong>Fecha de respuesta:</strong> ${formatDate(devolucion.fechaResolucion)}</p>` : ''}
      </div>
    </article>
  `;
}

function renderItem(item) {
  const subtotal = Number(item.precioUnitario || 0) * Number(item.cantidad || 0);
  return `
    <div class="return-line">
      <img src="${imageUrl(item.imagen)}" alt="${escapeHtml(item.productoNombre || 'Producto')}" />
      <div>
        <p class="line-title">${escapeHtml(item.productoNombre || 'Producto')}</p>
        <p class="line-detail">${item.tallaNombre ? `Talla ${escapeHtml(item.tallaNombre)} · ` : ''}${escapeHtml(item.cantidad || 0)} unidades · ${money(item.precioUnitario)} / ud.</p>
      </div>
      <strong class="line-price">${money(subtotal)}</strong>
    </div>
  `;
}

function pendingText(estado) {
  return String(estado || '').toUpperCase() === 'SOLICITADA'
    ? 'Pendiente de revisar por el administrador.'
    : 'Sin comentario del administrador.';
}

function returnBadge(estado) {
  const normalized = String(estado || 'SOLICITADA').toUpperCase();
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

if (window.lucide) lucide.createIcons();
loadMyReturns();
