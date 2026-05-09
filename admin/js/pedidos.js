import { getPedidos, getPedido, actualizarEstadoPedido } from './services.js';
import { request } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ordersBody = document.getElementById('ordersBody');
    const orderDetail = document.getElementById('orderDetail');
    const filterId = document.getElementById('filterId');
    const filterUser = document.getElementById('filterUser');
    const filterStatus = document.getElementById('filterStatus');
    const alertContainer = document.getElementById('alertContainer');

    let allOrders = [];

    async function loadData() {
        try {
            const data = await getPedidos();
            allOrders = data;
            renderOrders();
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    function renderOrders() {
        const idSearch = filterId.value.trim();
        const userSearch = filterUser.value.toLowerCase();
        const statusSearch = filterStatus.value;

        const filtered = allOrders.filter(o => {
            const matchId = !idSearch || o.idPedido.toString() === idSearch;
            const matchUser = !userSearch || (o.usuario && (`${o.usuario.nombre} ${o.usuario.apellidos}`.toLowerCase().includes(userSearch) || o.usuario.email.toLowerCase().includes(userSearch)));
            const matchStatus = !statusSearch || o.estado === statusSearch;
            return matchId && matchUser && matchStatus;
        });

        ordersBody.innerHTML = filtered.map(o => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-sm font-mono text-gray-900">#${o.idPedido}</td>
                <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900">${o.usuario ? `${o.usuario.nombre} ${o.usuario.apellidos}` : 'N/A'}</div>
                    <div class="text-xs text-gray-500">${o.usuario?.email || ''}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">${new Date(o.fecha).toLocaleDateString('es-ES')}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(o.estado)}">
                        ${o.estado}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">${o.unidadesEntregadas || 0}/${o.totalUnidades || 0}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${o.total.toFixed(2)} EUR</td>
                <td class="px-4 py-3 text-right">
                    <button class="btn-detail rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100" data-id="${o.idPedido}">Ver detalle</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', () => showDetail(btn.dataset.id));
        });
    }

    async function showDetail(id) {
        try {
            const pedido = await getPedido(id);
            renderDetail(pedido);
            orderDetail.classList.remove('hidden');
            orderDetail.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showAlert(error.message, 'red');
        }
    }

    function renderDetail(p) {
        orderDetail.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Detalle Pedido #${p.idPedido}</h3>
                <button id="btnCloseDetail" class="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div class="grid gap-4 md:grid-cols-4 mb-6">
                <div class="p-3 border rounded">
                    <p class="text-xs text-gray-400 font-bold">FECHA</p>
                    <p class="font-bold">${new Date(p.fecha).toLocaleDateString('es-ES')}</p>
                </div>
                <div class="p-3 border rounded">
                    <p class="text-xs text-gray-400 font-bold">ESTADO</p>
                    <p class="font-bold">${p.estado}</p>
                </div>
                <div class="p-3 border rounded">
                    <p class="text-xs text-gray-400 font-bold">TOTAL</p>
                    <p class="font-bold">${p.total.toFixed(2)} EUR</p>
                </div>
                <div class="p-3 border rounded">
                    <p class="text-xs text-gray-400 font-bold">CLIENTE</p>
                    <p class="font-bold">${p.usuario ? p.usuario.nombre : 'Anónimo'}</p>
                </div>
            </div>

            <div class="space-y-4">
                <h4 class="font-bold text-gray-900 border-b pb-2 uppercase text-xs tracking-widest">Prendas</h4>
                ${p.detalles.map(d => `
                    <div class="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                            <p class="font-bold text-gray-900">${d.productoNombre}</p>
                            <p class="text-xs text-gray-500">Talla: ${d.tallaNombre} | Cantidad: ${d.cantidad}</p>
                        </div>
                        <div class="text-right">
                            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Entregado: ${d.cantidadEntregada}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
                <select id="statusSelect" class="rounded border-gray-300 p-2 text-sm">
                    <option value="PENDIENTE" ${p.estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
                    <option value="PAGADO" ${p.estado === 'PAGADO' ? 'selected' : ''}>Pagado</option>
                    <option value="EN_PREPARACION" ${p.estado === 'EN_PREPARACION' ? 'selected' : ''}>En preparación</option>
                    <option value="ENVIADO" ${p.estado === 'ENVIADO' ? 'selected' : ''}>Enviado</option>
                    <option value="CANCELADO" ${p.estado === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
                </select>
                <button id="btnUpdateStatus" class="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Actualizar Estado</button>
            </div>
        `;

        document.getElementById('btnCloseDetail').onclick = () => orderDetail.classList.add('hidden');
        document.getElementById('btnUpdateStatus').onclick = async () => {
            const newStatus = document.getElementById('statusSelect').value;
            try {
                await actualizarEstadoPedido(p.idPedido, newStatus);
                showAlert('Estado actualizado con éxito', 'green');
                loadData();
                orderDetail.classList.add('hidden');
            } catch (error) {
                showAlert(error.message, 'red');
            }
        };
    }

    function getStatusStyle(estado) {
        const styles = {
            PENDIENTE: 'bg-yellow-100 text-yellow-800',
            PAGADO: 'bg-emerald-100 text-emerald-800',
            EN_PREPARACION: 'bg-blue-100 text-blue-800',
            ENVIADO: 'bg-cyan-100 text-cyan-800',
            CANCELADO: 'bg-red-100 text-red-800',
        };
        return styles[estado] || 'bg-gray-100 text-gray-700';
    }

    function showAlert(message, color) {
        alertContainer.innerHTML = `
            <div class="rounded-lg border border-${color}-200 bg-${color}-50 px-4 py-3 text-sm text-${color}-700">
                ${message}
            </div>
        `;
        setTimeout(() => alertContainer.innerHTML = '', 5000);
    }

    [filterId, filterUser, filterStatus].forEach(el => el.addEventListener('input', renderOrders));

    loadData();
});
