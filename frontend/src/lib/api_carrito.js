import { getToken } from './almacenamiento_autenticacion';
function getAuthHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : null;
}
export async function fetchCartFromServer() {
    const headers = getAuthHeaders();
    if (!headers) {
        return null;
    }
    const response = await fetch('/api/carrito', { headers });
    if (response.status === 401) {
        return null;
    }
    if (!response.ok) {
        throw new Error('No se pudo cargar el carrito');
    }
    const data = (await response.json());
    return {
        items: data.items ?? [],
        total: data.total ?? 0,
        currency: data.currency ?? 'eur',
        createdAt: new Date().toISOString(),
    };
}
export async function saveCartToServer(order) {
    const headers = getAuthHeaders();
    if (!headers) {
        return;
    }
    const response = await fetch('/api/carrito', {
        method: 'PUT',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            items: order?.items ?? [],
        }),
    });
    if (!response.ok) {
        throw new Error('No se pudo guardar el carrito');
    }
}
export async function clearServerCart() {
    const headers = getAuthHeaders();
    if (!headers) {
        return;
    }
    const response = await fetch('/api/carrito', {
        method: 'DELETE',
        headers,
    });
    if (!response.ok && response.status !== 404) {
        throw new Error('No se pudo vaciar el carrito');
    }
}

