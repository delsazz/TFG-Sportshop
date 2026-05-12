document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const errorMessage = document.getElementById('error-message');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';

    const formData = new FormData(registerForm);
    const formProps = Object.fromEntries(formData);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formProps)
      });

      if (response.ok) {
        window.location.href = '/iniciar_sesion.html?registered=1';
      } else {
        const data = await response.json().catch(() => ({}));
        errorMessage.textContent = data.message || 'Error al registrarse.';
        errorMessage.classList.remove('hidden');
      }
    } catch (error) {
      errorMessage.textContent = 'Error de conexión con el servidor.';
      errorMessage.classList.remove('hidden');
    }
  });
});

