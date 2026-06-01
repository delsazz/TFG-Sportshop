window.addEventListener('admin-tab-loaded', (e) => {
  if (e.detail.tabId !== 'pedidos') return;
  initAdminOrders();
});

let ordersData = [];
let draftStates = {};
let selectedPedidoDetail = null;
let selectedLineas = {};
let deliveryQuantities = {};

const statusOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'en_preparacion', label: 'En preparación' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado_parcial', label: 'Entregado parcial' },
  { value: 'entregado_completo', label: 'Entregado completo' },
  { value: 'cancelado', label: 'Cancelado' },
];

const pedidoTransitions = {
  PENDIENTE: ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'ENTREGADO_PARCIAL', 'ENTREGADO_COMPLETO', 'CANCELADO'],
  PAGADO: ['PAGADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO_PARCIAL', 'ENTREGADO_COMPLETO', 'CANCELADO'],
  EN_PREPARACION: ['EN_PREPARACION', 'ENVIADO', 'ENTREGADO_PARCIAL', 'ENTREGADO_COMPLETO', 'CANCELADO'],
  ENVIADO: ['ENVIADO', 'ENTREGADO_PARCIAL', 'ENTREGADO_COMPLETO'],
  ENTREGADO_PARCIAL: ['ENTREGADO_PARCIAL', 'ENTREGADO_COMPLETO'],
  ENTREGADO_COMPLETO: ['ENTREGADO_COMPLETO'],
  CANCELADO: ['CANCELADO'],
};

