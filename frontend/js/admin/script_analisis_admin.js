window.addEventListener('admin-tab-loaded', (event) => {
  if (event.detail.tabId !== 'analisis') return;
  initAdminAnalytics();
});

let analyticsData = {
  productos: [],
  pedidos: [],
  usuarios: [],
  devoluciones: [],
};

async function initAdminAnalytics() {
  const container = document.getElementById('analisis-container');

  if (!container.dataset.initialized) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <select id="analytics-source" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="pedidos">Pedidos</option>
            <option value="productos">Productos</option>
            <option value="categorias">Categorías</option>
            <option value="clientes">Clientes</option>
            <option value="devoluciones">Devoluciones</option>
          </select>
          <input id="analytics-from" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input id="analytics-to" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button id="analytics-apply" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Aplicar filtros</button>
        </div>

        <div id="analytics-error" class="hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></div>

        <div class="grid gap-4 md:grid-cols-4" id="analytics-kpis"></div>

        <div class="grid gap-6 lg:grid-cols-2">
          <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">Gráfico de barras</h3>
            <div id="bar-chart" class="space-y-3"></div>
          </section>
          <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">Gráfico circular</h3>
            <div id="pie-chart" class="flex flex-col items-center gap-4"></div>
          </section>
        </div>
      </div>
    `;
    container.dataset.initialized = 'true';
    document.getElementById('analytics-apply').addEventListener('click', renderAnalytics);
    document.getElementById('analytics-source').addEventListener('change', renderAnalytics);
  }

  await fetchAnalyticsData();
}

async function fetchAnalyticsData() {
  try {
    const headers = { Authorization: `Bearer ${getToken()}` };
    const [productosRes, pedidosRes, usuariosRes, devolucionesRes, categoriasRes] = await Promise.all([
      fetch('/api/catalogo', { headers }),
      fetch('/api/pedidos', { headers }),
      fetch('/api/usuarios', { headers }),
      fetch('/api/admin/devoluciones', { headers }),
      fetch('/api/categorias', { headers }),
    ]);

    if (!productosRes.ok || !pedidosRes.ok || !usuariosRes.ok || !devolucionesRes.ok || !categoriasRes.ok) {
      throw new Error('No se pudieron cargar las estadísticas');
    }

    analyticsData = {
      productos: await productosRes.json(),
      pedidos: await pedidosRes.json(),
      usuarios: await usuariosRes.json(),
      devoluciones: await devolucionesRes.json(),
      categorias: await categoriasRes.json(),
    };
    document.getElementById('analytics-error').classList.add('hidden');
    renderAnalytics();
  } catch (error) {
    const errorEl = document.getElementById('analytics-error');
    errorEl.textContent = error.message;
    errorEl.classList.remove('hidden');
  }
}

function renderAnalytics() {
  const source = document.getElementById('analytics-source').value;
  const groups = getAnalyticsGroups(source);
  const total = groups.reduce((sum, item) => sum + item.value, 0);

  renderAnalyticsKpis(source);
  renderBarChart(groups, total);
  renderPieChart(groups, total);
}

function renderAnalyticsKpis(source) {
  const totalVentas = analyticsData.pedidos.reduce((sum, pedido) => sum + Number(pedido.total || 0), 0);
  const productosSinStock = analyticsData.productos.filter((producto) => Number(producto.stock || 0) === 0).length;
  const devolucionesPendientes = analyticsData.devoluciones.filter((item) => item.estado === 'SOLICITADA').length;

  const kpis = [
    ['Clientes', analyticsData.usuarios.length],
    ['Pedidos', analyticsData.pedidos.length],
    ['Ventas', `${totalVentas.toFixed(2)} EUR`],
    ['Devoluciones pendientes', devolucionesPendientes],
    ['Productos sin stock', productosSinStock],
    ['Vista activa', source],
  ];

  document.getElementById('analytics-kpis').innerHTML = kpis.map(([label, value]) => `
    <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p class="text-xs font-medium uppercase text-gray-500">${label}</p>
      <p class="mt-2 text-2xl font-bold text-gray-900">${value}</p>
    </div>
  `).join('');
}

function getAnalyticsGroups(source) {
  const filteredOrders = filterByDate(analyticsData.pedidos, 'fechaPedido');
  const filteredReturns = filterByDate(analyticsData.devoluciones, 'fechaSolicitud');

  if (source === 'categorias') {
    return (analyticsData.categorias || []).map((cat) => ({
      label: cat.nombreCategoria,
      value: 1,
    }));
  }
  if (source === 'productos') {
    return countBy(analyticsData.productos, (item) => {
      const stock = Number(item.stock || 0);
      if (stock === 0) return 'Agotado';
      if (stock <= 5) return 'Bajo stock';
      return 'Disponible';
    });
  }
  if (source === 'clientes') {
    return countBy(analyticsData.usuarios, (item) => {
      const roles = item.roles || [];
      return roles.includes('ADMIN') ? 'Admin' : 'Cliente';
    });
  }
  if (source === 'devoluciones') {
    return countBy(filteredReturns, (item) => item.estado || 'Sin estado');
  }
  return countBy(filteredOrders, (item) => item.estado || 'Sin estado');
}

function filterByDate(items, field) {
  const from = document.getElementById('analytics-from').value;
  const to = document.getElementById('analytics-to').value;

  return items.filter((item) => {
    if (!item[field]) return true;
    const value = new Date(item[field]);
    if (from && value < new Date(from)) return false;
    if (to && value > new Date(`${to}T23:59:59`)) return false;
    return true;
  });
}

function countBy(items, getKey) {
  const map = items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(map)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function renderBarChart(groups, total) {
  const chart = document.getElementById('bar-chart');
  if (!groups.length) {
    chart.innerHTML = '<p class="text-sm text-gray-500">Sin datos para mostrar.</p>';
    return;
  }

  const colors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed', '#0891b2'];
  const max = Math.max(...groups.map(g => g.value));

  const barsHtml = groups.map((item, index) => {
    const hPx = max ? Math.max((item.value / max) * 180, 5) : 0;
    const color = colors[index % colors.length];
    
    return `
      <div class="flex flex-1 flex-col items-center justify-end">
        <span class="mb-1 text-sm font-bold text-gray-700">${item.value}</span>
        <div class="w-full max-w-[4rem] border-2 border-b-0 border-gray-800 transition-all duration-300" style="height: ${hPx}px; background-color: ${color};"></div>
      </div>
    `;
  }).join('');

  const labelsHtml = groups.map((item) => `
    <div class="flex flex-1 justify-center">
      <span class="text-[10px] sm:text-xs font-semibold text-gray-800 text-center leading-tight px-1 break-words">${item.label}</span>
    </div>
  `).join('');

  chart.innerHTML = `
    <div class="flex flex-col w-full h-80 pt-4 px-2">
      <!-- Axes and Bars -->
      <div class="flex flex-1 items-end gap-2 border-b-2 border-l-2 border-gray-800 pl-2 pb-0">
        ${barsHtml}
      </div>
      <!-- X-axis Labels -->
      <div class="flex gap-2 pl-2 mt-2">
        ${labelsHtml}
      </div>
    </div>
  `;
}

function renderPieChart(groups, total) {
  const chart = document.getElementById('pie-chart');
  if (!groups.length || !total) {
    chart.innerHTML = '<p class="text-sm text-gray-500">Sin datos para mostrar.</p>';
    return;
  }

  const colors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed', '#0891b2'];
  let start = 0;
  const gradient = groups.map((item, index) => {
    const end = start + (item.value / total) * 100;
    const segment = `${colors[index % colors.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  }).join(', ');

  chart.innerHTML = `
    <div class="h-48 w-48 rounded-full" style="background: conic-gradient(${gradient})"></div>
    <div class="grid w-full gap-2 sm:grid-cols-2">
      ${groups.map((item, index) => `
        <div class="flex items-center gap-2 text-sm text-gray-700">
          <span class="h-3 w-3 rounded-full" style="background:${colors[index % colors.length]}"></span>
          <span>${item.label}: ${item.value}</span>
        </div>
      `).join('')}
    </div>
  `;
}
