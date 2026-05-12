import { getToken, getAuthEmail } from '../lib/almacenamiento_autenticacion';
const PEDIDOS_API = '/api/pedidos';
const normalizePedidoEstado = (estado) => {
    if (typeof estado !== 'string')
        return '';
    const trimmed = estado.trim();
    const map = {
        Completado: 'ENTREGADO_COMPLETO',
        Completo: 'ENTREGADO_COMPLETO',
        Entregado: 'ENTREGADO_COMPLETO',
        'En preparación': 'EN_PREPARACION',
        Preparación: 'EN_PREPARACION',
        'Enviado': 'ENVIADO',
        'Pendiente': 'PENDIENTE',
        'Pagado': 'PAGADO',
        'Cancelado': 'CANCELADO',
    };
    return map[trimmed] ?? trimmed.toUpperCase();
};
const buildHeaders = () => {
    const token = getToken();
    const userEmail = getAuthEmail();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userEmail ? { 'X-User-Email': userEmail } : {}),
    };
};
const extractErrorMessage = async (response) => {
    const body = await response.text();
    if (!body) {
        return response.statusText || `Error ${response.status}`;
    }
    try {
        const data = JSON.parse(body);
        if (typeof data.message === 'string' && data.message.trim())
            return data.message;
        if (typeof data.detail === 'string' && data.detail.trim())
            return data.detail;
        if (typeof data.error === 'string' && data.error.trim())
            return data.error;
        if (typeof data.title === 'string' && data.title.trim())
            return data.title;
        if (data.errors)
            return JSON.stringify(data.errors);
    }
    catch {
        return body;
    }
    return body;
};
const parseJsonOrThrow = async (response) => {
    if (response.ok) {
        return response.json();
    }
    throw new Error(await extractErrorMessage(response));
};
const toNumber = (value, fallback = 0) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const normalizePedidoDetalle = (pedido) => ({
    ...pedido,
    estado: normalizePedidoEstado(pedido?.estado),
    total: toNumber(pedido?.total),
    detalles: Array.isArray(pedido?.detalles)
        ? pedido.detalles.map((detalle) => ({
            idDetalle: toNumber(detalle?.idDetalle),
            cantidadPedida: toNumber(detalle?.cantidadPedida ?? detalle?.cantidad),
            cantidadEntregada: toNumber(detalle?.cantidadEntregada),
            cantidadPendiente: toNumber(detalle?.cantidadPendiente),
            precioUnitario: toNumber(detalle?.precioUnitario ?? detalle?.precio),
            idProducto: toNumber(detalle?.idProducto ?? detalle?.id_producto),
            nombreProducto: detalle?.nombreProducto ?? detalle?.productoNombre ?? '',
            idTalla: toNumber(detalle?.idTalla ?? detalle?.id_talla),
            nombreTalla: detalle?.nombreTalla ?? detalle?.tallaNombre ?? '',
            estadoEntrega: detalle?.estadoEntrega ??
                detalle?.estado_entrega ??
                (toNumber(detalle?.cantidadEntregada) <= 0
                    ? 'SIN_ENTREGAR'
                    : toNumber(detalle?.cantidadEntregada) >=
                        toNumber(detalle?.cantidadPedida ?? detalle?.cantidad)
                        ? 'ENTREGADA'
                        : 'EN_REPARTO'),
        }))
        : [],
    pagos: Array.isArray(pedido?.pagos)
        ? pedido.pagos.map((pago) => ({
            ...pago,
            idPago: toNumber(pago?.idPago),
            monto: toNumber(pago?.monto),
        }))
        : [],
    historial: Array.isArray(pedido?.historial) ? pedido.historial : [],
    entregas: Array.isArray(pedido?.entregas) ? pedido.entregas : [],
});
export const getPedidos = async () => {
    const response = await fetch(PEDIDOS_API, {
        method: 'GET',
        headers: buildHeaders(),
        credentials: 'include',
    });
    const pedidos = await parseJsonOrThrow(response);
    return pedidos.map((pedido) => ({
        ...pedido,
        estado: normalizePedidoEstado(pedido.estado),
    }));
};
export const obtenerDetallePedido = async (idPedido) => {
    const response = await fetch(`${PEDIDOS_API}/${idPedido}`, {
        method: 'GET',
        headers: buildHeaders(),
        credentials: 'include',
    });
    return normalizePedidoDetalle(await parseJsonOrThrow(response));
};
export const actualizarEstadoPedido = async (idPedido, estado) => {
    const response = await fetch(`${PEDIDOS_API}/${idPedido}/estado`, {
        method: 'PUT',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify({ estado }),
    });
    return normalizePedidoDetalle(await parseJsonOrThrow(response));
};
export const registrarEntrega = async (idPedido, request) => {
    const response = await fetch(`${PEDIDOS_API}/${idPedido}/entregas`, {
        method: 'POST',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
    });
    return normalizePedidoDetalle(await parseJsonOrThrow(response));
};
export const actualizarEntregasPedido = async (idPedido, request) => {
    const response = await fetch(`${PEDIDOS_API}/${idPedido}/entregas`, {
        method: 'PUT',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
    });
    return normalizePedidoDetalle(await parseJsonOrThrow(response));
};
export const crearPedido = async (request) => {
    const response = await fetch(`${PEDIDOS_API}`, {
        method: 'POST',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
    });
    return parseJsonOrThrow(response);
};
export const crearPedidoAdmin = async (request) => {
    const response = await fetch(`/api/admin/pedidos`, {
        method: 'POST',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
    });
    return parseJsonOrThrow(response);
};
export const actualizarPedido = async (idPedido, request) => {
    const response = await fetch(`/api/admin/pedidos/${idPedido}`, {
        method: 'PUT',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
    });
    return parseJsonOrThrow(response);
};
export const actualizarEstadoPago = async (idPago, estado, notasAdmin) => {
    const response = await fetch(`/api/pagos/${idPago}/estado`, {
        method: 'PUT',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify({ estado, notasAdmin }),
    });
    return parseJsonOrThrow(response);
};
export const eliminarPedido = async (idPedido) => {
    const response = await fetch(`${PEDIDOS_API}/${idPedido}`, {
        method: 'DELETE',
        headers: buildHeaders(),
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }
    return true;
};
export const getInformeProveedor = async () => {
    const response = await fetch('/api/admin/informes/proveedor', {
        method: 'GET',
        headers: buildHeaders(),
        credentials: 'include',
    });
    return parseJsonOrThrow(response);
};
export const actualizarProveedorProducto = async (idProducto, request) => {
    const response = await fetch(`/api/admin/informes/proveedor/productos/${idProducto}`, {
        method: 'PATCH',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
    });
    return parseJsonOrThrow(response);
};
export const crearPedidoProveedor = async (request) => {
    const response = await fetch('/api/admin/informes/proveedor/pedidos', {
        method: 'POST',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
    });
    return parseJsonOrThrow(response);
};
export const getPedidosProveedor = async () => {
    const response = await fetch('/api/admin/informes/proveedor/pedidos', {
        method: 'GET',
        headers: buildHeaders(),
        credentials: 'include',
    });
    return parseJsonOrThrow(response);
};
export const actualizarEstadoPedidoProveedor = async (idPedidoProveedor, estado) => {
    const response = await fetch(`/api/admin/informes/proveedor/pedidos/${idPedidoProveedor}/estado`, {
        method: 'PATCH',
        headers: buildHeaders(),
        credentials: 'include',
        body: JSON.stringify({ estado }),
    });
    return parseJsonOrThrow(response);
};

