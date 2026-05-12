import { getToken } from '../lib/almacenamiento_autenticacion';
function buildHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}
async function parseResponse(response) {
    if (response.ok) {
        return response.json();
    }
    const message = await response.text();
    throw new Error(message || 'La peticion ha fallado');
}
export async function getAdminUsers() {
    const response = await fetch('/api/usuarios', {
        headers: buildHeaders(),
    });
    return parseResponse(response);
}
export async function getAdminRoles() {
    const response = await fetch('/api/roles', {
        headers: buildHeaders(),
    });
    return parseResponse(response);
}
export async function createAdminUser(payload) {
    const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}
export async function updateAdminUser(idUsuario, payload) {
    const response = await fetch(`/api/admin/usuarios/${idUsuario}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}
export async function deleteAdminUser(idUsuario) {
    const response = await fetch(`/api/admin/usuarios/${idUsuario}`, {
        method: 'DELETE',
        headers: buildHeaders(),
    });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'No se pudo eliminar el usuario');
    }
    return true;
}

