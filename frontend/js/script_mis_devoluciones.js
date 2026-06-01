const content = document.querySelector('#page-content');

async function loadMyReturns() {
  const token = typeof getToken === 'function' ? getToken() : sessionStorage.getItem('token');
  if (!token) {
    window.location.href = 'iniciar_sesion.html?from=mis_devoluciones.html';
    return;
  }

  content.innerHTML = '<p>Cargando devoluciones...</p>';

  try {
    const response = await fetch('/api/devoluciones/mis-devoluciones', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('No se pudieron cargar tus devoluciones');

    const devoluciones = await response.json();
    renderReturns(devoluciones);
  } catch (error) {
    content.innerHTML = `<p class="rounded-xl bg-red-50 px-4 py-3 text-red-700">${error.message}</p>`;
  }
}

function renderReturns(devoluciones) {
  if (!devoluciones.length) {
    content.innerHTML = '<p class="rounded-xl bg-white p-5 text-slate-500 ring-1 ring-slate-200">Todavía no has solicitado devoluciones.</p>';
    return;
  }

  content.innerHTML = `
    <div class="space-y-4">
      ${devoluciones.map((devolucion) => `
        <article class="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-sm text-slate-500">Pedido #${devolucion.idPedido}</p>
              <h2 class="mt-1 text-lg font-semibold text-slate-900">Devolución #${devolucion.idDevolucion}</h2>
            </div>
            ${returnBadge(devolucion.estado)}
          </div>
          <p class="mt-4 text-sm text-slate-600"><strong>Tu comentario:</strong> ${devolucion.motivo || 'Sin comentario'}</p>
          <div class="mt-4 rounded-xl bg-slate-50 p-4">
            <p class="text-sm font-semibold text-slate-700">Respuesta del administrador</p>
            <p class="mt-1 text-sm text-slate-600">${devolucion.comentariosAdmin || 'Todavía no hay respuesta del administrador.'}</p>
          </div>
          <div class="mt-4 space-y-2">
            ${devolucion.items.map((item) => `
              <div class="flex justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <span>${item.productoNombre}${item.tallaNombre ? ` - Talla ${item.tallaNombre}` : ''}</span>
                <span>${item.cantidad} uds</span>
              </div>
            `).join('')}
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function returnBadge(estado) {
  const styles = {
    SOLICITADA: 'bg-yellow-100 text-yellow-800',
    ACEPTADA: 'bg-green-100 text-green-800',
    RECHAZADA: 'bg-red-100 text-red-800',
  };
  return `<span class="w-fit rounded-full px-3 py-1 text-sm font-medium ${styles[estado] || 'bg-slate-100 text-slate-700'}">${estado || 'SIN ESTADO'}</span>`;
}

loadMyReturns();
