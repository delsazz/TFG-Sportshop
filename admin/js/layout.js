import { logout, checkAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }

    const header = document.querySelector('header');
    if (header && !document.getElementById('btnExportCsv')) {
        const actions = document.createElement('div');
        actions.className = 'flex items-center gap-3';
        actions.innerHTML = `
            <button id="btnExportCsv" type="button" class="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Exportar CSV</button>
            <a href="perfil.html" class="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Mi perfil</a>
        `;
        const existingLogout = document.getElementById('logoutBtn');
        if (existingLogout) {
            existingLogout.replaceWith(actions);
            actions.appendChild(existingLogout);
            existingLogout.className = 'text-sm text-gray-500 hover:text-gray-700';
        } else {
            header.appendChild(actions);
        }
        document.getElementById('btnExportCsv')?.addEventListener('click', exportCurrentPageCsv);
    }

    // Activar link de navegación actual
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
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

function exportCurrentPageCsv() {
    const table = document.querySelector('main table');
    if (!table) {
        alert('No hay datos para exportar en esta página');
        return;
    }
    const rows = [...table.querySelectorAll('tr')].map(row =>
        [...row.querySelectorAll('th,td')].map(cell => csvValue(cell.innerText.trim()))
    ).filter(row => row.some(value => value !== ''));
    if (!rows.length) {
        alert('No hay datos para exportar en esta página');
        return;
    }
    const csv = `\uFEFF${rows.map(row => row.join(';')).join('\r\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analisis-${pageSlug()}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

function csvValue(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

function pageSlug() {
    const file = (window.location.pathname.split('/').pop() || 'inicio.html').replace(/\.html$/i, '');
    return file.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}
