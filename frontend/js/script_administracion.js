document.addEventListener('DOMContentLoaded', () => {
  // Check auth and role
  const token = sessionStorage.getItem('token');
  const roles = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
  
  if (!token || !roles.includes('ADMIN')) {
    alert('Acceso denegado. Se requiere rol de administrador.');
    window.location.href = 'iniciar_sesion.html';
    return;
  }

  // Set user name
  const userName = sessionStorage.getItem('userName') || 'Admin';
  document.getElementById('user-info').textContent = userName;

  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggle-sidebar');
  const closeMobileBtn = document.getElementById('close-sidebar-mobile');

  function toggleSidebar() {
    sidebar.classList.toggle('closed');
  }

  toggleBtn.addEventListener('click', toggleSidebar);
  closeMobileBtn.addEventListener('click', toggleSidebar);

  // Auto-close sidebar on mobile
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

  // Tab navigation
  const navLinks = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Remove active class from all
      navLinks.forEach(n => n.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('active'));

      // Add active to clicked
      link.classList.add('active');
      const tabId = link.getAttribute('data-tab');
      document.getElementById(`tab-${tabId}`).classList.add('active');
      
      // On mobile, close sidebar after clicking
      if (window.innerWidth < 769) {
        sidebar.classList.add('closed');
      }

      // TODO: Call specific fetch functions based on tabId
      loadTabData(tabId);
    });
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    clearAuthStorage();
    window.location.href = 'iniciar_sesion.html';
  });

  function loadTabData(tabId) {
    console.log(`Loading data for ${tabId}`);
    window.dispatchEvent(new CustomEvent('admin-tab-loaded', { detail: { tabId } }));
  }

  // Initial load
  loadTabData('dashboard');
});

