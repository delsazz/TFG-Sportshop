const API_URL = import.meta.env.VITE_API_URL || '/api';
export async function getProductos() {
    const response = await fetch(`${API_URL}/catalogo`);
    if (!response.ok)
        throw new Error('Error al cargar productos');
    return response.json();
}
export async function getProductoPorId(id) {
    const response = await fetch(`${API_URL}/catalogo/${id}`);
    if (!response.ok)
        throw new Error('Producto no encontrado');
    return response.json();
}
export async function getImagenesProducto(id) {
    const response = await fetch(`${API_URL}/catalogo/${id}/imagenes`);
    if (!response.ok)
        throw new Error('Error al cargar imagenes');
    return response.json();
}
export async function getTallasProducto(id) {
    const response = await fetch(`${API_URL}/catalogo/${id}/tallas`);
    if (!response.ok)
        throw new Error('Error al cargar tallas');
    return response.json();
}
export async function getCategorias() {
    const response = await fetch(`${API_URL}/categorias?t=${Date.now()}`, {
        cache: 'no-store',
    });
    if (!response.ok)
        throw new Error('Error al cargar categorias');
    return response.json();
}
export async function getCategoriaPorSlug(slug) {
    const response = await fetch(`${API_URL}/categorias/slug/${slug}?t=${Date.now()}`, {
        cache: 'no-store',
    });
    if (!response.ok)
        throw new Error('Categoria no encontrada');
    return response.json();
}
export async function getKits() {
    const response = await fetch(`${API_URL}/kits`);
    if (!response.ok)
        throw new Error('Error al cargar kits');
    return response.json();
}
export async function getKitPorId(id) {
    const response = await fetch(`${API_URL}/kits/${id}`);
    if (!response.ok)
        throw new Error('Kit no encontrado');
    return response.json();
}
export async function getKitsPorCategoria(categoriaId) {
    const response = await fetch(`${API_URL}/categorias/${categoriaId}/kits`);
    if (!response.ok)
        throw new Error('Error al cargar kits de la categoria');
    return response.json();
}
export async function getDocumentosProducto(id) {
    const response = await fetch(`${API_URL}/catalogo/${id}/documentos`);
    if (!response.ok)
        throw new Error('Error al cargar documentos');
    return response.json();
}
