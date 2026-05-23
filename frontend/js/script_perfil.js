document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const loadingContainer = document.getElementById('loading-container');
  const profileContainer = document.getElementById('profile-container');
  const editModal = document.getElementById('edit-modal');
  const form = document.getElementById('edit-profile-form');
  const messageContainer = document.getElementById('message-container');
  const btnEditProfile = document.getElementById('btn-edit-profile');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancel = document.getElementById('btn-cancel');
  const btnSave = document.getElementById('btn-save');
  const avatarInput = document.getElementById('avatar-input');
  const avatarDropZone = document.getElementById('avatar-drop-zone');
  const passwordModal = document.getElementById('password-modal');
  const passwordForm = document.getElementById('password-form');
  const passwordMessage = document.getElementById('password-message');
  const btnChangePassword = document.getElementById('btn-change-password');
  const btnClosePasswordModal = document.getElementById('btn-close-password-modal');
  const btnSavePassword = document.getElementById('btn-save-password');

  let currentUser = null;
  const apiBaseUrl = '/api';

  async function fetchProfile() {
    loadingContainer.classList.remove('hidden');
    profileContainer.classList.add('hidden');

    try {
      const token = getToken();
      const userEmail = getAuthValue('userEmail');

      if (!token) {
        clearAuthStorage();
        window.dispatchEvent(new Event('auth-changed'));
        window.location.href = 'iniciar_sesion.html';
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };
      if (userEmail) headers['X-User-Email'] = userEmail;

      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        credentials: 'include',
        headers
      });

      if (response.status === 401) {
        clearAuthStorage();
        window.dispatchEvent(new Event('auth-changed'));
        window.location.href = 'iniciar_sesion.html';
        return;
      }

      if (!response.ok) {
        throw new Error('No se pudo cargar el perfil');
      }

      currentUser = await response.json();
      renderProfile(currentUser);

      loadingContainer.classList.add('hidden');
      profileContainer.classList.remove('hidden');
    } catch (error) {
      showMessage('No se ha podido cargar tu perfil.', 'error');
      loadingContainer.classList.add('hidden');
      profileContainer.classList.remove('hidden');
    }
  }

  function getAddressDisplay(user) {
    if (!user) return 'No indicada';

    const street = [user.direccionCalle, user.direccionNumero, user.direccionPiso].filter(Boolean).join(', ');
    const location = [user.codigoPostal, user.direccionCiudad, user.direccionProvincia].filter(Boolean).join(' ');
    const structuredAddress = [street, location].filter(Boolean).join(' - ');

    return structuredAddress || user.direccion || 'No indicada';
  }

  function renderProfile(user) {
    const profileInitial = document.getElementById('profile-initial');
    if (user.avatarUrl) {
      profileInitial.innerHTML = `<img src="${user.avatarUrl}" alt="Foto de perfil" class="h-full w-full rounded-[inherit] object-cover" />`;
    } else {
      profileInitial.textContent = (user.nombre?.[0] || 'U').toUpperCase();
    }
    document.getElementById('profile-name-title').textContent = `${user.nombre || ''} ${user.apellidos || ''}`.trim();
    document.getElementById('profile-email-subtitle').textContent = user.email || '-';
    document.getElementById('profile-role-badge').textContent = user.roles?.length ? user.roles.join(', ') : 'Sin rol asignado';
    document.getElementById('profile-orders-badge').textContent = `${user.totalPedidos ?? 0} pedidos`;

    document.getElementById('display-nombre').textContent = user.nombre || '-';
    document.getElementById('display-apellidos').textContent = user.apellidos || '-';
    document.getElementById('display-email').textContent = user.email || '-';
    document.getElementById('display-telefono').textContent = user.telefono || 'No indicado';
    document.getElementById('display-direccion').textContent = getAddressDisplay(user);

    lucide.createIcons();

    const showPasswordButton = document.getElementById('btn-show-password');
    if (showPasswordButton) {
      const newBtn = showPasswordButton.cloneNode(true);
      showPasswordButton.parentNode.replaceChild(newBtn, showPasswordButton);

      newBtn.addEventListener('click', () => {
        const passwordDisplay = document.getElementById('display-password');
        passwordDisplay.textContent = 'No se puede mostrar: se guarda cifrada';
        passwordDisplay.classList.remove('tracking-[0.25em]', 'text-2xl', 'font-bold');
        passwordDisplay.classList.add('text-lg', 'font-semibold');
        newBtn.disabled = true;
        setTimeout(() => {
          passwordDisplay.textContent = '••••••••••••';
          passwordDisplay.classList.add('tracking-[0.25em]', 'text-2xl', 'font-bold');
          passwordDisplay.classList.remove('text-lg', 'font-semibold');
          newBtn.disabled = false;
        }, 20000);
      });
      lucide.createIcons();
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function populateForm(user) {
    if (!user) return;
    form.nombre.value = user.nombre || '';
    form.apellidos.value = user.apellidos || '';
    form.email.value = user.email || '';
    form.telefono.value = user.telefono || '';
    form.direccionCalle.value = user.direccionCalle || user.direccion || '';
    form.direccionNumero.value = user.direccionNumero || '';
    form.direccionPiso.value = user.direccionPiso || '';
    form.direccionCiudad.value = user.direccionCiudad || '';
    form.direccionProvincia.value = user.direccionProvincia || '';
    form.codigoPostal.value = user.codigoPostal || '';
  }

  function showMessage(msg, type) {
    messageContainer.textContent = msg;
    messageContainer.className = `mb-6 rounded-2xl px-5 py-4 text-sm font-semibold block ${type === 'success'
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        : 'bg-red-50 text-red-700 ring-1 ring-red-200'
      }`;
  }

  function hideMessage() {
    messageContainer.className = 'hidden mb-6 rounded-2xl px-5 py-4 text-sm font-semibold';
  }

  btnEditProfile.addEventListener('click', () => {
    populateForm(currentUser);
    hideMessage();
    editModal.classList.remove('hidden');
  });

  const closeModal = () => {
    editModal.classList.add('hidden');
  };

  btnCloseModal.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  function openPasswordModal() {
    passwordForm.reset();
    passwordMessage.className = 'hidden rounded-2xl px-4 py-3 text-sm font-semibold';
    passwordModal.classList.remove('hidden');
  }

  btnChangePassword.addEventListener('click', openPasswordModal);
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-change-password-block')) {
      openPasswordModal();
    }
  });

  btnClosePasswordModal.addEventListener('click', () => passwordModal.classList.add('hidden'));

  passwordForm.querySelectorAll('.no-paste-password').forEach(input => {
    input.addEventListener('paste', event => event.preventDefault());
    input.addEventListener('copy', event => event.preventDefault());
    input.addEventListener('cut', event => event.preventDefault());
  });

  passwordForm.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(passwordForm);
    const payload = Object.fromEntries(formData);

    if (payload.newPassword !== payload.confirmPassword) {
      showPasswordMessage('❌ Las contraseñas nuevas introducidas no coinciden. Por favor, vuelve a intentarlo.', 'error');
      return;
    }

    btnSavePassword.disabled = true;
    btnSavePassword.textContent = 'Guardando...';
    try {
      const token = getToken();
      const response = await fetch(`${apiBaseUrl}/auth/me/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data.error || data.message || '';
        const isWrongCurrent =
          response.status === 400 ||
          response.status === 401 ||
          /actual|incorrect|wrong|current|antigua/i.test(msg);
        if (isWrongCurrent) {
          throw new Error('❌ Contraseña actual errónea. Por favor, comprueba tu contraseña actual e inténtalo de nuevo.');
        }
        throw new Error(msg || 'No se pudo cambiar la contraseña');
      }
      showPasswordMessage('✅ ' + (data.mensaje || 'Contraseña cambiada correctamente'), 'success');
      passwordForm.reset();
    } catch (error) {
      showPasswordMessage(error.message, 'error');
    } finally {
      btnSavePassword.disabled = false;
      btnSavePassword.textContent = 'Guardar contraseña';
    }
  });

  function showPasswordMessage(message, type) {
    passwordMessage.textContent = message;
    passwordMessage.className = `rounded-2xl px-4 py-3 text-sm font-semibold ${type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`;
  }

  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files?.[0];
    if (file) uploadAvatar(file);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    avatarDropZone.addEventListener(eventName, event => {
      event.preventDefault();
      avatarDropZone.classList.add('border-blue-500');
    });
  });
  ['dragleave', 'drop'].forEach(eventName => {
    avatarDropZone.addEventListener(eventName, event => {
      event.preventDefault();
      avatarDropZone.classList.remove('border-blue-500');
    });
  });
  avatarDropZone.addEventListener('drop', event => {
    const file = event.dataTransfer.files?.[0];
    if (file) uploadAvatar(file);
  });

  async function uploadAvatar(file) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showMessage('Solo se permiten archivos jpg o png.', 'error');
      return;
    }
    const data = new FormData();
    data.append('file', file);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/me/avatar`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: data
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'No se pudo subir la foto');
      }
      currentUser = result.usuario || { ...currentUser, avatarUrl: result.avatarUrl };
      renderProfile(currentUser);
      showMessage('Foto de perfil actualizada.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    setFormDisabled(true);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    // Include id and other empty fields to match ProfileForm type if needed
    data.direccion = '';

    try {
      const token = getToken();
      const userEmail = getAuthValue('userEmail');

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      if (userEmail) headers['X-User-Email'] = userEmail;

      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || 'No se pudo actualizar el perfil');
      }

      const responseData = await response.json();
      currentUser = responseData.usuario;

      setAuthValue('token', responseData.token);
      setAuthValue('userName', responseData.usuario.nombre);
      setAuthValue('userEmail', responseData.usuario.email);
      window.dispatchEvent(new Event('auth-changed'));

      renderProfile(currentUser);
      showMessage(responseData.mensaje || 'Perfil actualizado correctamente.', 'success');
      closeModal();
    } catch (error) {
      showMessage(error.message || 'Error al actualizar el perfil.', 'error');
    } finally {
      setFormDisabled(false);
    }
  });

  function setFormDisabled(disabled) {
    const inputs = form.querySelectorAll('input, button');
    inputs.forEach(input => {
      input.disabled = disabled;
    });
    btnSave.innerHTML = disabled ? '<i data-lucide="save" class="h-4 w-4"></i> Guardando...' : '<i data-lucide="save" class="h-4 w-4"></i> Guardar cambios';
    lucide.createIcons();
  }

  fetchProfile();
});

