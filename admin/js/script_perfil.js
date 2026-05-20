import { getStoredToken } from './script_api.js';

const apiBaseUrl = '/api';
const message = document.getElementById('message');
const avatarPreview = document.getElementById('avatarPreview');
const avatarInput = document.getElementById('avatarInput');
const avatarDropZone = document.getElementById('avatarDropZone');
const passwordPanel = document.getElementById('passwordPanel');
const passwordForm = document.getElementById('passwordForm');

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadProfile();
});

document.getElementById('btnShowPassword').addEventListener('click', () => {
    const display = document.getElementById('passwordDisplay');
    display.textContent = 'No se puede mostrar: se guarda cifrada';
    setTimeout(() => {
        display.textContent = 'Oculta por seguridad';
    }, 20000);
});

document.getElementById('btnOpenPassword').addEventListener('click', () => {
    passwordPanel.classList.toggle('hidden');
});

passwordForm.querySelectorAll('.no-paste-password').forEach(input => {
    input.addEventListener('paste', event => event.preventDefault());
    input.addEventListener('copy', event => event.preventDefault());
    input.addEventListener('cut', event => event.preventDefault());
});

passwordForm.addEventListener('submit', async event => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(passwordForm));
    if (payload.newPassword !== payload.confirmPassword) {
        showMessage('Las contraseñas nuevas no coinciden', 'error');
        return;
    }
    try {
        const response = await fetch(`${apiBaseUrl}/auth/me/password`, {
            method: 'PUT',
            headers: jsonHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || data.message || 'No se pudo cambiar la contraseña');
        passwordForm.reset();
        showMessage(data.mensaje || 'Contraseña cambiada correctamente', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

avatarInput.addEventListener('change', () => {
    const file = avatarInput.files?.[0];
    if (file) uploadAvatar(file);
});

['dragenter', 'dragover'].forEach(eventName => {
    avatarDropZone.addEventListener(eventName, event => {
        event.preventDefault();
        avatarDropZone.classList.add('border-blue-500');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    avatarDropZone.addEventListener(eventName, event => {
        event.preventDefault();
        avatarDropZone.classList.remove('border-blue-500');
    });
});

avatarDropZone.addEventListener('drop', event => {
    const file = event.dataTransfer.files?.[0];
    if (file) uploadAvatar(file);
});

async function loadProfile() {
    try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, { headers: jsonHeaders() });
        if (!response.ok) throw new Error('No se pudo cargar el perfil');
        renderProfile(await response.json());
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function renderProfile(user) {
    document.getElementById('profileName').textContent = `${user.nombre || ''} ${user.apellidos || ''}`.trim() || '-';
    document.getElementById('profileEmail').textContent = user.email || '-';
    if (user.avatarUrl) {
        avatarPreview.innerHTML = `<img src="${user.avatarUrl}" alt="Foto de perfil" class="h-full w-full object-cover">`;
    } else {
        avatarPreview.textContent = (user.nombre?.[0] || 'A').toUpperCase();
    }
}

async function uploadAvatar(file) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        showMessage('Solo se permiten archivos jpg o png', 'error');
        return;
    }
    const data = new FormData();
    data.append('file', file);
    try {
        const response = await fetch(`${apiBaseUrl}/auth/me/avatar`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getStoredToken()}` },
            body: data
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'No se pudo subir la foto');
        renderProfile(result.usuario);
        showMessage('Foto de perfil actualizada', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function jsonHeaders() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStoredToken()}`
    };
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = `mb-4 rounded-md px-4 py-3 text-sm font-semibold ${
        type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }`;
}
