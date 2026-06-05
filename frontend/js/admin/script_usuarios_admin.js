window.addEventListener('admin-tab-loaded', (e) => {
  if (e.detail.tabId !== 'clientes') return;
  initAdminStudents();
});

let studentsData = [];
let filteredStudents = [];
let currentPage = 1;
const PAGE_SIZE = 10;
let expandedStudentId = null;
let pedidosMap = {};
let loadingPedidosMap = {};
let modalMode = null; // 'edit', 'view', null
let editingStudent = null;

async function initAdminStudents() {
  const container = document.getElementById('clientes-container');
  if (!container.dataset.initialized) {
    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <p class="mt-1 text-sm text-gray-600">Gestión de clientes con sus pedidos y datos personales.</p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input type="text" id="student-filter" placeholder="Buscar por nombre, email o teléfono..." class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:flex-1" />
          <span id="student-count" class="text-sm text-gray-500">0 clientes</span>
        </div>

        <div id="student-error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 hidden"></div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table class="min-w-full text-left">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Nombre</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Email</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Teléfono</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Comunidad Autónoma</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Provincia</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Ciudad</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Dirección</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Roles</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Pedidos</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody id="students-tbody">
              <tr><td colspan="10" class="px-4 py-8 text-center text-gray-500">Cargando clientes...</td></tr>
            </tbody>
          </table>
        </div>

        <div id="student-pagination" class="flex items-center justify-between hidden">
          <p id="student-page-info" class="text-sm text-gray-500"></p>
          <div class="flex gap-2" id="student-page-controls"></div>
        </div>

        <div id="student-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden">
          <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" id="student-modal-content">
          </div>
        </div>
      </div>
    `;
    container.dataset.initialized = "true";
    document.getElementById('student-filter').addEventListener('input', (e) => {
      currentPage = 1;
      renderStudents();
    });
  }

  await fetchStudents();
}

async function fetchStudents() {
  try {
    const token = getToken();
    const res = await fetch('/api/usuarios', { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error('No se pudieron cargar los usuarios');
    studentsData = await res.json();
    document.getElementById('student-error').classList.add('hidden');
    renderStudents();
  } catch (err) {
    showStudentError(err.message);
  }
}

function renderStudents() {
  const filterVal = document.getElementById('student-filter').value.toLowerCase();
  filteredStudents = studentsData.filter(u => {
    const term = `${u.nombre} ${u.apellidos} ${u.email} ${u.telefono || ''}`.toLowerCase();
    return term.includes(filterVal);
  });

  document.getElementById('student-count').textContent = `${filteredStudents.length} cliente${filteredStudents.length !== 1 ? 's' : ''}`;

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const paginated = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  
  const tbody = document.getElementById('students-tbody');

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="px-4 py-8 text-center text-gray-500">No se encontraron clientes.</td></tr>`;
  } else {
    tbody.innerHTML = paginated.map(u => {
      const rolesStr = u.roles.length ? u.roles.map(r => r.nombreRol).join(', ') : 'Sin rol';
      const expandedRows = expandedStudentId === u.idUsuario ? renderExpandedStudentOrders(u.idUsuario) : '';

      const direccionParts = [u.direccionCalle, u.direccionNumero, u.direccionPiso].filter(v => v && v.trim()).join(', ');

      return `
        <tr class="border-t border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3">
            <div class="font-medium text-gray-900">${u.nombre} ${u.apellidos}</div>
          </td>
          <td class="px-4 py-3 text-sm text-gray-700">${u.email}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${u.telefono || '—'}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${u.comunidadAutonoma || '—'}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${u.provincia || '—'}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${u.ciudad || '—'}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${direccionParts || '—'}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${rolesStr}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${u.totalPedidos || 0}</td>
          <td class="px-4 py-3 flex gap-2">
            <button onclick="toggleStudentOrders(${u.idUsuario})" class="rounded-md bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer">
              ${expandedStudentId === u.idUsuario ? 'Ocultar' : 'Ver'} pedidos
            </button>
            <button onclick="openStudentModal('view', ${u.idUsuario})" class="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">Detalles</button>
            <button onclick="deleteStudent(${u.idUsuario})" class="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors cursor-pointer">Eliminar</button>
          </td>
        </tr>
        ${expandedRows}
      `;
    }).join('');
  }

  renderStudentPagination(totalPages);
}

