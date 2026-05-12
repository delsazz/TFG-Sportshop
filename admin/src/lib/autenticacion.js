const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'campusfp_admin_token';
const EMAIL_KEY = 'campusfp_admin_email';
export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}
export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY);
}
export function setStoredToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}
export function clearStoredToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
}
export function getStoredEmail() {
    return localStorage.getItem(EMAIL_KEY);
}
export function setStoredEmail(email) {
    localStorage.setItem(EMAIL_KEY, email);
}
export async function loginAdmin(email, password) {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => null));
    if (!response.ok) {
        const errorMessage = data && 'error' in data ? data.error : undefined;
        throw new ApiError(errorMessage || 'No se pudo iniciar sesion', response.status);
    }
    return data;
}
export async function validateAdminToken(token) {
    const email = getStoredEmail();
    const response = await fetch(`${API_URL}/admin`, {
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${token}`,
            ...(email ? { 'X-User-Email': email } : {}),
        },
    });
    if (response.ok) {
        return true;
    }
    if (response.status === 401 || response.status === 403) {
        return false;
    }
    throw new Error('No se pudo validar la sesion');
}
export async function logoutAdmin(token) {
    await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).catch(() => null);
}
