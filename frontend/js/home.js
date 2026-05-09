const fallbackCategorias = [
  {
    idCategoria: 1,
    nombreCategoria: 'Protección Civil',
    slug: 'proteccion-civil',
    descripcion: 'Equipamiento para intervenciones',
    imagenUrl: '/img/proteccion-civil.jpg',
    ordenVisualizacion: 1,
  },
  {
    idCategoria: 2,
    nombreCategoria: 'Técnico en Emergencias Sanitarias',
    slug: 'emergencias',
    descripcion: 'Uniformes y EPIs para ambulancias',
    imagenUrl: '/img/sanidad.jpg',
    ordenVisualizacion: 2,
  },
  {
    idCategoria: 3,
    nombreCategoria: 'Laboratorio',
    slug: 'laboratorio',
    descripcion: 'Protección para entornos de laboratorio',
    imagenUrl: '/img/laboratorio.jpg',
    ordenVisualizacion: 3,
  },
];

const legacyCategoryImages = {
  '1': '/img/proteccion-civil.jpg',
  '2': '/img/sanidad.jpg',
  '3': '/img/laboratorio.jpg',
  'proteccion-civil': '/img/proteccion-civil.jpg',
  'emergencias': '/img/sanidad.jpg',
  'laboratorio': '/img/laboratorio.jpg',
};

async function getCategorias() {
  try {
    const response = await fetch('/api/categorias');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.warn('Usando categorías de fallback', error);
    return fallbackCategorias;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  const isLoggedIn = !!sessionStorage.getItem('token');
  const btnAction = document.getElementById('btn-action');
  
  if (isLoggedIn) {
    btnAction.textContent = 'Ir a mi perfil';
    btnAction.href = '/perfil.html';
  } else {
    btnAction.textContent = 'Iniciar sesión';
    btnAction.href = '/login.html';
  }

  // Load categories
  const categoriasContainer = document.getElementById('categorias-container');
  const categorias = await getCategorias();
  const categoriasMostrar = categorias.length > 0 ? categorias : fallbackCategorias;

  categoriasMostrar.forEach(categoria => {
    const imagenSrc = categoria.imagenUrl || legacyCategoryImages[categoria.slug] || legacyCategoryImages[String(categoria.idCategoria)] || '/img/campusfp.png';
    
    const catHtml = `
      <a href="/catalogo.html?slug=${categoria.slug}" class="group overflow-hidden rounded-4xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100">
        <img
          src="${imagenSrc}"
          alt="${categoria.nombreCategoria}"
          class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="p-6 text-center sm:p-8">
          <h3 class="mb-3 text-xl font-black text-slate-900 sm:text-2xl">${categoria.nombreCategoria}</h3>
          <p class="text-gray-600">${categoria.descripcion || 'Ver uniforme de esta categoria.'}</p>
        </div>
      </a>
    `;
    categoriasContainer.insertAdjacentHTML('beforeend', catHtml);
  });
});
