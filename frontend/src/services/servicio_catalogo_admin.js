import { getToken, getAuthEmail } from '../lib/almacenamiento_autenticacion';
const API_URL = import.meta.env.VITE_API_URL || '/api';
function buildHeaders() {
    const token = getToken();
    const userEmail = getAuthEmail();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userEmail ? { 'X-User-Email': userEmail } : {}),
    };
}
function buildMultipartHeaders() {
    const token = getToken();
    const userEmail = getAuthEmail();
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userEmail ? { 'X-User-Email': userEmail } : {}),
    };
}
async function parseResponse(response) {
    if (response.ok) {
        return response.status === 204 ? undefined : response.json();
    }
    const message = await response.text();
    let errorMsg = message || 'La peticion ha fallado';
    console.error(`❌ Error ${response.status} en ${response.url}`);
    console.error('Backend response:', message);
    if (response.status === 401) {
        errorMsg = `No autorizado (401): ${message || 'Usuario no autenticado o token inválido. Intenta cerrar sesión e inicia sesión nuevamente.'}`;
        console.warn('🔍 Verificar logs backend:', ['Usuario autenticado', 'sin usuario de respaldo', 'Token JWT NO válido']);
    }
    else if (response.status === 403) {
        errorMsg = `Acceso denegado (403): ${message || 'No tienes rol de ADMIN. Contacta al administrador.'}`;
    }
    else if (response.status === 400) {
        errorMsg = `Solicitud inválida (400): ${message}`;
    }
    throw new Error(errorMsg);
}
export async function getAdminCatalogProducts() {
    const response = await fetch(`${API_URL}/catalogo`, {
        credentials: 'include',
        headers: buildHeaders(),
    });
    return parseResponse(response);
}
export async function getAdminCategories() {
    const response = await fetch(`${API_URL}/categorias`, {
        credentials: 'include',
        headers: buildHeaders(),
    });
    return parseResponse(response);
}
export async function createAdminCategory(payload) {
    const response = await fetch(`${API_URL}/categorias`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}
export async function updateAdminCategory(idCategoria, payload) {
    const response = await fetch(`${API_URL}/categorias/${idCategoria}`, {
        method: 'PUT',
        credentials: 'include',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}
export async function deleteAdminCategory(idCategoria) {
    const response = await fetch(`${API_URL}/categorias/${idCategoria}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(),
    });
    return parseResponse(response);
}
export async function createAdminCatalogProduct(payload) {
    const headers = buildHeaders();
    const token = getToken();
    const userEmail = getAuthEmail();
    console.log('🚀 Antes POST /api/catalogo:');
    console.log('  Token:', token ? `✅ ${token.substring(0, 30)}...` : '❌ NULL');
    console.log('  Email:', userEmail ? `✅ ${userEmail}` : '❌ NULL');
    console.log('  Headers enviados:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers['Authorization'] ? `Bearer ${headers['Authorization'].substring(7, 30)}...` : 'NO',
        'X-User-Email': headers['X-User-Email'] || 'NO',
    });
    const response = await fetch(`${API_URL}/catalogo`, {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}
export async function uploadAdminCatalogProductImage(idProducto, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('esPrincipal', 'true');
    const response = await fetch(`${API_URL}/catalogo/${idProducto}/imagen`, {
        method: 'POST',
        credentials: 'include',
        headers: buildMultipartHeaders(),
        body: formData,
    });
    return parseResponse(response);
}
export async function updateAdminCatalogProduct(idProducto, payload) {
    const response = await fetch(`${API_URL}/catalogo/${idProducto}`, {
        method: 'PUT',
        credentials: 'include',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}
export async function deleteAdminCatalogProduct(idProducto) {
    const response = await fetch(`${API_URL}/catalogo/${idProducto}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(),
    });
    return parseResponse(response);
}
export async function getProductoDetalle(idProducto) {
    const [productoResponse, tallasResponse, imagenesResponse, documentosResponse] = await Promise.all([
        fetch(`${API_URL}/catalogo/${idProducto}`, {
            credentials: 'include',
            headers: buildHeaders(),
        }),
        fetch(`${API_URL}/catalogo/${idProducto}/tallas`, {
            credentials: 'include',
            headers: buildHeaders(),
        }),
        fetch(`${API_URL}/catalogo/${idProducto}/imagenes`, {
            credentials: 'include',
            headers: buildHeaders(),
        }),
        fetch(`${API_URL}/catalogo/${idProducto}/documentos`, {
            credentials: 'include',
            headers: buildHeaders(),
        }),
    ]);
    const producto = await parseResponse(productoResponse);
    const tallasDisponibles = await parseResponse(tallasResponse);
    const imagenes = await parseResponse(imagenesResponse);
    const documentos = await parseResponse(documentosResponse);
    const imagenPrincipal = imagenes.find((imagen) => imagen.esPrincipal)?.urlImagen ?? imagenes[0]?.urlImagen ?? producto.imagen;
    return {
        producto,
        imagenes,
        tallasDisponibles,
        documentos,
        imagenPrincipal,
    };
}
export async function uploadAdminCatalogProductImagenes(idProducto, files, principalIndex) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (typeof principalIndex === 'number')
        formData.append('principalIndex', String(principalIndex));
    const response = await fetch(`${API_URL}/catalogo/${idProducto}/imagenes`, {
        method: 'POST',
        credentials: 'include',
        headers: buildMultipartHeaders(),
        body: formData,
    });
    return parseResponse(response);
}
export async function uploadAdminCatalogProductDocumento(idProducto, file, nombre) {
    const formData = new FormData();
    formData.append('file', file);
    if (nombre?.trim()) {
        formData.append('nombre', nombre.trim());
    }
    const response = await fetch(`${API_URL}/catalogo/${idProducto}/documentos`, {
        method: 'POST',
        credentials: 'include',
        headers: buildMultipartHeaders(),
        body: formData,
    });
    return parseResponse(response);
}
export async function deleteAdminCatalogProductDocumento(idDocumento) {
    const response = await fetch(`${API_URL}/catalogo/documentos/${idDocumento}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(),
    });
    return parseResponse(response);
}

