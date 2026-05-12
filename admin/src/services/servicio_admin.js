import { getStoredEmail, getStoredToken } from '../lib/autenticacion';
const API_URL = import.meta.env.VITE_API_URL || '/api';
const normalizeEstadoPedido = (estado) => {
    if (typeof estado !== 'string')
        return '';
    const value = estado.trim();
    const alias = {
        completado: 'ENTREGADO_COMPLETO',
        completado_total: 'ENTREGADO_COMPLETO',
        entregado: 'ENTREGADO_COMPLETO',
        pendiente: 'PENDIENTE',
        pagado: 'PAGADO',
        en_preparacion: 'EN_PREPARACION',
        enviado: 'ENVIADO',
        entregado_parcial: 'ENTREGADO_PARCIAL',
        cancelado: 'CANCELADO',
    };
    return alias[value.toLowerCase()] ?? value.toUpperCase();
};
async function parseResponse(response) {
    if (response.ok) {
        if (response.status === 204) {
            return undefined;
        }
        return response.json();
    }
    const text = await response.text().catch(() => '');
    let message = text;
    if (text) {
        try {
            const data = JSON.parse(text);
            message = data.message || data.detail || data.error || data.title || text;
        }
        catch {
            message = text;
        }
    }
    throw new Error(message || 'No se pudo completar la solicitud');
}
function normalizePedido(pedido) {
    return { ...pedido, estado: normalizeEstadoPedido(pedido.estado) };
}
function buildHeaders(headers) {
    const mergedHeaders = new Headers(headers);
    const token = getStoredToken();
    const email = getStoredEmail();
    if (token) {
        mergedHeaders.set('Authorization', `Bearer ${token}`);
    }
    if (email) {
        mergedHeaders.set('X-User-Email', email);
    }
    return mergedHeaders;
}
async function apiFetch(input, init) {
    return fetch(input, {
        ...init,
        credentials: 'include',
        headers: buildHeaders(init?.headers),
    });
}
export async function getProductos() {
    const response = await apiFetch(`${API_URL}/catalogo`);
    return parseResponse(response);
}
export async function getCategorias() {
    const response = await apiFetch(`${API_URL}/categorias`);
    return parseResponse(response);
}
export async function crearCategoria(categoria) {
    const response = await apiFetch(`${API_URL}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria),
    });
    return parseResponse(response);
}
export async function actualizarCategoria(id, categoria) {
    const response = await apiFetch(`${API_URL}/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria),
    });
    return parseResponse(response);
}
export async function eliminarCategoria(id) {
    const response = await apiFetch(`${API_URL}/categorias/${id}`, {
        method: 'DELETE',
    });
    return parseResponse(response);
}
export async function crearProducto(producto) {
    const response = await apiFetch(`${API_URL}/catalogo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto),
    });
    return parseResponse(response);
}
export async function actualizarProducto(id, producto) {
    const response = await apiFetch(`${API_URL}/catalogo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto),
    });
    return parseResponse(response);
}
export async function uploadProductoImagenes(id, files, principalIndex) {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    if (typeof principalIndex === 'number')
        form.append('principalIndex', String(principalIndex));
    const response = await apiFetch(`${API_URL}/catalogo/${id}/imagenes`, {
        method: 'POST',
        body: form,
    });
    return parseResponse(response);
}
export async function uploadProductoDocumento(id, file) {
    const form = new FormData();
    form.append('file', file);
    const response = await apiFetch(`${API_URL}/catalogo/${id}/documentos`, {
        method: 'POST',
        body: form,
    });
    return parseResponse(response);
}
export async function eliminarProducto(id) {
    const response = await apiFetch(`${API_URL}/catalogo/${id}`, {
        method: 'DELETE',
    });
    return parseResponse(response);
}
export async function getTallasProducto(id) {
    const response = await apiFetch(`${API_URL}/catalogo/${id}/tallas`);
    return parseResponse(response);
}
export async function getPedidos() {
    const response = await apiFetch(`${API_URL}/pedidos`);
    const pedidos = await parseResponse(response);
    return pedidos.map(normalizePedido);
}
export async function getPedido(id) {
    const response = await apiFetch(`${API_URL}/pedidos/${id}`);
    const pedido = await parseResponse(response);
    return normalizePedido(pedido);
}
export async function getPaymentConfig() {
    const response = await apiFetch(`${API_URL}/pagos/configuracion`);
    return parseResponse(response);
}
export async function actualizarEstadoPedido(id, estado) {
    const response = await apiFetch(`${API_URL}/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
    });
    const pedido = await parseResponse(response);
    return normalizePedido(pedido);
}
export async function registrarEntregaPedido(id, lineas) {
    const response = await apiFetch(`${API_URL}/pedidos/${id}/entregas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineas }),
    });
    const pedido = await parseResponse(response);
    return normalizePedido(pedido);
}
export async function getUsuarios() {
    const response = await apiFetch(`${API_URL}/usuarios`);
    return parseResponse(response);
}
export async function getPedidosByUsuario(idUsuario) {
    const response = await apiFetch(`${API_URL}/usuarios/${idUsuario}/pedidos`);
    return parseResponse(response);
}
export async function getInformeStock() {
    const response = await apiFetch(`${API_URL}/admin/informes/stock`);
    return parseResponse(response);
}
export async function getInformePedidos(fechaDesde, fechaHasta) {
    const params = new URLSearchParams();
    if (fechaDesde)
        params.append('fechaDesde', fechaDesde);
    if (fechaHasta)
        params.append('fechaHasta', fechaHasta);
    const response = await apiFetch(`${API_URL}/admin/informes/pedidos?${params.toString()}`);
    return parseResponse(response);
}
export async function crearPedidoAdmin(data) {
    const response = await apiFetch(`${API_URL}/admin/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const pedido = await parseResponse(response);
    return normalizePedido(pedido);
}
export async function actualizarUsuario(idUsuario, data) {
    const response = await apiFetch(`${API_URL}/admin/usuarios/${idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return parseResponse(response);
}
export async function eliminarUsuario(idUsuario) {
    const response = await apiFetch(`${API_URL}/admin/usuarios/${idUsuario}`, {
        method: 'DELETE',
    });
    return parseResponse(response);
}
export async function getKits() {
    const response = await apiFetch(`${API_URL}/admin/kits`);
    return parseResponse(response);
}
export async function getKit(id) {
    const response = await apiFetch(`${API_URL}/admin/kits/${id}`);
    return parseResponse(response);
}
export async function crearKit(kit) {
    const response = await apiFetch(`${API_URL}/admin/kits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kit),
    });
    return parseResponse(response);
}
export async function actualizarKit(id, kit) {
    const response = await apiFetch(`${API_URL}/admin/kits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kit),
    });
    return parseResponse(response);
}
export async function eliminarKit(id) {
    const response = await apiFetch(`${API_URL}/admin/kits/${id}`, {
        method: 'DELETE',
    });
    return parseResponse(response);
}

