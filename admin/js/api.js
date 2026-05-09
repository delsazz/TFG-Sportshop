const API_URL = '/api';
const TOKEN_KEY = 'campusfp_admin_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function request(endpoint, options = {}) {
    const token = getStoredToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = (data && data.message) || (data && data.error) || 'Error en la petición';
        throw new ApiError(message, response.status);
    }

    return data;
}
