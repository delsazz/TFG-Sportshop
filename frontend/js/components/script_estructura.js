(function () {
  const pagesBase = window.location.pathname.includes('/src/pages/') ? '/src/pages/' : '/';
  const pageHref = (file) => `${pagesBase}${file}`;

  const CATEGORIES = [
    { label: 'Ropa deportiva', href: `${pageHref('catalogo.html')}?slug=ropa-deportiva` },
    { label: 'Calzado', href: `${pageHref('catalogo.html')}?slug=calzado` },
    { label: 'Accesorios', href: `${pageHref('catalogo.html')}?slug=accesorios` },
    { label: 'Equipamiento', href: `${pageHref('catalogo.html')}?slug=equipamiento` },
    { label: 'Suplementos', href: `${pageHref('catalogo.html')}?slug=suplementos` },
  ];

  function getAuthRoles() {
    try {
      return JSON.parse(sessionStorage.getItem('userRoles') || '[]');
    } catch {
      return [];
    }
  }

  function getCartItems() {
    try {
      const rawDraft = JSON.parse(sessionStorage.getItem('checkoutDraft') || '[]');
      return Array.isArray(rawDraft) ? rawDraft : rawDraft.items || [];
    } catch {
      return [];
    }
  }

  function removeCartItem(index) {
    const current = getCartItems();
    current.splice(index, 1);
    sessionStorage.setItem('checkoutDraft', JSON.stringify(current));
    window.dispatchEvent(new Event('cart-changed'));
  }

  function clearSessionAndGoHome() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userRoles');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('checkoutDraft');
    sessionStorage.removeItem('checkoutOrder');
    sessionStorage.removeItem('cartDraft');
    window.dispatchEvent(new Event('auth-changed'));
    window.dispatchEvent(new Event('cart-changed'));
    window.location.href = pageHref('inicio.html');
  }

  function renderCartList() {
    const items = getCartItems();
    const count = items.reduce((total, item) => total + Number(item.cantidad || 1), 0);
    const total = items.reduce((sum, item) => sum + Number(item.precioUnitario || item.precio || 0) * Number(item.cantidad || 1), 0);
    const badge = document.querySelector('[data-cart-count]');
    const body = document.querySelector('[data-cart-body]');
    const totalNode = document.querySelector('[data-cart-total]');

    if (badge) {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    }

    if (!body) return;

    if (!items.length) {
      body.innerHTML = '<p class="sport-cart-empty">Tu carrito está vacío.</p>';
    } else {
      body.innerHTML = items.map((item, index) => `
        <div class="sport-cart-item">
          <div>
            <strong>${item.nombre || 'Producto'}</strong>
            <span>${item.talla ? `Talla ${item.talla}` : 'Sin talla'} · ${item.cantidad || 1} ud.</span>
          </div>
          <button type="button" class="sport-icon-button" data-remove-cart-item="${index}" aria-label="Eliminar producto">×</button>
        </div>
      `).join('');
    }

    if (totalNode) {
      totalNode.textContent = `${total.toFixed(2)} EUR`;
    }
  }

  function renderLayout() {
    const target = document.getElementById('layout-container');
    if (!target) return;

    const token = sessionStorage.getItem('token');
    const userName = sessionStorage.getItem('userName') || 'Mi cuenta';
    const isAdmin = getAuthRoles().some((role) => String(role).toLowerCase() === 'admin');

    target.innerHTML = `
      <header class="sport-header">
        <nav class="sport-nav" aria-label="Navegación principal">
          <a class="sport-brand" href="${pageHref('inicio.html')}">
            <span class="sport-brand-logo"><img src="/img/sportshop.jpg" alt="SportShop"></span>
            <span>SportShop</span>
          </a>
          <div class="sport-nav-links">
            ${CATEGORIES.map((category) => `<a href="${category.href}">${category.label}</a>`).join('')}
          </div>
          <div class="sport-nav-actions">
            <button type="button" class="sport-nav-button" data-cart-toggle>
              Carrito <span data-cart-count class="sport-count" hidden>0</span>
            </button>
            <div class="sport-account-menu">
              <button type="button" class="sport-nav-button" data-account-toggle>${token ? userName : 'Cuenta'}</button>
              <div class="sport-dropdown sport-account-panel" data-account-panel hidden>
                ${
                  token
                    ? `
                      <a href="${pageHref('perfil.html')}">Mi perfil</a>
                      <a href="${pageHref('mis_pedidos.html')}">Mis pedidos</a>
                      <a href="${pageHref('mis_devoluciones.html')}">Mis devoluciones</a>
                      ${isAdmin ? `<a href="${pageHref('administracion.html')}">Panel de admin</a>` : ''}
                      <button type="button" data-logout>Cerrar sesión</button>
                    `
                    : `
                      <a href="${pageHref('iniciar_sesion.html')}">Iniciar sesión</a>
                      <a href="${pageHref('registro.html')}">Registrarse</a>
                    `
                }
              </div>
            </div>
          </div>
        </nav>
        <div class="sport-dropdown sport-cart-panel" data-cart-panel hidden>
          <div class="sport-dropdown-title">Tu carrito</div>
          <div data-cart-body></div>
          <div class="sport-cart-total"><span>Total</span><strong data-cart-total>0.00 EUR</strong></div>
          <a class="sport-dropdown-cta" href="${pageHref('carrito.html')}">Ver carrito</a>
        </div>
      </header>
    `;

    document.body.classList.add('has-sport-layout');
    renderCartList();

    target.querySelector('[data-cart-toggle]')?.addEventListener('click', () => {
      const panel = target.querySelector('[data-cart-panel]');
      const account = target.querySelector('[data-account-panel]');
      account.hidden = true;
      panel.hidden = !panel.hidden;
    });

    target.querySelector('[data-account-toggle]')?.addEventListener('click', () => {
      const panel = target.querySelector('[data-account-panel]');
      const cart = target.querySelector('[data-cart-panel]');
      cart.hidden = true;
      panel.hidden = !panel.hidden;
    });

    target.querySelector('[data-logout]')?.addEventListener('click', clearSessionAndGoHome);
    target.addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove-cart-item]');
      if (button) removeCartItem(Number(button.dataset.removeCartItem));
    });

    document.addEventListener('click', (event) => {
      if (target.contains(event.target)) return;
      target.querySelector('[data-cart-panel]').hidden = true;
      target.querySelector('[data-account-panel]').hidden = true;
    });

    window.addEventListener('cart-changed', renderCartList);
    window.addEventListener('storage', renderCartList);
  }

  document.addEventListener('DOMContentLoaded', renderLayout);
}());

