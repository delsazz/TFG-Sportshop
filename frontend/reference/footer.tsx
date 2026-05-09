import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* LOGO */}
        <div className="footer-section">
          <img src="/img/campusfp.png" alt="Logo" className="footer-logo" />
          <p className="footer-description">
            Plataforma de gestión y catálogo de productos. Soluciones digitales para tu negocio.
          </p>
        </div>

        {/* ENLACES */}
        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="inicio.html">Inicio</a></li>
            <li><a href="catalogo_productos.html">Catálogo</a></li>
            <li><a href="login_usuario.html">Login</a></li>
          </ul>
        </div>

        {/* CONTACTO */}
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>Email: contacto@empresa.com</p>
          <p>Teléfono: +34 600 000 000</p>
          <p>Madrid, España</p>
        </div>

        {/* LEGAL */}
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Política de privacidad</a></li>
            <li><a href="#">Términos y condiciones</a></li>
            <li><a href="#">Cookies</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 CampusFP-dvs. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;