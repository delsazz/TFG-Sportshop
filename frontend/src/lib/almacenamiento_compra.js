import { clearServerCart, fetchCartFromServer, saveCartToServer } from './api_carrito';
const CHECKOUT_DRAFT_KEY = 'campusfp_checkout_draft';
const LAST_ORDER_KEY = 'campusfp_last_order';
export const CART_CHANGED_EVENT = 'cart-changed';
function canUseStorage() {
    return typeof window !== 'undefined';
}
function getCurrentUserCartScope() {
    if (!canUseStorage()) {
        return null;
    }
    const userId = window.sessionStorage.getItem('userId');
    const userEmail = window.sessionStorage.getItem('userEmail');
    const token = window.sessionStorage.getItem('token');
    const userName = window.sessionStorage.getItem('userName');
    return userId || userEmail || token || userName || null;
}
function getScopedKey(baseKey) {
    const scope = getCurrentUserCartScope();
    return scope ? `${baseKey}:${scope}` : null;
}
export function calculateOrderTotal(items) {
    return Number(items.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0).toFixed(2));
}
function createOrder(items, pedidoId, paymentMethod, paymentId, paymentStatus) {
    return {
        pedidoId,
        paymentId,
        paymentMethod,
        paymentStatus,
        items,
        total: calculateOrderTotal(items),
        currency: 'eur',
        createdAt: new Date().toISOString(),
    };
}
function readOrder(key) {
    if (!canUseStorage()) {
        return null;
    }
    const rawValue = window.sessionStorage.getItem(key);
    if (!rawValue) {
        return null;
    }
    try {
        const parsed = JSON.parse(rawValue);
        if (!Array.isArray(parsed.items)) {
            return null;
        }
        return {
            ...parsed,
            total: typeof parsed.total === 'number' ? parsed.total : calculateOrderTotal(parsed.items),
            currency: parsed.currency || 'eur',
            createdAt: parsed.createdAt || new Date().toISOString(),
        };
    }
    catch {
        return null;
    }
}
function writeOrder(key, order) {
    if (!canUseStorage()) {
        return;
    }
    window.sessionStorage.setItem(key, JSON.stringify(order));
}
function removeOrder(key) {
    if (!canUseStorage()) {
        return;
    }
    window.sessionStorage.removeItem(key);
}
function emitCartChanged() {
    if (!canUseStorage()) {
        return;
    }
    window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}
