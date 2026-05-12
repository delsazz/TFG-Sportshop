import { logout, checkAuth } from './autenticacion.js';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }

    // Activar link de navegación actual
    const currentPath = window.location.pathname.split('/').pop() || 'inicio.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('bg-blue-600', 'text-white');
            link.classList.remove('text-gray-300', 'hover:bg-gray-800');
        } else {
            link.classList.remove('bg-blue-600', 'text-white');
            link.classList.add('text-gray-300', 'hover:bg-gray-800');
        }
    });
});


