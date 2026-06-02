document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  const roles = getStoredRoles();

  if (!token || !hasAdminRole(roles)) {
    window.location.href = `iniciar_sesion.html?from=${encodeURIComponent('administracion.html')}`;
    return;
  }
  const userName = sessionStorage.getItem('userName') || 'Admin';
  document.getElementById('user-info').textContent = userName;
  document.body.classList.add('admin-ready');

  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggle-sidebar');
  const closeMobileBtn = document.getElementById('close-sidebar-mobile');

  if (window.lucide) {
    window.lucide.createIcons();
  }

  function getStoredRoles() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function normalizeRole(role) {
    const raw = typeof role === 'string'
      ? role
      : role?.nombreRol || role?.nombre || role?.authority || role?.rol || '';

    return String(raw).trim().replace(/^ROLE_/i, '').toLowerCase();
  }

  function hasAdminRole(userRoles) {
    return userRoles.some((role) => normalizeRole(role) === 'admin');
  }

  function toggleSidebar() {
    sidebar.classList.toggle('closed');
  }
  toggleBtn.addEventListener('click', toggleSidebar);
  closeMobileBtn.addEventListener('click', toggleSidebar);

  if (window.innerWidth < 769) {
    sidebar.classList.add('closed');
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 769) {
      sidebar.classList.remove('closed');
    } else {
      sidebar.classList.add('closed');
    }
  });

  const navLinks = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(n => n.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('active'));
      link.classList.add('active');
      const tabId = link.getAttribute('data-tab');
      document.getElementById(`tab-${tabId}`).classList.add('active');
      if (window.innerWidth < 769) {
        sidebar.classList.add('closed');
      }
      loadTabData(tabId);
    });
  });
  document.getElementById('logout-btn').addEventListener('click', () => {
    clearAuthStorage();
    window.location.href = 'iniciar_sesion.html';
  });

  function loadTabData(tabId) {
    console.log(`Loading data for ${tabId}`);
    window.dispatchEvent(new CustomEvent('admin-tab-loaded', { detail: { tabId } }));
  }
  loadTabData('analisis');
});