export function getCheckoutDraft() {
    const scopedKey = getScopedKey(CHECKOUT_DRAFT_KEY);
    return scopedKey ? readOrder(scopedKey) : null;
}
function persistCheckoutDraftLocally(order) {
    const scopedKey = getScopedKey(CHECKOUT_DRAFT_KEY);
    if (!scopedKey) {
        return;
    }
    writeOrder(scopedKey, createOrder(order.items, order.pedidoId, order.paymentMethod, order.paymentId, order.paymentStatus));
}
async function persistCheckoutDraftRemotely(order) {
    try {
        if (!order || order.items.length === 0) {
            await clearServerCart();
            return;
        }
        await saveCartToServer(order);
    }
    catch (error) {
        console.error('No se pudo sincronizar el carrito con el servidor', error);
    }
}
export function saveCheckoutDraft(order) {
    persistCheckoutDraftLocally(order);
    emitCartChanged();
    void persistCheckoutDraftRemotely(createOrder(order.items, order.pedidoId, order.paymentMethod, order.paymentId, order.paymentStatus));
}
export function clearCheckoutDraft() {
    clearLocalCheckoutDraftCache();
    void persistCheckoutDraftRemotely(null);
}
export function clearLocalCheckoutDraftCache() {
    if (!canUseStorage()) {
        return;
    }
    const scopedKey = getScopedKey(CHECKOUT_DRAFT_KEY);
    if (scopedKey) {
        removeOrder(scopedKey);
    }
    // Limpia tambien el formato anterior para evitar arrastres entre usuarios.
    removeOrder(CHECKOUT_DRAFT_KEY);
    emitCartChanged();
}
export function addItemToCheckoutDraft(item) {
    const currentOrder = getCheckoutDraft();
    const items = currentOrder?.items ? [...currentOrder.items] : [];
    const existingIndex = items.findIndex((entry) => entry.productoId === item.productoId && entry.talla === item.talla);
    if (existingIndex >= 0) {
        items[existingIndex] = {
            ...items[existingIndex],
            cantidad: items[existingIndex].cantidad + item.cantidad,
        };
    }
    else {
        items.push(item);
    }
    const nextOrder = createOrder(items, currentOrder?.pedidoId, currentOrder?.paymentMethod, currentOrder?.paymentId, currentOrder?.paymentStatus);
    saveCheckoutDraft(nextOrder);
    return nextOrder;
}
export function updateCheckoutItemQuantity(productoId, talla, cantidad) {
    const currentOrder = getCheckoutDraft();
    if (!currentOrder) {
        return null;
    }
    const items = currentOrder.items
        .map((item) => item.productoId === productoId && item.talla === talla
        ? { ...item, cantidad }
        : item)
        .filter((item) => item.cantidad > 0);
    if (items.length === 0) {
        clearCheckoutDraft();
        return null;
    }
    const nextOrder = createOrder(items, currentOrder.pedidoId, currentOrder.paymentMethod, currentOrder.paymentId, currentOrder.paymentStatus);
    saveCheckoutDraft(nextOrder);
    return nextOrder;
}
export function updateCheckoutItemSize(productoId, tallaActual, nuevaTalla) {
    const currentOrder = getCheckoutDraft();
    if (!currentOrder || !nuevaTalla || tallaActual === nuevaTalla) {
        return currentOrder;
    }
    const sourceItem = currentOrder.items.find((item) => item.productoId === productoId && item.talla === tallaActual);
    if (!sourceItem) {
        return currentOrder;
    }
    const duplicateIndex = currentOrder.items.findIndex((item) => item.productoId === productoId && item.talla === nuevaTalla);
    let items = currentOrder.items.filter((item) => !(item.productoId === productoId && item.talla === tallaActual));
    if (duplicateIndex >= 0) {
        items = items.map((item) => item.productoId === productoId && item.talla === nuevaTalla
            ? { ...item, cantidad: item.cantidad + sourceItem.cantidad }
            : item);
    }
    else {
        items.push({
            ...sourceItem,
            talla: nuevaTalla,
        });
    }
    const nextOrder = createOrder(items, currentOrder.pedidoId, currentOrder.paymentMethod, currentOrder.paymentId, currentOrder.paymentStatus);
    saveCheckoutDraft(nextOrder);
    return nextOrder;
}
export function removeCheckoutItem(productoId, talla) {
    return updateCheckoutItemQuantity(productoId, talla, 0);
}
export function getLastOrder() {
    const scopedKey = getScopedKey(LAST_ORDER_KEY);
    return scopedKey ? readOrder(scopedKey) : null;
}
export function saveLastOrder(order) {
    const scopedKey = getScopedKey(LAST_ORDER_KEY);
    if (!scopedKey) {
        return;
    }
    writeOrder(scopedKey, createOrder(order.items, order.pedidoId, order.paymentMethod, order.paymentId, order.paymentStatus));
}
export function replaceCheckoutDraftFromServer(order) {
    if (!order || order.items.length === 0) {
        clearLocalCheckoutDraftCache();
        return null;
    }
    persistCheckoutDraftLocally(order);
    emitCartChanged();
    return order;
}
export async function hydrateCheckoutDraftFromServer() {
    if (!canUseStorage() || !window.sessionStorage.getItem('token')) {
        clearLocalCheckoutDraftCache();
        return null;
    }
    try {
        const remoteOrder = await fetchCartFromServer();
        const localOrder = getCheckoutDraft();
        if (remoteOrder && remoteOrder.items.length > 0) {
            return replaceCheckoutDraftFromServer(remoteOrder);
        }
        if (localOrder && localOrder.items.length > 0) {
            await saveCartToServer(localOrder);
            return replaceCheckoutDraftFromServer(localOrder);
        }
        clearLocalCheckoutDraftCache();
        return null;
    }
    catch (error) {
        console.error('No se pudo hidratar el carrito desde el servidor', error);
        return getCheckoutDraft();
    }
}

