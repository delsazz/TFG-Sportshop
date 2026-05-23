document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  const roles = JSON.parse(sessionStorage.getItem('userRoles') || '[]');

  if (!token || !roles.includes('ADMIN')) {
    alert('Acceso denegado. Se requiere rol de administrador.');
    window.location.href = 'iniciar_sesion.html';
    return;
  }
  const userName = sessionStorage.getItem('userName') || 'Admin';
  document.getElementById('user-info').textContent = userName;
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggle-sidebar');
  const closeMobileBtn = document.getElementById('close-sidebar-mobile');
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
  loadTabData('dashboard');
});