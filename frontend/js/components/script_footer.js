(function () {
  const pagesBase = window.location.pathname.includes('/src/pages/') ? '/src/pages/' : '/';
  const pageHref = (file) => `${pagesBase}${file}`;

  function injectFooterStyles() {
    if (document.getElementById('sport-footer-styles')) return;

    const style = document.createElement('style');
    style.id = 'sport-footer-styles';
    style.textContent = `
      .sport-footer {
        margin-top: auto;
        background: linear-gradient(135deg, #07110d, #101916);
        color: #ffffff;
        border-top: 1px solid rgba(184, 255, 0, 0.18);
      }

      .sport-footer-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem;
        display: grid;
        grid-template-columns: minmax(220px, 1.4fr) repeat(3, minmax(160px, 1fr));
        gap: 2rem;
      }

      .sport-footer-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 150px;
        height: 64px;
        padding: 0.5rem 0.75rem;
        background: #ffffff;
        border-radius: 10px;
        margin-bottom: 1rem;
      }

      .sport-footer-logo img {
        max-width: 100%;
        max-height: 48px;
        object-fit: contain;
      }

      .sport-footer p,
      .sport-footer a,
      .sport-footer li {
        color: #b7c5bd;
        font-size: 0.95rem;
        line-height: 1.65;
      }

      .sport-footer h4 {
        margin: 0 0 0.9rem;
        color: #b8ff00;
        font-size: 1rem;
        font-weight: 900;
        text-transform: uppercase;
      }

      .sport-footer ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.45rem;
      }

      .sport-footer a {
        text-decoration: none;
      }

      .sport-footer a:hover {
        color: #ffffff;
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      .sport-footer-bottom {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1rem 1.5rem;
        text-align: center;
        color: #94a3b8;
        font-size: 0.86rem;
      }

      @media (max-width: 820px) {
        .sport-footer-inner {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 560px) {
        .sport-footer-inner {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderFooter() {
    if (document.querySelector('.sport-footer')) return;
    injectFooterStyles();

    const footer = document.createElement('footer');
    footer.className = 'sport-footer';
    footer.innerHTML = `
      <div class="sport-footer-inner">
        <section>
          <span class="sport-footer-logo"><img src="/img/sportshop.jpg" alt="SportShop"></span>
          <p>SportShop reúne ropa deportiva, calzado, accesorios, equipamiento y suplementos para entrenar con comodidad y confianza.</p>
        </section>

        <section>
          <h4>Catálogo</h4>
          <ul>
            <li><a href="${pageHref('catalogo.html')}?slug=ropa-deportiva">Ropa deportiva</a></li>
            <li><a href="${pageHref('catalogo.html')}?slug=calzado">Calzado</a></li>
            <li><a href="${pageHref('catalogo.html')}?slug=accesorios">Accesorios</a></li>
            <li><a href="${pageHref('catalogo.html')}?slug=equipamiento">Equipamiento</a></li>
            <li><a href="${pageHref('catalogo.html')}?slug=suplementos">Suplementos</a></li>
          </ul>
        </section>

        <section>
          <h4>Cuenta</h4>
          <ul>
            <li><a href="${pageHref('iniciar_sesion.html')}">Iniciar sesión</a></li>
            <li><a href="${pageHref('registro.html')}">Registrarse</a></li>
            <li><a href="${pageHref('mis_pedidos.html')}">Mis pedidos</a></li>
            <li><a href="${pageHref('mis_devoluciones.html')}">Mis devoluciones</a></li>
          </ul>
        </section>

        <section>
          <h4>Tienda</h4>
          <ul>
            <li><a href="${pageHref('catalogo.html')}">Productos</a></li>
            <li><a href="${pageHref('carrito.html')}">Carrito</a></li>
            <li><a href="${pageHref('perfil.html')}">Perfil</a></li>
            <li><a href="${pageHref('administracion.html')}">Panel admin</a></li>
          </ul>
        </section>
      </div>
      <div class="sport-footer-bottom">
        SportShop · contacto@sportshop.es · +34 900 123 456 · Madrid, España
      </div>
    `;

    document.body.appendChild(footer);
  }

  document.addEventListener('DOMContentLoaded', renderFooter);
}());
