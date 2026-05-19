document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  const errorEmail = document.getElementById('error-email');
  const errorPassword = document.getElementById('error-password');
  const errorGeneral = document.getElementById('error-general');
  const msgRegistered = document.getElementById('msg-registered');

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === '1') {
    msgRegistered.classList.remove('hidden');
  }

  const apiBaseUrl = '/api'; // Adjust if needed

  if (urlParams.get('unlock')) {
    fetch(`${apiBaseUrl}/auth/unlock-login?token=${encodeURIComponent(urlParams.get('unlock'))}`)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        errorGeneral.textContent = data.message || (ok ? 'Login desbloqueado' : 'No se pudo desbloquear el login');
        errorGeneral.classList.remove('hidden');
        errorGeneral.classList.toggle('text-green-600', ok);
      })
      .catch(() => {
        errorGeneral.textContent = 'No se pudo desbloquear el login';
        errorGeneral.classList.remove('hidden');
      });
  }

  function hideErrors() {
    errorEmail.classList.add('hidden');
    errorPassword.classList.add('hidden');
    errorGeneral.classList.add('hidden');
    errorEmail.textContent = '';
    errorPassword.textContent = '';
    errorGeneral.textContent = '';
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let hasError = false;

    if (!email) {
      errorEmail.textContent = 'El email es obligatorio.';
      errorEmail.classList.remove('hidden');
      hasError = true;
    }

    if (!password) {
      errorPassword.textContent = 'La contraseña es obligatoria.';
      errorPassword.classList.remove('hidden');
      hasError = true;
    }

    if (hasError) return;

    try {
      clearAuthStorage();
      
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthValue('token', data.token);
        setAuthValue('userName', data.nombre || email.split('@')[0]);
        setAuthValue('userRoles', JSON.stringify(data.roles || []));
        if (data.idUsuario) {
          setAuthValue('userId', String(data.idUsuario));
        }
        setAuthValue('userEmail', data.email || email);

        // Verify token (me endpoint)
        const meResponse = await fetch(`${apiBaseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            ...(data.email ? { 'X-User-Email': data.email } : {}),
          },
        });

        if (!meResponse.ok) {
          clearAuthStorage();
          errorGeneral.textContent = 'Token login invalido. Reinicia backend.';
          errorGeneral.classList.remove('hidden');
          return;
        }

        window.dispatchEvent(new Event('auth-changed'));
        
        const returnUrl = urlParams.get('from') || '/inicio.html';
        window.location.href = returnUrl;
        return;
      }

      if (response.status === 423) {
        errorGeneral.textContent = 'Login bloqueado';
        errorGeneral.classList.remove('hidden');
        return;
      }

      const errorData = await response.json();
      errorGeneral.textContent = errorData.message || 'Error de login.';
      errorGeneral.classList.remove('hidden');

    } catch (err) {
      errorGeneral.textContent = 'Error de conexión con el servidor.';
      errorGeneral.classList.remove('hidden');
    }
  });
});

