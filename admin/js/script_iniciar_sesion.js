import { login, isAuthenticated } from './autenticacion.js';

document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        window.location.href = 'inicio.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');

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


