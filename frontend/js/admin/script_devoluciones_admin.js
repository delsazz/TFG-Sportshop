window.addEventListener('admin-tab-loaded', (event) => {
  if (event.detail.tabId !== 'devoluciones') return;
  initAdminReturns();
});

let adminReturns = [];

async function initAdminReturns() {
  const container = document.getElementById('devoluciones-container');

  if (!container.dataset.initialized) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-gray-500">Solicitudes de devolución de los clientes.</p>
          <select id="returns-filter" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="TODAS">Todas las devoluciones</option>
            <option value="ACEPTADA">Aceptadas</option>
            <option value="RECHAZADA">Rechazadas</option>
          </select>
        </div>

        <div id="returns-error" class="hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table class="min-w-full text-left">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Pedido</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Cliente</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Motivo</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Estado</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Comentario admin</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="returns-table-body">
              <tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Cargando devoluciones...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.dataset.initialized = 'true';
    document.getElementById('returns-filter').addEventListener('change', renderAdminReturns);
  }

  await fetchAdminReturns();
}

async function fetchAdminReturns() {
  try {
    const response = await fetch('/api/admin/devoluciones', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) throw new Error('No se pudieron cargar las devoluciones');
    adminReturns = await response.json();
    document.getElementById('returns-error').classList.add('hidden');
    renderAdminReturns();
  } catch (error) {
    showReturnsError(error.message);
  }
}

function renderAdminReturns() {
  const tbody = document.getElementById('returns-table-body');
  const filter = document.getElementById('returns-filter').value;
  const returns = adminReturns.filter((item) => filter === 'TODAS' || item.estado === filter);

  if (!returns.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No hay devoluciones para este filtro.</td></tr>';
    return;
  }

  tbody.innerHTML = returns.map((item) => `
    <tr class="border-t border-gray-100 align-top">
      <td class="px-4 py-3 text-sm font-mono text-gray-900">#${item.idPedido}</td>
      <td class="px-4 py-3 text-sm text-gray-700">${item.nombreUsuario || `Usuario ${item.idUsuario}`}</td>
      <td class="px-4 py-3 text-sm text-gray-700">${item.motivo || 'Sin comentario del cliente'}</td>
      <td class="px-4 py-3">${returnBadge(item.estado)}</td>
      <td class="px-4 py-3">
        <textarea id="return-comment-${item.idDevolucion}" class="min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Observación para el cliente">${item.comentariosAdmin || ''}</textarea>
      </td>
      <td class="px-4 py-3 text-right">
        <div class="flex justify-end gap-2">
          <button onclick="resolveReturn(${item.idDevolucion}, 'ACEPTADA')" class="rounded-md bg-green-50 px-3 py-1.5 text-sm text-green-700 hover:bg-green-100">Aceptar</button>
          <button onclick="resolveReturn(${item.idDevolucion}, 'RECHAZADA')" class="rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100">Rechazar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.resolveReturn = async function(id, estado) {
  const comment = document.getElementById(`return-comment-${id}`).value.trim();

  try {
    const response = await fetch(`/api/admin/devoluciones/${id}/estado`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado, comentarios: comment }),
    });
    if (!response.ok) throw new Error('No se pudo actualizar la devolución');
    await fetchAdminReturns();
  } catch (error) {
    showReturnsError(error.message);
  }
};

function returnBadge(estado) {
  const styles = {
    SOLICITADA: 'bg-yellow-100 text-yellow-800',
    ACEPTADA: 'bg-green-100 text-green-800',
    RECHAZADA: 'bg-red-100 text-red-800',
  };
  return `<span class="rounded-full px-2.5 py-1 text-xs font-medium ${styles[estado] || 'bg-gray-100 text-gray-700'}">${estado || 'SIN ESTADO'}</span>`;
}

function showReturnsError(message) {
  const error = document.getElementById('returns-error');
  error.textContent = message;
  error.classList.remove('hidden');
}
