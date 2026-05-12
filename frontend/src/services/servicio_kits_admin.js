import { getAdminToken, getAdminAuthEmail } from '../lib/almacenamiento_autenticacion';
const API_URL = import.meta.env.VITE_API_URL || '/api';
function buildHeaders(headers) {
    const mergedHeaders = {};
    if (headers) {
        const source = new Headers(headers);
        source.forEach((value, key) => {
            mergedHeaders[key] = value;
        });
    }
    const token = getAdminToken();
    const userEmail = getAdminAuthEmail();
    if (!mergedHeaders['Content-Type']) {
        mergedHeaders['Content-Type'] = 'application/json';
    }
    if (token) {
        mergedHeaders.Authorization = `Bearer ${token}`;
    }
    if (userEmail) {
        mergedHeaders['X-User-Email'] = userEmail;
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
    if (response.status === 401) {
        throw new Error(`No autorizado (401): ${message || 'Sesion no valida o expirada. Cierra sesion e inicia de nuevo como admin.'}`);
    }
    if (response.status === 403) {
        throw new Error(`Acceso denegado (403): ${message || 'No tienes permisos de administrador para esta accion.'}`);
    }
    throw new Error(message || 'No se pudo completar la solicitud');
}
export async function getProductos() {
    const response = await apiFetch(`${API_URL}/catalogo`);
    return parseResponse(response);
}
export async function getCategorias() {
    const response = await apiFetch(`${API_URL}/categorias`);
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
        body: JSON.stringify(kit),
    });
    return parseResponse(response);
}
export async function actualizarKit(id, kit) {
    const response = await apiFetch(`${API_URL}/admin/kits/${id}`, {
        method: 'PUT',
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

