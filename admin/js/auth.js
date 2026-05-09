import { request, setStoredToken, clearStoredToken } from './api.js';

export async function login(email, password) {
    const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    // El backend devuelve LoginResponse con token, email, rol, etc.
    if (data.token) {
        setStoredToken(data.token);
        localStorage.setItem('admin_user', JSON.stringify(data));
    }
    return data;
}

export function logout() {
    clearStoredToken();
    localStorage.removeItem('admin_user');
    window.location.href = '/login.html';
}

export function isAuthenticated() {
    const token = localStorage.getItem('campusfp_admin_token');
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    return !!token && user.rol === 'ADMIN'; // Suponiendo que el rol es ADMIN para el panel
}

export function checkAuth() {
    if (!isAuthenticated() && !window.location.pathname.endsWith('login.html')) {
        window.location.href = '/login.html';
    }
}
