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
        <!-- Filter Bar -->
        <div style="display:flex;gap:12px;align-items:center;padding:16px 20px;background:linear-gradient(135deg,#1e293b,#334155);border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,0.15);flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:180px;">
            <span style="color:#94a3b8;font-size:13px;font-weight:600;white-space:nowrap;">📊 Vista:</span>
            <select id="analytics-source" style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:13px;font-weight:500;outline:none;cursor:pointer;">
              <option value="pedidos">Pedidos</option>
              <option value="productos">Productos</option>
              <option value="categorias">Categorías</option>
              <option value="clientes">Clientes</option>
              <option value="devoluciones">Devoluciones</option>
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:#94a3b8;font-size:13px;font-weight:600;">Desde:</span>
            <input id="analytics-from" type="date" style="padding:7px 12px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:13px;outline:none;" />
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:#94a3b8;font-size:13px;font-weight:600;">Hasta:</span>
            <input id="analytics-to" type="date" style="padding:7px 12px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:13px;outline:none;" />
          </div>
          <button id="analytics-apply" style="padding:9px 24px;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:transform 0.15s;box-shadow:0 2px 8px rgba(37,99,235,0.4);" onmouseenter="this.style.transform='scale(1.03)'" onmouseleave="this.style.transform='scale(1)'">Aplicar filtros</button>
        </div>

        <div id="analytics-error" class="hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></div>

        <!-- KPI Cards -->
        <div class="grid gap-4 md:grid-cols-3 lg:grid-cols-6" id="analytics-kpis"></div>

        <!-- Charts -->
        <div class="grid gap-6 lg:grid-cols-2">
          <section style="border-radius:14px;border:1px solid #e2e8f0;background:#fff;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
              <span style="font-size:20px;">📊</span>
              <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0;">Gráfico de barras</h3>
            </div>
            <div id="bar-chart"></div>
          </section>
          <section style="border-radius:14px;border:1px solid #e2e8f0;background:#fff;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
              <span style="font-size:20px;">🍩</span>
              <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0;">Distribución</h3>
            </div>
            <div id="pie-chart" style="display:flex;flex-direction:column;align-items:center;gap:20px;"></div>
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
    { icon: '👥', label: 'Clientes', value: analyticsData.usuarios.length, gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
    { icon: '📦', label: 'Pedidos', value: analyticsData.pedidos.length, gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
    { icon: '💰', label: 'Ventas', value: `${totalVentas.toFixed(2)} €`, gradient: 'linear-gradient(135deg,#10b981,#059669)' },
    { icon: '🔄', label: 'Devoluciones', value: devolucionesPendientes, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    { icon: '⚠️', label: 'Productos sin stock', value: productosSinStock, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
    { icon: '📋', label: 'Vista activa', value: source.charAt(0).toUpperCase() + source.slice(1), gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
  ];

  document.getElementById('analytics-kpis').innerHTML = kpis.map(k => `
    <div style="position:relative;overflow:hidden;border-radius:14px;padding:18px 16px;background:#fff;border:1px solid #e2e8f0;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:${k.gradient};"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-size:18px;">${k.icon}</span>
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">${k.label}</span>
      </div>
      <p style="font-size:22px;font-weight:800;color:#111827;margin:0;">${k.value}</p>
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
    return analyticsData.productos.map(p => ({
      label: p.nombre || 'Producto',
      value: 1,
    }));
  }
  if (source === 'clientes') {
    return analyticsData.usuarios
      .map(u => ({
        label: `${u.nombre} ${u.apellidos}`,
        value: u.totalPedidos || 0,
      }))
      .sort((a, b) => b.value - a.value);
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
    chart.innerHTML = '<p style="text-align:center;color:#9ca3af;font-size:14px;padding:40px 0;">Sin datos para mostrar.</p>';
    return;
  }

  const colors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed', '#0891b2', '#e11d48', '#65a30d', '#0d9488', '#c026d3', '#ea580c', '#4f46e5', '#059669', '#d97706', '#9333ea', '#0284c7'];
  const gradients = [
    ['#3b82f6','#1d4ed8'],['#22c55e','#16a34a'],['#ef4444','#dc2626'],['#fbbf24','#f59e0b'],
    ['#a78bfa','#7c3aed'],['#22d3ee','#0891b2'],['#fb7185','#e11d48'],['#84cc16','#65a30d'],
    ['#2dd4bf','#0d9488'],['#e879f9','#c026d3'],['#fb923c','#ea580c'],['#818cf8','#4f46e5'],
    ['#34d399','#059669'],['#fbbf24','#d97706'],['#a855f7','#9333ea'],['#38bdf8','#0284c7']
  ];
  const max = Math.max(...groups.map(g => g.value));

  const barsHtml = groups.map((item, index) => {
    const hPx = max ? Math.max(Math.round((item.value / max) * 250), 8) : 0;
    const pctRaw = total ? (item.value / total) * 100 : 0;
    const pct = pctRaw % 1 === 0 ? pctRaw.toFixed(0) : pctRaw.toFixed(1).replace('.', ',');
    const [c1, c2] = gradients[index % gradients.length];
    
    return `
      <div style="display:flex;flex:1;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;min-width:32px;">
        <span style="font-size:12px;font-weight:800;color:#374151;">${item.value}</span>
        <div style="width:100%;max-width:48px;height:${hPx}px;min-height:8px;background:linear-gradient(180deg,${c1},${c2});border-radius:6px 6px 0 0;transition:all 0.4s ease;cursor:pointer;" onmouseenter="this.style.transform='scaleY(1.05)';this.style.boxShadow='0 -4px 12px ${c1}55'" onmouseleave="this.style.transform='scaleY(1)';this.style.boxShadow='none'" title="${item.label}: ${item.value} (${pct}%)"></div>
      </div>
    `;
  }).join('');

  const labelsHtml = groups.map((item) => `
    <div style="display:flex;flex:1;justify-content:center;min-width:32px;">
      <span style="font-size:10px;font-weight:600;color:#6b7280;text-align:center;line-height:1.2;padding:0 2px;word-break:break-word;">${item.label}</span>
    </div>
  `).join('');

  chart.innerHTML = `
    <div style="display:flex;flex-direction:column;width:100%;height:320px;padding:16px 8px 0;">
      <div style="display:flex;flex:1;align-items:flex-end;gap:6px;border-bottom:2px solid #e2e8f0;border-left:2px solid #e2e8f0;padding-left:8px;padding-bottom:0;">
        ${barsHtml}
      </div>
      <div style="display:flex;gap:6px;padding-left:8px;margin-top:8px;">
        ${labelsHtml}
      </div>
    </div>
  `;
}

function renderPieChart(groups, total) {
  const chart = document.getElementById('pie-chart');
  if (!groups.length || !total) {
    chart.innerHTML = '<p style="text-align:center;color:#9ca3af;font-size:14px;padding:40px 0;">Sin datos para mostrar.</p>';
    return;
  }

  const colors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed', '#0891b2', '#e11d48', '#65a30d', '#0d9488', '#c026d3', '#ea580c', '#4f46e5', '#059669', '#d97706', '#9333ea', '#0284c7'];
  let start = 0;
  const gradient = groups.map((item, index) => {
    const end = start + (item.value / total) * 100;
    const segment = `${colors[index % colors.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  }).join(', ');

  const topItem = groups[0];
  const topPct = ((topItem.value / total) * 100).toFixed(0);

  chart.innerHTML = `
    <div style="position:relative;width:220px;height:220px;">
      <div style="width:100%;height:100%;border-radius:50%;background:conic-gradient(${gradient});box-shadow:0 4px 20px rgba(0,0,0,0.1);"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:110px;height:110px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:inset 0 2px 8px rgba(0,0,0,0.06);">
        <span style="font-size:28px;font-weight:800;color:#111827;line-height:1;">${total}</span>
        <span style="font-size:11px;color:#6b7280;font-weight:600;">Total</span>
      </div>
    </div>
    <div style="width:100%;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;">
      ${groups.map((item, index) => {
        const pctRaw = (item.value / total) * 100;
        const pct = pctRaw % 1 === 0 ? pctRaw.toFixed(0) : pctRaw.toFixed(1).replace('.', ',');
        return `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:#f9fafb;border:1px solid #f3f4f6;">
            <span style="width:12px;height:12px;border-radius:4px;flex-shrink:0;background:${colors[index % colors.length]};box-shadow:0 1px 3px ${colors[index % colors.length]}44;"></span>
            <div style="flex:1;min-width:0;">
              <span style="font-size:13px;font-weight:600;color:#374151;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
              <span style="font-size:11px;color:#9ca3af;">${item.value} · ${pct}%</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
