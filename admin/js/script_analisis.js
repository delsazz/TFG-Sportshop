import { getPedidos, getUsuarios } from './servicios.js';

document.addEventListener('DOMContentLoaded', async () => {
    const salesChart = document.getElementById('salesChart');
    const activeUsersCount = document.getElementById('activeUsersCount');
    const activeUsersBar = document.getElementById('activeUsersBar');
    const totalUsersCount = document.getElementById('totalUsersCount');
    const conversionRate = document.getElementById('conversionRate');
    const topUsersBody = document.getElementById('topUsersBody');

    async function loadData() {
        try {
            const [pedidos, usuarios] = await Promise.all([getPedidos(), getUsuarios()]);
            
            renderTrends(pedidos);
            renderUsersStats(usuarios);
            renderTopUsers(usuarios);
        } catch (error) {
            console.error('Error al cargar analítica:', error);
        }
    }

    function renderTrends(pedidos) {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const hoy = new Date();
        const ultimosMeses = [];
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            const label = `${meses[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            ultimosMeses.push({ label, key, total: 0 });
        }

        pedidos.forEach(p => {
            const d = new Date(p.fecha);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const m = ultimosMeses.find(um => um.key === key);
            if (m) m.total += p.total;
        });

        const maxVenta = Math.max(...ultimosMeses.map(t => t.total), 1);

        salesChart.innerHTML = ultimosMeses.map(t => `
            <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div class="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600 relative group"
                     style="height: ${(t.total / maxVenta) * 100}%">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        €${t.total.toFixed(2)}
                    </div>
                </div>
                <span class="text-[10px] text-gray-500 font-medium uppercase">${t.label}</span>
            </div>
        `).join('');
    }

    function renderUsersStats(usuarios) {
        const total = usuarios.length;
        const active = usuarios.filter(u => u.totalPedidos > 0).length;
        const rate = total > 0 ? Math.round((active / total) * 100) : 0;

        activeUsersCount.textContent = active;
        activeUsersBar.style.width = `${rate}%`;
        totalUsersCount.textContent = total;
        conversionRate.textContent = `${rate}%`;
    }

    function renderTopUsers(usuarios) {
        const top = usuarios
            .filter(u => u.totalPedidos > 0)
            .sort((a, b) => b.totalPedidos - a.totalPedidos)
            .slice(0, 5);

        topUsersBody.innerHTML = top.map(u => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${u.nombre} ${u.apellidos}</td>
                <td class="px-6 py-4 text-gray-600">${u.email}</td>
                <td class="px-6 py-4 text-center">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                        ${u.totalPedidos}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    loadData();
});

