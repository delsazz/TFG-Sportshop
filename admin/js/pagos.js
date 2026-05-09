import { getPedidos, getPedido } from './services.js';

document.addEventListener('DOMContentLoaded', async () => {
    const paymentsBody = document.getElementById('paymentsBody');
    const paymentDetail = document.getElementById('paymentDetail');
    const filterUser = document.getElementById('filterUser');
    const filterStatus = document.getElementById('filterStatus');
    
    const totalImportEl = document.getElementById('totalImport');
    const paidImportEl = document.getElementById('paidImport');
    const pendingImportEl = document.getElementById('pendingImport');

    let allStudentsPayments = [];

    async function loadData() {
        try {
            const pedidos = await getPedidos();
            // Agrupar por usuario
            const agrupados = {};
            
            for (const p of pedidos) {
                const user = p.usuario;
                const key = user ? user.idUsuario : `anon-${p.idPedido}`;
                if (!agrupados[key]) {
                    agrupados[key] = {
                        key,
                        alumno: user ? `${user.nombre} ${user.apellidos}` : 'Anónimo',
                        email: user ? user.email : '',
                        total: 0,
                        pagado: 0,
                        pendiente: 0,
                        pedidos: []
                    };
                }
                agrupados[key].total += p.total;
                // En el modelo resumido, si el estado es PAGADO, ENVIADO o ENTREGADO_COMPLETO, lo contamos como pagado
                const isPaid = ['PAGADO', 'ENVIADO', 'ENTREGADO_COMPLETO'].includes(p.estado);
                if (isPaid) {
                    agrupados[key].pagado += p.total;
                } else {
                    agrupados[key].pendiente += p.total;
                }
                agrupados[key].pedidos.push(p);
            }

            allStudentsPayments = Object.values(agrupados);
            renderSummary();
            renderPayments();
        } catch (error) {
            console.error('Error al cargar pagos:', error);
        }
    }

    function renderSummary() {
        const total = allStudentsPayments.reduce((sum, s) => sum + s.total, 0);
        const paid = allStudentsPayments.reduce((sum, s) => sum + s.pagado, 0);
        const pending = allStudentsPayments.reduce((sum, s) => sum + s.pendiente, 0);

        totalImportEl.textContent = `${total.toFixed(2)} €`;
        paidImportEl.textContent = `${paid.toFixed(2)} €`;
        pendingImportEl.textContent = `${pending.toFixed(2)} €`;
    }

    function renderPayments() {
        const search = filterUser.value.toLowerCase();
        const status = filterStatus.value;

        const filtered = allStudentsPayments.filter(s => {
            const matchSearch = s.alumno.toLowerCase().includes(search) || s.email.toLowerCase().includes(search);
            let matchStatus = true;
            if (status === 'completo') matchStatus = s.pendiente === 0;
            if (status === 'parcial') matchStatus = s.pagado > 0 && s.pendiente > 0;
            if (status === 'pendiente') matchStatus = s.pagado === 0;
            return matchSearch && matchStatus;
        });

        paymentsBody.innerHTML = filtered.map(s => `
            <tr class="cursor-pointer hover:bg-gray-50 transition-colors" data-key="${s.key}">
                <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900">${s.alumno}</div>
                    <div class="text-xs text-gray-500">${s.email}</div>
                </td>
                <td class="px-4 py-3">
                    ${getStatusBadge(s.pagado, s.pendiente)}
                </td>
                <td class="px-4 py-3 text-right text-sm text-gray-700">${s.total.toFixed(2)} €</td>
                <td class="px-4 py-3 text-right text-sm text-gray-700">${s.pagado.toFixed(2)} €</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-gray-900">${s.pendiente.toFixed(2)} €</td>
            </tr>
        `).join('');

        document.querySelectorAll('#paymentsBody tr').forEach(tr => {
            tr.addEventListener('click', () => showDetail(tr.dataset.key));
        });
    }

    function getStatusBadge(pagado, pendiente) {
        if (pendiente === 0) return '<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Completo</span>';
        if (pagado > 0) return '<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">Parcial</span>';
        return '<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-red-200">Pendiente</span>';
    }

    function showDetail(key) {
        const s = allStudentsPayments.find(item => item.key == key);
        if (!s) return;

        paymentDetail.innerHTML = `
            <div>
                <p class="font-medium text-gray-900">${s.alumno}</p>
                <p class="text-sm text-gray-500">${s.email}</p>
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div class="rounded-lg bg-gray-50 px-3 py-2 text-center">
                    <p class="text-[10px] font-bold uppercase text-gray-500">Total</p>
                    <p class="text-sm font-semibold text-gray-900">${s.total.toFixed(2)}€</p>
                </div>
                <div class="rounded-lg bg-emerald-50 px-3 py-2 text-center">
                    <p class="text-[10px] font-bold uppercase text-emerald-700">Pagado</p>
                    <p class="text-sm font-semibold text-emerald-900">${s.pagado.toFixed(2)}€</p>
                </div>
                <div class="rounded-lg bg-red-50 px-3 py-2 text-center">
                    <p class="text-[10px] font-bold uppercase text-red-700">Pend.</p>
                    <p class="text-sm font-semibold text-red-900">${s.pendiente.toFixed(2)}€</p>
                </div>
            </div>
            <div class="space-y-3">
                ${s.pedidos.map(p => `
                    <div class="rounded-lg border border-gray-200 p-3">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="text-sm font-semibold text-gray-900">Pedido #${p.idPedido}</p>
                                <p class="text-xs text-gray-500">${new Date(p.fecha).toLocaleDateString('es-ES')} · ${p.estado}</p>
                            </div>
                            <p class="text-sm font-semibold text-gray-900">${p.total.toFixed(2)} €</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    [filterUser, filterStatus].forEach(el => el.addEventListener('input', renderPayments));

    loadData();
});
