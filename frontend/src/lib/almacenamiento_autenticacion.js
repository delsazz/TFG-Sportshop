const KEYS = ['token', 'userName', 'userId', 'userEmail', 'userRoles'];
const ADMIN_TOKEN_KEY = 'campusfp_admin_token';
const ADMIN_EMAIL_KEY = 'campusfp_admin_email';
function base64UrlDecode(value) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return window.atob(padded);
}
function getJwtPayload(token) {
    const parts = token.split('.');
    if (parts.length < 2) {
        return null;
    }
    try {
        return JSON.parse(base64UrlDecode(parts[1]));
    }
    catch {
        return null;
    }
}
function isExpiredToken(token) {
    const payload = getJwtPayload(token);
    if (!payload) {
        return true;
    }
    const exp = payload.exp;
    if (typeof exp !== 'number') {
        return false;
    }
    return exp * 1000 <= Date.now();
}
function normalizeStoredValue(value) {
    if (!value) {
        return null;
    }
    const normalized = value.trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') {
        return null;
    }
    return normalized;
}
export function getAuthValue(key) {
    if (key === 'token') {
        return getToken();
    }
    if (!getToken()) {
        return null;
    }
    const sessionValue = normalizeStoredValue(window.sessionStorage.getItem(key));
    if (sessionValue) {
        return sessionValue;
    }
    const localValue = normalizeStoredValue(window.localStorage.getItem(key));
    if (localValue) {
        return localValue;
    }
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
    return null;
}
export function setAuthValue(key, value) {
    window.sessionStorage.setItem(key, value);
    window.localStorage.setItem(key, value);
}
export function removeAuthValue(key) {
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
}
export function clearAuthStorage() {
    for (const key of KEYS) {
        removeAuthValue(key);
    }
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    window.localStorage.removeItem(ADMIN_EMAIL_KEY);
}
export function getToken() {
    const token = normalizeStoredValue(window.sessionStorage.getItem('token'))
        ?? normalizeStoredValue(window.localStorage.getItem('token'));
    if (token) {
        if (isExpiredToken(token)) {
            clearAuthStorage();
            return null;
        }
        return token;
    }
    for (const key of KEYS) {
        if (key !== 'token') {
            removeAuthValue(key);
        }
    }
    const adminToken = normalizeStoredValue(window.localStorage.getItem(ADMIN_TOKEN_KEY));
    if (adminToken && isExpiredToken(adminToken)) {
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
        window.localStorage.removeItem(ADMIN_EMAIL_KEY);
        return null;
    }
    return adminToken;
}
export function getAdminToken() {
    return normalizeStoredValue(window.localStorage.getItem(ADMIN_TOKEN_KEY)) ?? getToken();
}
export function getAuthEmail() {
    const storedEmail = getAuthValue('userEmail');
    if (storedEmail) {
        return storedEmail;
    }
    const storedAdminEmail = normalizeStoredValue(window.localStorage.getItem(ADMIN_EMAIL_KEY));
    if (storedAdminEmail) {
        return storedAdminEmail;
    }
    const token = getToken();
    if (!token) {
        return null;
    }
    const payload = getJwtPayload(token);
    if (!payload) {
        return null;
    }
    const subject = payload?.sub;
    if (typeof subject === 'string' && subject.trim()) {
        return subject.trim();
    }
    const email = payload?.email;
    if (typeof email === 'string' && email.trim()) {
        return email.trim();
    }
    return null;
}
export function getAdminAuthEmail() {
    const storedAdminEmail = normalizeStoredValue(window.localStorage.getItem(ADMIN_EMAIL_KEY));
    if (storedAdminEmail) {
        return storedAdminEmail;
    }
    return getAuthEmail();
}
