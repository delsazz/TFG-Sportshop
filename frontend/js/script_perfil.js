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
        window.location.href = '/iniciar_sesion.html';
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
        window.location.href = '/iniciar_sesion.html';
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
    document.getElementById('profile-initial').textContent = (user.nombre?.[0] || 'U').toUpperCase();
    document.getElementById('profile-name-title').textContent = `${user.nombre || ''} ${user.apellidos || ''}`.trim();
    document.getElementById('profile-email-subtitle').textContent = user.email || '-';
    document.getElementById('profile-role-badge').textContent = user.roles?.length ? user.roles.join(', ') : 'Sin rol asignado';
    document.getElementById('profile-orders-badge').textContent = `${user.totalPedidos ?? 0} pedidos`;

    const rows = [
      { label: 'ID de usuario', value: user.idUsuario ? `#${user.idUsuario}` : '-', icon: 'user' },
      { label: 'Nombre', value: user.nombre || '-', icon: 'user' },
      { label: 'Apellidos', value: user.apellidos || '-', icon: 'user' },
      { label: 'Email', value: user.email || '-', icon: 'mail' },
      { label: 'Teléfono', value: user.telefono || 'No indicado', icon: 'phone' },
      { label: 'Dirección', value: getAddressDisplay(user), icon: 'map-pin' },
      { label: 'Rol', value: user.roles?.length ? user.roles.join(', ') : 'Sin rol asignado', icon: 'shield' },
      { label: 'Pedidos realizados', value: String(user.totalPedidos ?? 0), icon: 'save' },
      { label: 'Contraseña', value: 'Oculta por seguridad', icon: 'lock' },
    ];

    const container = document.getElementById('profile-rows-container');
    container.innerHTML = '';
    
    rows.forEach(row => {
      const div = document.createElement('div');
      div.className = 'rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200';
      div.innerHTML = `
        <div class="flex items-center gap-3 text-slate-500">
          <i data-lucide="${row.icon}" class="h-5 w-5"></i>
          <span class="text-sm font-semibold uppercase tracking-[0.18em]">${row.label}</span>
        </div>
        <p class="mt-4 break-words text-lg font-semibold text-slate-900">${row.value}</p>
      `;
      container.appendChild(div);
    });

    lucide.createIcons();
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
    messageContainer.className = `mb-6 rounded-2xl px-5 py-4 text-sm font-semibold block ${
      type === 'success'
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

