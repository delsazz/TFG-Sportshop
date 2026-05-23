document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('change-password-form');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const messageContainer = document.getElementById('message-container');
  const btnSubmit = document.getElementById('btn-submit');

  const apiBaseUrl = '/api';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword !== confirmPassword) {
      showMessage('Las contraseñas nuevas no coinciden', 'error');
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Cambiando contraseña...';

    try {
      const token = getToken();
      if (!token) {
        window.location.href = 'iniciar_sesion.html';
        return;
      }

      const userEmail = getAuthValue('userEmail');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      if (userEmail) headers['X-User-Email'] = userEmail;

      const res = await fetch(`${apiBaseUrl}/auth/me/password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        showMessage('Contraseña cambiada correctamente ✅', 'success');
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
      } else {
        const errorData = await res.json().catch(() => ({}));
        showMessage(errorData.message || 'Error: La contraseña actual es incorrecta', 'error');
      }
    } catch (err) {
      showMessage('Error de conexión', 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Cambiar contraseña';
    }
  });

  function showMessage(msg, type) {
    messageContainer.textContent = msg;
    messageContainer.className = `mb-6 p-4 rounded-2xl block ${
      type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`;
  }

  function hideMessage() {
    messageContainer.className = 'mb-6 p-4 rounded-2xl hidden';
  }
});

