import { request, setStoredToken, clearStoredToken } from './script_api.js';

export async function login(email, password) {
    const data = await request('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    // El backend devuelve LoginResponse con token, email, rol, etc.
    if (data.token) {
        setStoredToken(data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.usuario || data));
    }
    return data;
}

export function logout() {
    clearStoredToken();
    localStorage.removeItem('admin_user');
    window.location.href = '/iniciar_sesion.html';
}

export function isAuthenticated() {
    const token = localStorage.getItem('campusfp_admin_token');
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    return !!token && String(user.role || user.rol || '').toLowerCase() === 'admin';
}

export function checkAuth() {
    if (!isAuthenticated() && !window.location.pathname.endsWith('iniciar_sesion.html')) {
        window.location.href = '/iniciar_sesion.html';
    }
}

