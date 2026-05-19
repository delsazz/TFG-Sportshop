import { login, isAuthenticated } from './autenticacion.js';

document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        window.location.href = 'inicio.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');
    const unlockToken = new URLSearchParams(window.location.search).get('unlock');
    if (unlockToken) {
        fetch(`/api/auth/unlock-login?token=${encodeURIComponent(unlockToken)}`)
            .then(res => res.json().then(data => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                errorMessage.textContent = data.message || (ok ? 'Login desbloqueado' : 'No se pudo desbloquear el login');
                errorMessage.classList.remove('hidden');
                errorMessage.classList.toggle('text-green-600', ok);
            })
            .catch(() => {
                errorMessage.textContent = 'No se pudo desbloquear el login';
                errorMessage.classList.remove('hidden');
            });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        errorMessage.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Accediendo...';

        try {
            await login(email, password);
            window.location.href = 'inicio.html';
        } catch (error) {
            errorMessage.textContent = error.message || 'Error al iniciar sesión';
            errorMessage.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Acceder';
        }
    });
});


