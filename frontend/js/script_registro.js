const OTRA_CIUDAD = '__otra_ciudad__';
const form = document.getElementById('register-form');
const comunidadSelect = document.getElementById('direccionComunidad');
const provinciaSelect = document.getElementById('direccionProvincia');
const ciudadSelect = document.getElementById('direccionCiudad');
const otraCiudadContainer = document.getElementById('otraCiudadContainer');
const otraCiudadInput = document.getElementById('direccionCiudadOtra');
const errorMsg = document.getElementById('error-message');
const captchaCheckbox = document.getElementById('captchaCheckbox');
const captchaChallenge = document.getElementById('captchaChallenge');
const captchaQuestion = document.getElementById('captchaQuestion');
const captchaAnswer = document.getElementById('captchaAnswer');
const captchaVerify = document.getElementById('captchaVerify');
const captchaTick = document.getElementById('captchaTick');
const API = '/api';
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._])[A-Za-z\d@$!%*?&._]{8,}$/;
let formState = {
  nombre: '',
  apellidos: '',
  telefono: '',
  direccionCalle: '',
  direccionNumero: '',
  direccionPiso: '',
  direccionComunidad: '',
  direccionProvincia: '',
  direccionCiudad: '',
  direccionCiudadOtra: '',
  codigoPostal: '',
  email: '',
  password: '',
  ciclo: '',
  aceptoTerminos: false,
  captchaVerified: false,
};
let captchaExpected = 0;

function setError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
}

function clearError() {
  errorMsg.textContent = '';
  errorMsg.classList.add('hidden');
}

async function loadComunidades() {
  try {
    const url = `${API}/comunidades`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed to fetch comunidades:', res.status, res.statusText);
      return;
    }
    const data = await res.json();
    console.log('Comunidades loaded:', data);
    comunidadSelect.innerHTML = `<option value="">Selecciona comunidad</option>` +
      data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  } catch (e) {
    console.error('Error loading comunidades:', e);
  }
}

async function loadProvincias(idComunidad) {
  if (!idComunidad) {
    provinciaSelect.innerHTML = `<option value="">Selecciona comunidad primero</option>`;
    provinciaSelect.disabled = true;
    ciudadSelect.innerHTML = `<option value="">Selecciona provincia primero</option>`;
    ciudadSelect.disabled = true;
    return;
  }
  const res = await fetch(`${API}/provincias/por/comunidad/${idComunidad}`);
  const data = await res.json();
  provinciaSelect.disabled = false;
  provinciaSelect.innerHTML = `<option value="">Selecciona provincia</option>` +
    data.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
  ciudadSelect.innerHTML = `<option value="">Selecciona provincia primero</option>`;
  ciudadSelect.disabled = true;
}

async function loadCiudades(idProvincia) {
  if (!idProvincia) {
    ciudadSelect.innerHTML = `<option value="">Selecciona provincia primero</option>`;
    ciudadSelect.disabled = true;
    return;
  }
  const res = await fetch(`${API}/ciudades/por/provincia/${idProvincia}`);
  const data = await res.json();
  ciudadSelect.disabled = false;
  ciudadSelect.innerHTML =
    `<option value="">Selecciona ciudad</option>` +
    data.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('') +
    `<option value="${OTRA_CIUDAD}">Otro municipio</option>`;
}

function updateState(e) {
  const { name, value, type, checked } = e.target;
  formState[name] = type === 'checkbox' ? checked : value;
  if (name === 'direccionComunidad') {
    formState.direccionProvincia = '';
    formState.direccionCiudad = '';
    loadProvincias(value);
  }
  if (name === 'direccionProvincia') {
    formState.direccionCiudad = '';
    loadCiudades(value);
  }
  if (name === 'direccionCiudad') {
    if (value === OTRA_CIUDAD) {
      otraCiudadContainer.classList.remove('hidden');
    } else {
      otraCiudadContainer.classList.add('hidden');
      formState.direccionCiudadOtra = '';
    }
  }
}
form.addEventListener('input', updateState);
form.addEventListener('change', updateState);
captchaCheckbox.addEventListener('change', () => {
  if (captchaCheckbox.checked && !formState.captchaVerified) {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    captchaExpected = a + b;
    captchaQuestion.textContent = `Resuelve el captcha: ${a} + ${b}`;
    captchaChallenge.classList.remove('hidden');
    captchaAnswer.focus();
  } else if (!formState.captchaVerified) {
    captchaChallenge.classList.add('hidden');
  }
});

captchaVerify.addEventListener('click', () => {
  if (Number(captchaAnswer.value) !== captchaExpected) {
    setError('Captcha incorrecto. Inténtalo de nuevo.');
    return;
  }
  clearError();
  formState.captchaVerified = true;
  captchaCheckbox.checked = true;
  captchaCheckbox.disabled = true;
  captchaChallenge.classList.add('hidden');
  captchaTick.classList.remove('hidden');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();
  if (!formState.nombre.trim()) return setError('El nombre es obligatorio.');
  if (!formState.apellidos.trim()) return setError('Los apellidos son obligatorios.');
  if (!formState.email.trim()) return setError('El email es obligatorio.');
  if (!formState.password.trim()) return setError('La contraseña es obligatoria.');
  if (!passwordRegex.test(formState.password)) {
    return setError('La contraseña debe tener 8 caracteres, mayúscula, minúscula, número y símbolo.');
  }
  if (!formState.aceptoTerminos) {
    return setError('Debes aceptar los términos y condiciones.');
  }
  if (!formState.captchaVerified) {
    return setError('Debes completar el captcha.');
  }
  const payload = {
    nombre: formState.nombre,
    apellidos: formState.apellidos,
    telefono: formState.telefono,
    direccionCalle: formState.direccionCalle,
    direccionNumero: formState.direccionNumero,
    direccionPiso: formState.direccionPiso,
    direccionComunidad: formState.direccionComunidad,
    direccionProvincia: formState.direccionProvincia,
    direccionCiudad:
      formState.direccionCiudad === OTRA_CIUDAD
        ? formState.direccionCiudadOtra
        : formState.direccionCiudad,
    codigoPostal: formState.codigoPostal,
    email: formState.email,
    password: formState.password,
    ciclo: formState.ciclo,
    captchaVerified: true,
  };

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      window.location.href = 'iniciar_sesion.html?registered=1';
    } else {
      const data = await res.json();
      setError(data.message || 'Error al registrarse');
    }
  } catch {
    setError('Error de conexión con el servidor');
  }
});
loadComunidades();