import { request } from './api.js';

export async function getProductos() {
    return request('/catalogo');
}

export async function getCategorias() {
    return request('/categorias');
}

export async function getPedidos() {
    return request('/pedidos');
}

export async function getUsuarios() {
    return request('/usuarios');
}

export async function getPedido(id) {
    return request(`/pedidos/${id}`);
}

export async function actualizarEstadoPedido(id, estado) {
    return request(`/pedidos/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado })
    });
}

export async function getInformeStock() {
    return request('/admin/informes/stock');
}

export async function getKits() {
    return request('/admin/kits');
}