async function initAdminOrders() {
  const container = document.getElementById('pedidos-container');
  
  // Render base structure if not already rendered
  if (!container.dataset.initialized) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input type="text" id="filter-user" placeholder="Nombre o email cliente..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
          <input type="date" id="filter-date-from" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
          <input type="date" id="filter-date-to" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
        </div>
        
        <div id="orders-error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 hidden"></div>

        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Unidades pendientes por cliente</h3>
              <p class="text-sm text-gray-500">Resumen de productos entregados parcialmente o aún sin entregar.</p>
            </div>
            <span id="pendientes-total-badge" class="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">0 pendientes</span>
          </div>
          <div id="pendientes-cliente-container" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <p class="text-sm text-gray-500">Calculando pendientes...</p>
          </div>
        </section>

        <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table class="min-w-full text-left">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">ID</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Cliente</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Fecha</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Estado</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Unidades</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Total</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="orders-table-body" class="divide-y divide-gray-100">
              <tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">Cargando pedidos...</td></tr>
            </tbody>
          </table>
        </div>

        <div id="order-detail-modal" class="hidden rounded-xl border-2 border-blue-500 bg-white p-6 shadow-lg"></div>
      </div>
    `;
    container.dataset.initialized = "true";

    document.getElementById('filter-user').addEventListener('input', renderOrders);
    document.getElementById('filter-date-from').addEventListener('change', renderOrders);
    document.getElementById('filter-date-to').addEventListener('change', renderOrders);
  }

  await fetchOrders();
}

async function fetchOrders() {
  const apiBaseUrl = '/api';
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${apiBaseUrl}/pedidos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudieron cargar los pedidos');
    ordersData = await res.json();
    
    draftStates = {};
    ordersData.forEach(p => draftStates[p.idPedido] = p.estado);
    
    document.getElementById('orders-error').classList.add('hidden');
    renderOrders();
    renderPendientes();
  } catch (err) {
    showError(err.message);
  }
}

function renderOrders() {
  const tbody = document.getElementById('orders-table-body');
  
  const filterUser = document.getElementById('filter-user').value.toLowerCase().trim();
  const dateFrom = document.getElementById('filter-date-from').value;
  const dateTo = document.getElementById('filter-date-to').value;

  const filtered = ordersData.filter(p => {
    const userStr = p.usuario ? `${p.usuario.nombre} ${p.usuario.apellidos} ${p.usuario.email}`.toLowerCase() : '';
    const matchUser = !filterUser || userStr.includes(filterUser);
    const orderDate = new Date(p.fechaPedido);
    const matchFrom = !dateFrom || orderDate >= new Date(dateFrom);
    const matchTo = !dateTo || orderDate <= new Date(`${dateTo}T23:59:59`);
    return matchUser && matchFrom && matchTo;
  }).sort((a, b) => b.idPedido - a.idPedido);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">No hay pedidos registrados o coincidentes.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const dateStr = new Date(p.fechaPedido).toLocaleDateString('es-ES');
    const isLocked = p.estado === 'ENTREGADO_COMPLETO' || p.estado === 'CANCELADO';
    const allowedTransitions = pedidoTransitions[p.estado] || [p.estado];
    
    let optionsHtml = (pedidoTransitions[p.estado] ? statusOptions.filter(o => allowedTransitions.includes(o.value.toUpperCase())) : statusOptions)
      .map(o => `<option value="${o.value}" ${draftStates[p.idPedido] === o.value.toUpperCase() || p.estado === o.value.toUpperCase() ? 'selected' : ''}>${o.label}</option>`)
      .join('');

    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-sm font-mono text-gray-900">#${p.idPedido}</td>
        <td class="px-4 py-3">
          <div class="text-sm font-medium text-gray-900">${p.usuario ? `${p.usuario.nombre} ${p.usuario.apellidos}` : 'N/A'}</div>
          <div class="text-xs text-gray-500">${p.usuario?.email || ''}</div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700">${dateStr}</td>
        <td class="px-4 py-3">
          <select id="state-select-${p.idPedido}" onchange="updateDraftState(${p.idPedido}, this.value)" class="rounded border-gray-300 text-xs p-1" ${isLocked ? 'disabled' : ''}>
            ${optionsHtml}
          </select>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700">
          <div>${p.unidadesEntregadas || 0}/${p.totalUnidades || 0} entregadas</div>
          <div class="text-xs text-orange-600">${p.unidadesPendientes || 0} pendientes</div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700">${Number(p.total).toFixed(2)} EUR</td>
        <td class="px-4 py-3 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="viewOrderDetail(${p.idPedido})" class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Ver detalle</button>
            <button onclick="saveOrderStatus(${p.idPedido})" id="btn-save-${p.idPedido}" class="bg-gray-100 px-2 py-1 rounded text-xs hover:bg-gray-200 cursor-pointer">ACTUALIZAR</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPendientes() {
  const container = document.getElementById('pendientes-cliente-container');
  const badge = document.getElementById('pendientes-total-badge');

  const resumen = ordersData.reduce((acc, p) => {
    const pnds = Number(p.unidadesPendientes || 0);
    if (pnds <= 0) return acc;

    const key = p.usuario?.idUsuario ? String(p.usuario.idUsuario) : `pedido-${p.idPedido}`;
    const cliente = p.usuario ? `${p.usuario.nombre} ${p.usuario.apellidos}`.trim() : 'Sin usuario';

    if (!acc[key]) {
      acc[key] = { cliente, email: p.usuario?.email || 'Sin email', pedidos: 0, unidadesPendientes: 0 };
    }
    acc[key].pedidos += 1;
    acc[key].unidadesPendientes += pnds;
    return acc;
  }, {});

  const arr = Object.values(resumen).sort((a, b) => b.unidadesPendientes - a.unidadesPendientes);
  
  const totalPnds = arr.reduce((sum, item) => sum + item.unidadesPendientes, 0);
  badge.textContent = `${totalPnds} pendientes`;

  if (arr.length === 0) {
    container.innerHTML = '<p class="text-sm text-gray-500 col-span-full">No hay unidades pendientes de entrega.</p>';
    return;
  }

  container.innerHTML = arr.map(item => `
    <div class="rounded-lg border border-gray-200 px-4 py-3">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-medium text-gray-900">${item.cliente}</p>
          <p class="text-sm text-gray-500">${item.email}</p>
        </div>
        <span class="rounded-full bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-800">${item.unidadesPendientes}</span>
      </div>
      <p class="mt-2 text-sm text-gray-500">${item.pedidos} ${item.pedidos === 1 ? 'pedido con pendiente' : 'pedidos con pendientes'}</p>
    </div>
  `).join('');
}

window.updateDraftState = function(id, val) {
  draftStates[id] = val.toUpperCase();
}

window.saveOrderStatus = async function(id) {
  const pedido = ordersData.find(p => p.idPedido === id);
  if (!pedido) return;
  const nuevoEstado = draftStates[id] || pedido.estado;
  if (nuevoEstado === pedido.estado) return;

  const btn = document.getElementById(`btn-save-${id}`);
  btn.textContent = '...';
  btn.disabled = true;

  try {
    const token = getToken();
    const res = await fetch(`/api/pedidos/${id}/estado?nuevoEstado=${nuevoEstado}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudo actualizar el estado');
    const actualizado = await res.json();
    
    // update local state
    const idx = ordersData.findIndex(p => p.idPedido === id);
    if(idx !== -1) ordersData[idx] = actualizado;
    
    if (selectedPedidoDetail && selectedPedidoDetail.idPedido === id) {
      selectedPedidoDetail.estado = actualizado.estado;
      renderOrderDetail();
    }
    draftStates[id] = actualizado.estado;
    renderOrders();
    renderPendientes();
  } catch (e) {
    showError(e.message);
  } finally {
    btn.textContent = 'ACTUALIZAR';
    btn.disabled = false;
  }
}