function renderExpandedStudentOrders(idUsuario) {
  if (loadingPedidosMap[idUsuario]) {
    return `<tr class="bg-indigo-50/40"><td colspan="10" class="px-6 py-4"><p class="text-sm text-gray-500">Cargando pedidos...</p></td></tr>`;
  }
  const pedidos = pedidosMap[idUsuario] || [];
  if (pedidos.length === 0) {
    return `<tr class="bg-indigo-50/40"><td colspan="10" class="px-6 py-4"><p class="text-sm text-gray-500">Este cliente no tiene pedidos.</p></td></tr>`;
  }

  const orderBlocks = pedidos.map(p => {
    const detalles = p.detalles || [];
    const tieneMultiplesProductos = detalles.length > 1;

    // Calculate total from line items as fallback when p.total is 0 or missing
    const totalCalculado = detalles.reduce((sum, d) => sum + (Number(d.cantidad) * Number(d.precioUnitario)), 0);
    const totalFinal = (Number(p.total) > 0 ? Number(p.total) : totalCalculado).toFixed(2);

    let productRows = '';
    if (detalles.length > 0) {
      productRows = detalles.map((d, idx) => {
        const imgSrc = d.imagen ? (d.imagen.startsWith('/') ? d.imagen : `/${d.imagen}`) : '/img/sportshop.jpg';
        const subtotal = (Number(d.cantidad) * Number(d.precioUnitario)).toFixed(2);
        const isFirst = idx === 0;
        const rowspan = tieneMultiplesProductos ? `rowspan="${detalles.length}"` : '';
        return `
          <tr class="border-t border-gray-100">
            ${isFirst ? `<td class="px-3 py-3 font-mono text-gray-700 align-middle text-center" ${rowspan}>#${p.idPedido}</td>` : ''}
            <td class="px-3 py-3 align-middle text-center">
              <img src="${imgSrc}" alt="${d.productoNombre || 'Producto'}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;display:inline-block;">
            </td>
            <td class="px-3 py-3 text-sm text-gray-800 align-middle">${d.productoNombre || 'Producto'}</td>
            <td class="px-3 py-3 text-sm text-gray-600 align-middle text-center">${d.tallaNombre || '—'}</td>
            <td class="px-3 py-3 text-sm text-gray-600 align-middle text-center">${d.cantidad}</td>
            <td class="px-3 py-3 text-sm text-gray-700 align-middle text-right font-medium">${subtotal} €</td>
            ${isFirst ? `<td class="px-3 py-3 align-middle text-center" ${rowspan}>${badgeEstado(p.estado)}</td>` : ''}
          </tr>
        `;
      }).join('');
    } else {
      productRows = `
        <tr class="border-t border-gray-100">
          <td class="px-3 py-3 font-mono text-gray-700 align-middle text-center">#${p.idPedido}</td>
          <td colspan="5" class="px-3 py-3 text-sm text-gray-500 text-center">Sin productos</td>
          <td class="px-3 py-3 align-middle text-center">${badgeEstado(p.estado)}</td>
        </tr>
      `;
    }

    // Total row aligned under Precio column
    const totalRow = `
      <tr class="border-t border-gray-200" style="background:rgba(249,250,251,0.6);">
        <td colspan="5" class="px-3 py-2 text-right">
          <span class="text-xs text-gray-400">Fecha: ${new Date(p.fechaPedido).toLocaleDateString('es-ES')}</span>
        </td>
        <td class="px-3 py-2 text-right">
          <div style="background:linear-gradient(135deg,#1e293b,#334155);color:#fff;padding:5px 12px;border-radius:8px;font-size:13px;font-weight:600;display:inline-block;box-shadow:0 1px 3px rgba(0,0,0,0.12);white-space:nowrap;">
            Total: ${totalFinal} €
          </div>
        </td>
        <td class="px-3 py-2"></td>
      </tr>
    `;

    return productRows + totalRow;
  }).join('');

  return `
    <tr class="bg-indigo-50/40">
      <td colspan="10" class="px-4 py-4">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;text-align:left;">
            <thead>
              <tr style="border-bottom:2px solid #e0e7ff;">
                <th class="px-3 pb-3 text-xs font-semibold uppercase text-gray-500 text-center" style="width:80px;">ID Pedido</th>
                <th class="px-3 pb-3 text-xs font-semibold uppercase text-gray-500 text-center" style="width:64px;">Imagen</th>
                <th class="px-3 pb-3 text-xs font-semibold uppercase text-gray-500">Producto</th>
                <th class="px-3 pb-3 text-xs font-semibold uppercase text-gray-500 text-center" style="width:70px;">Talla</th>
                <th class="px-3 pb-3 text-xs font-semibold uppercase text-gray-500 text-center" style="width:80px;">Unidades</th>
                <th class="px-3 pb-3 text-xs font-semibold uppercase text-gray-500 text-right" style="width:90px;">Precio</th>
                <th class="px-3 pb-3 text-xs font-semibold uppercase text-gray-500 text-center" style="width:120px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${orderBlocks}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  `;
}

function badgeEstado(estado) {
  const config = {
    'PENDIENTE':          { bg: '#fef3c7', color: '#92400e', border: '#fbbf24' },
    'PAGADO':             { bg: '#dbeafe', color: '#1e40af', border: '#60a5fa' },
    'EN_PREPARACION':     { bg: '#e0e7ff', color: '#3730a3', border: '#818cf8' },
    'ENVIADO':            { bg: '#ede9fe', color: '#5b21b6', border: '#a78bfa' },
    'ENTREGADO_PARCIAL':  { bg: '#ccfbf1', color: '#115e59', border: '#2dd4bf' },
    'ENTREGADO_COMPLETO': { bg: '#d1fae5', color: '#065f46', border: '#34d399' },
    'COMPLETADO':         { bg: '#d1fae5', color: '#065f46', border: '#34d399' },
    'CANCELADO':          { bg: '#fee2e2', color: '#991b1b', border: '#f87171' },
  };
  const s = config[estado] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
  const label = (estado || '').replace(/_/g, ' ');
  return `<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:${s.bg};color:${s.color};border:1px solid ${s.border};white-space:nowrap;">${label}</span>`;
}

window.toggleStudentOrders = async function(idUsuario) {
  if (expandedStudentId === idUsuario) {
    expandedStudentId = null;
    renderStudents();
    return;
  }
  
  expandedStudentId = idUsuario;
  if (!pedidosMap[idUsuario]) {
    loadingPedidosMap[idUsuario] = true;
    renderStudents();
    try {
      const token = getToken();
      const res = await fetch(`/api/pedidos/usuario/${idUsuario}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        pedidosMap[idUsuario] = await res.json();
      } else {
        pedidosMap[idUsuario] = [];
      }
    } catch {
      pedidosMap[idUsuario] = [];
    } finally {
      loadingPedidosMap[idUsuario] = false;
      renderStudents();
    }
  } else {
    renderStudents();
  }
}

function renderStudentPagination(totalPages) {
  const container = document.getElementById('student-pagination');
  const info = document.getElementById('student-page-info');
  const controls = document.getElementById('student-page-controls');

  if (totalPages <= 1) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  info.textContent = `Página ${currentPage} de ${totalPages}`;

  let html = `<button onclick="goToStudentPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer">← Anterior</button>`;

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      if (p === currentPage) {
        html += `<button class="rounded-md px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white">${p}</button>`;
      } else {
        html += `<button onclick="goToStudentPage(${p})" class="rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 text-sm font-medium cursor-pointer">${p}</button>`;
      }
    } else if (p === 2 && currentPage > 3) {
      html += `<span class="px-2 py-1.5 text-sm text-gray-400">…</span>`;
    } else if (p === totalPages - 1 && currentPage < totalPages - 2) {
      html += `<span class="px-2 py-1.5 text-sm text-gray-400">…</span>`;
    }
  }

  html += `<button onclick="goToStudentPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer">Siguiente →</button>`;
  controls.innerHTML = html;
}

window.goToStudentPage = function(p) {
  currentPage = p;
  renderStudents();
}

window.deleteStudent = async function(idUsuario) {
  const student = studentsData.find(u => u.idUsuario === idUsuario);
  if (!student) return;
  if (!confirm(`¿Eliminar cliente ${student.nombre} ${student.apellidos}?`)) return;

  try {
    const token = getToken();
    const res = await fetch(`/api/admin/usuarios/${idUsuario}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error('No se pudo eliminar el cliente');
    
    studentsData = studentsData.filter(u => u.idUsuario !== idUsuario);
    renderStudents();
  } catch(e) {
    showStudentError(e.message);
  }
}

window.openStudentModal = function(mode, idUsuario = null) {
  modalMode = mode;
  if (idUsuario) {
    editingStudent = studentsData.find(u => u.idUsuario === idUsuario);
  } else {
    editingStudent = null;
  }
  
  renderStudentModal();
  document.getElementById('student-modal').classList.remove('hidden');
}

window.closeStudentModal = function() {
  modalMode = null;
  editingStudent = null;
  document.getElementById('student-modal').classList.add('hidden');
}

function renderStudentModal() {
  const content = document.getElementById('student-modal-content');
  if (!modalMode) return;

  const isView = modalMode === 'view';
  const isEdit = modalMode === 'edit';
  
  let title = 'Detalles del Cliente';
  if (isEdit) title = 'Editar Cliente';

  let html = `
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-bold text-gray-900">${title}</h3>
      <button onclick="closeStudentModal()" class="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer">&times;</button>
    </div>
  `;

  if (isView && editingStudent) {
    const s = editingStudent;
    html += `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500 mb-1">Nombre</p>
            <p class="text-lg font-semibold text-gray-900">${s.nombre}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500 mb-1">Apellidos</p>
            <p class="text-lg font-semibold text-gray-900">${s.apellidos}</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500 mb-1">Email</p>
          <p class="text-lg font-semibold text-gray-900">${s.email}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500 mb-1">Teléfono</p>
            <p class="text-lg font-semibold text-gray-900">${s.telefono || '—'}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500 mb-1">Total Pedidos</p>
            <p class="text-lg font-semibold text-gray-900">${s.totalPedidos || 0}</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500 mb-1">Dirección</p>
          <p class="text-lg font-semibold text-gray-900">${s.direccion || '—'}</p>
        </div>
        <div class="flex gap-3 pt-6 border-t border-gray-200">
          <button onclick="closeStudentModal()" class="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 cursor-pointer">Cerrar</button>
        </div>
      </div>
    `;
  } else if (isEdit) {
    const s = editingStudent || { nombre: '', apellidos: '', email: '', telefono: '', direccion: '' };
    html += `
      <form onsubmit="submitStudentForm(event)" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
            <input type="text" id="stu-nombre" required value="${s.nombre}" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Apellidos *</label>
            <input type="text" id="stu-apellidos" required value="${s.apellidos}" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
          <input type="email" id="stu-email" required value="${s.email}" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
          <input type="tel" id="stu-telefono" value="${s.telefono || ''}" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
          <input type="text" id="stu-direccion" value="${s.direccion || ''}" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1" />
        </div>
        <div class="flex gap-3 pt-6 border-t border-gray-200">
          <button type="button" onclick="closeStudentModal()" class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancelar</button>
          <button type="submit" id="btn-submit-student" class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer">
            Guardar Cambios
          </button>
        </div>
      </form>
    `;
  }
  content.innerHTML = html;
}

window.submitStudentForm = async function(e) {
  e.preventDefault();
  
  const nombre = document.getElementById('stu-nombre').value;
  const apellidos = document.getElementById('stu-apellidos').value;
  const email = document.getElementById('stu-email').value;
  const telefono = document.getElementById('stu-telefono').value;
  const direccion = document.getElementById('stu-direccion').value;

  const btn = document.getElementById('btn-submit-student');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    const token = getToken();
    const payload = { nombre, apellidos, email, telefono, direccion };
    
    const res = await fetch(`/api/usuarios/${editingStudent.idUsuario}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al actualizar usuario');
    const updated = await res.json();
    const idx = studentsData.findIndex(u => u.idUsuario === updated.idUsuario);
    if (idx !== -1) studentsData[idx] = updated;

    closeStudentModal();
    renderStudents();
  } catch(err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
  }
}

function showStudentError(msg) {
  const el = document.getElementById('student-error');
  if(el) {
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  }
}
