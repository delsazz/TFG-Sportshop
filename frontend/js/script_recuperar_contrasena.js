document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgot-password-form');
  const emailInput = document.getElementById('email');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  const btnSubmit = document.getElementById('btn-submit');

  const apiBaseUrl = '/api';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    
    const email = emailInput.value.trim();
    if (!email) {
      showError('El email es obligatorio.');
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Enviando código...';

    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        showError(data.message || 'No se pudo solicitar la recuperación.');
        return;
      }

      showSuccess(data.message || 'Si el email está registrado, recibirás un código de verificación.');
      
      setTimeout(() => {
        window.location.href = `restablecer_contrasena.html?email=${encodeURIComponent(email)}`;
      }, 900);
      
    } catch (error) {
      showError('Error de conexión con el servidor.');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Enviar código';
    }
  });

  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
  }

  function showSuccess(msg) {
    successMessage.textContent = msg;
    successMessage.classList.remove('hidden');
  }
});