window.viewOrderDetail = async function(id) {
  try {
    const token = getToken();
    const res = await fetch(`/api/pedidos/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al obtener detalle');
    selectedPedidoDetail = await res.json();
    selectedLineas = {};
    deliveryQuantities = {};
    
    selectedPedidoDetail.detalles.forEach(d => {
      deliveryQuantities[d.idDetalle] = d.cantidadPendiente > 0 ? d.cantidadPendiente : 0;
    });

    renderOrderDetail();
    
    const detailEl = document.getElementById('order-detail-modal');
    detailEl.classList.remove('hidden');
    detailEl.scrollIntoView({ behavior: 'smooth' });
  } catch(e) {
    showError(e.message);
  }
}

function getStatusLabel(estado) {
  if (estado === 'ENTREGADO') return 'Entregado completo';
  const opt = statusOptions.find(o => o.value.toUpperCase() === estado);
  return opt ? opt.label : estado;
}

window.closeOrderDetail = function() {
  selectedPedidoDetail = null;
  document.getElementById('order-detail-modal').classList.add('hidden');
}

window.handleQuickStatus = async function(estadoStr) {
  if (!selectedPedidoDetail) return;
  const id = selectedPedidoDetail.idPedido;
  
  try {
    const token = getToken();
    const res = await fetch(`/api/pedidos/${id}/estado?nuevoEstado=${estadoStr.toUpperCase()}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudo actualizar el estado');
    
    await fetchOrders(); // refresh all
    await viewOrderDetail(id); // refresh detail
  } catch (e) {
    showError(e.message);
  }
}

window.toggleLinea = function(idDetalle, checked) {
  selectedLineas[idDetalle] = checked;
  renderOrderDetail(); // re-render to update inputs
}

window.changeDeliveryQuantity = function(idDetalle, val) {
  deliveryQuantities[idDetalle] = Number(val);
}

window.registrarEntrega = async function() {
  if (!selectedPedidoDetail) return;
  
  const lineasEntrega = selectedPedidoDetail.detalles
    .filter(d => selectedLineas[d.idDetalle])
    .map(d => ({
      idDetalle: d.idDetalle,
      cantidad: Number(deliveryQuantities[d.idDetalle] || 0)
    }))
    .filter(l => l.cantidad > 0);

  if (lineasEntrega.length === 0) {
    showError('Selecciona al menos una linea con cantidad válida');
    return;
  }

  try {
    const token = getToken();
    const res = await fetch(`/api/pedidos/${selectedPedidoDetail.idPedido}/entregas`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lineasEntrega)
    });
    if (!res.ok) throw new Error('No se pudo registrar la entrega');
    
    await fetchOrders();
    await viewOrderDetail(selectedPedidoDetail.idPedido);
  } catch(e) {
    showError(e.message);
  }
}

