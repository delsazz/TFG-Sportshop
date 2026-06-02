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
const captchaGrid = document.getElementById('captchaGrid');
const captchaFeedback = document.getElementById('captchaFeedback');
const captchaReload = document.getElementById('captchaReload');
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
  aceptoTerminos: false,
  aceptoPrivacidad: false,
  captchaVerified: false,
};
const captchaPool = [
  { concept: 'camisetas', src: '/img/productos/camiseta_nike.jpg', alt: 'Camiseta deportiva' },
  { concept: 'zapatillas', src: '/img/productos/zapatillas_adidas.jpg', alt: 'Zapatillas deportivas' },
  { concept: 'mochilas', src: '/img/productos/mochila_puma.jpg', alt: 'Mochila deportiva' },
  { concept: 'pesas', src: '/img/productos/pesas_10kg.jpg', alt: 'Pesas de entrenamiento' },
  { concept: 'suplementos', src: '/img/productos/proteina_whey.jpg', alt: 'Proteína deportiva' },
  { concept: 'camisetas', src: '/img/categorias/ropa_deportiva.jpg', alt: 'Ropa deportiva' },
  { concept: 'zapatillas', src: '/img/categorias/calzado_deportivo.jpg', alt: 'Calzado deportivo' },
  { concept: 'mochilas', src: '/img/categorias/accesorios_deportivos.jpg', alt: 'Accesorios deportivos' },
  { concept: 'pesas', src: '/img/categorias/equipamiento_deportivo.jpg', alt: 'Equipamiento deportivo' },
  { concept: 'suplementos', src: '/img/categorias/suplementos_deportivos.jpg', alt: 'Suplementos deportivos' },
];
let captchaCurrentConcept = '';
let captchaSelectedIndexes = new Set();

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

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function renderCaptchaChallenge() {
  const concepts = [...new Set(captchaPool.map((item) => item.concept))];
  captchaCurrentConcept = concepts[Math.floor(Math.random() * concepts.length)];
  captchaSelectedIndexes = new Set();
  captchaFeedback.classList.add('hidden');
  captchaFeedback.textContent = '';
  captchaQuestion.textContent = captchaCurrentConcept;

  const correct = shuffle(captchaPool.filter((item) => item.concept === captchaCurrentConcept)).slice(0, 3);
  const distractors = shuffle(captchaPool.filter((item) => item.concept !== captchaCurrentConcept)).slice(0, 6);
  const challengeImages = shuffle([...correct, ...distractors]);

  captchaGrid.innerHTML = challengeImages.map((item, index) => `
    <button type="button" class="captcha-tile" data-index="${index}" data-correct="${item.concept === captchaCurrentConcept}" aria-label="${item.alt}">
      <img src="${item.src}" alt="${item.alt}" />
    </button>
  `).join('');
}

function openCaptchaChallenge() {
  if (formState.captchaVerified) return;
  renderCaptchaChallenge();
  captchaChallenge.classList.remove('hidden');
}

captchaCheckbox.addEventListener('click', openCaptchaChallenge);

captchaGrid.addEventListener('click', (event) => {
  const tile = event.target.closest('.captcha-tile');
  if (!tile) return;

  const index = Number(tile.dataset.index);
  if (captchaSelectedIndexes.has(index)) {
    captchaSelectedIndexes.delete(index);
    tile.classList.remove('is-selected');
  } else {
    captchaSelectedIndexes.add(index);
    tile.classList.add('is-selected');
  }
});

captchaReload.addEventListener('click', renderCaptchaChallenge);

captchaVerify.addEventListener('click', () => {
  const tiles = [...captchaGrid.querySelectorAll('.captcha-tile')];
  const isCorrect = tiles.every((tile, index) => {
    const shouldSelect = tile.dataset.correct === 'true';
    return captchaSelectedIndexes.has(index) === shouldSelect;
  });

  if (!isCorrect) {
    captchaFeedback.textContent = 'No coincide. Prueba con un nuevo captcha.';
    captchaFeedback.classList.remove('hidden');
    setTimeout(renderCaptchaChallenge, 700);
    return;
  }

  clearError();
  formState.captchaVerified = true;
  captchaCheckbox.setAttribute('aria-pressed', 'true');
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
  
  if (!formState.aceptoTerminos) {
    return setError('Debes aceptar los términos y condiciones.');
  }
  if (!formState.aceptoPrivacidad) {
    return setError('Debes aceptar la política de privacidad.');
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
