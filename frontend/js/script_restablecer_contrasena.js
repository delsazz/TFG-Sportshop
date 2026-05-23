document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-password-form');
  const emailInput = document.getElementById('email');
  const codeInput = document.getElementById('code');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  const btnSubmit = document.getElementById('btn-submit');

  const apiBaseUrl = '/api';

  // Extract email from URL search params
  const urlParams = new URLSearchParams(window.location.search);
  const initialEmail = urlParams.get('email') || '';
  if (initialEmail) {
    emailInput.value = initialEmail;
  }

  // Restrict code input to numeric
  codeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(//D/g, '');
  });

  const passwordIsValid = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*/d).{8,}$/.test(pwd);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    
    const email = emailInput.value.trim();
    const code = codeInput.value.trim();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!email || !code || !newPassword || !confirmPassword) {
      showError('Todos los campos son obligatorios.');
      return;
    }

    if (!passwordIsValid(newPassword)) {
      showError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Actualizando...';

    try {
      const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        showError(data.message || 'No se pudo actualizar la contraseña.');
        return;
      }

      showSuccess('Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
      codeInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      
      setTimeout(() => {
        window.location.href = 'iniciar_sesion.html';
      }, 1200);
      
    } catch (error) {
      showError('Error de conexión con el servidor.');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Cambiar contraseña';
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