function renderOrderDetail() {
  const container = document.getElementById('order-detail-modal');
  if (!selectedPedidoDetail) return;

  const p = selectedPedidoDetail;
  const permitidos = pedidoTransitions[p.estado] || [p.estado];

  const quickStatusHtml = statusOptions.map(o => {
    const isCurrent = p.estado === o.value.toUpperCase();
    const isAllowed = permitidos.includes(o.value.toUpperCase());
    const disabled = isCurrent || !isAllowed;
    const classes = isCurrent 
      ? 'bg-blue-600 text-white' 
      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100';
    return `
      <button type="button" onclick="handleQuickStatus('${o.value}')" ${disabled ? 'disabled' : ''} class="rounded-md px-3 py-1.5 text-sm font-medium ${classes} disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed">
        ${o.label}
      </button>
    `;
  }).join('');

  const productosHtml = p.detalles.map(d => {
    return `
      <div class="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl hover:border-blue-300 transition-colors">
        <div class="mb-4 md:mb-0">
          <p class="font-bold text-gray-900">${d.productoNombre}</p>
          <p class="text-xs text-gray-500">Talla: ${d.tallaNombre} | Pedido: ${d.cantidad}</p>
          <div class="mt-2 flex gap-4">
            <span class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ENTREGADO: ${d.cantidadEntregada}</span>
            <span class="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">FALTA: ${d.cantidadPendiente}</span>
          </div>
        </div>
        <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
          <input type="checkbox" onchange="toggleLinea(${d.idDetalle}, this.checked)" ${selectedLineas[d.idDetalle] ? 'checked' : ''} ${d.cantidadPendiente === 0 ? 'disabled' : ''} class="w-5 h-5 text-blue-600 rounded cursor-pointer" />
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-gray-400">CANT. A ENTREGAR</span>
            <input type="number" min="1" max="${d.cantidadPendiente}" value="${deliveryQuantities[d.idDetalle] || 0}" onchange="changeDeliveryQuantity(${d.idDetalle}, this.value)" ${!selectedLineas[d.idDetalle] ? 'disabled' : ''} class="w-20 p-1 border rounded font-bold text-sm bg-white" />
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900">Detalle Pedido #${p.idPedido}</h3>
      <button onclick="closeOrderDetail()" class="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl font-bold">&times;</button>
    </div>
    <div class="space-y-4">
      <div class="grid gap-4 md:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pedido</p>
          <p class="mt-1 text-sm font-semibold text-gray-900">#${p.idPedido}</p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Fecha</p>
          <p class="mt-1 text-sm font-semibold text-gray-900">${new Date(p.fechaPedido).toLocaleDateString()}</p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Estado</p>
          <p class="mt-1 text-sm font-semibold text-gray-900">${getStatusLabel(p.estado)}</p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</p>
          <p class="mt-1 text-sm font-semibold text-gray-900">${Number(p.total).toFixed(2)} EUR</p>
        </div>
      </div>

      <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
        <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Cambiar estado rápido</h4>
        <div class="flex flex-wrap gap-2">
          ${quickStatusHtml}
        </div>
      </div>

      <h4 class="font-bold text-gray-900 mb-4 border-b pb-2 uppercase text-xs tracking-widest">Productos y Entregas</h4>
      <div class="space-y-3">
        ${productosHtml}
      </div>

      <div class="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
        <p class="text-xs text-gray-500">Selecciona los productos y pulsa el botón para registrar la entrega parcial o total.</p>
        <button onclick="registrarEntrega()" class="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors cursor-pointer">
          REGISTRAR ENTREGA
        </button>
      </div>
    </div>
  `;
}

function showError(msg) {
  const el = document.getElementById('orders-error');
  if(el) {
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  } else {
    alert(msg);
  }
}
