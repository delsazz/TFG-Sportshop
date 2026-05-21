const fallbackCategorias = [
  {
    idCategoria: 1,
    nombreCategoria: 'Ropa deportiva',
    slug: 'ropa-deportiva',
    descripcion: 'Camisetas, pantalones y prendas para entrenar.',
    imagenUrl: '/img/categorias/ropa_deportiva.jpg',
    ordenVisualizacion: 1,
  },
  {
    idCategoria: 2,
    nombreCategoria: 'Calzado',
    slug: 'calzado',
    descripcion: 'Zapatillas y calzado deportivo cómodo.',
    imagenUrl: '/img/categorias/calzado_deportivo.jpg',
    ordenVisualizacion: 2,
  },
  {
    idCategoria: 3,
    nombreCategoria: 'Accesorios',
    slug: 'accesorios',
    descripcion: 'Mochilas y complementos para tu actividad.',
    imagenUrl: '/img/categorias/accesorios_deportivos.jpg',
    ordenVisualizacion: 3,
  },
  {
    idCategoria: 4,
    nombreCategoria: 'Equipamiento',
    slug: 'equipamiento',
    descripcion: 'Material para entrenamiento y fuerza.',
    imagenUrl: '/img/categorias/equipamiento_deportivo.jpg',
    ordenVisualizacion: 4,
  },
  {
    idCategoria: 5,
    nombreCategoria: 'Suplementos',
    slug: 'suplementos',
    descripcion: 'Nutrición deportiva y recuperación muscular.',
    imagenUrl: '/img/categorias/suplementos_deportivos.jpg',
    ordenVisualizacion: 5,
  },
];

const legacyCategoryImages = {
  '1': '/img/categorias/ropa_deportiva.jpg',
  '2': '/img/categorias/calzado_deportivo.jpg',
  '3': '/img/categorias/accesorios_deportivos.jpg',
  '4': '/img/categorias/equipamiento_deportivo.jpg',
  '5': '/img/categorias/suplementos_deportivos.jpg',
  'ropa-deportiva': '/img/categorias/ropa_deportiva.jpg',
  'calzado': '/img/categorias/calzado_deportivo.jpg',
  'accesorios': '/img/categorias/accesorios_deportivos.jpg',
  'equipamiento': '/img/categorias/equipamiento_deportivo.jpg',
  'suplementos': '/img/categorias/suplementos_deportivos.jpg',
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
    btnAction.href = 'perfil.html';
  } else {
    btnAction.textContent = 'Iniciar sesión';
    btnAction.href = 'iniciar_sesion.html';
  }

  // Load categories
  const categoriasContainer = document.getElementById('categorias-container');
  const categorias = await getCategorias();
  const categoriasMostrar = categorias.length > 0 ? categorias : fallbackCategorias;

  categoriasMostrar.forEach(categoria => {
    const imagenSrc = categoria.imagenUrl || legacyCategoryImages[categoria.slug] || legacyCategoryImages[String(categoria.idCategoria)] || '/img/categorias/ropa_deportiva.jpg';
    
    const catHtml = `
        <a href="categoria_catalogo.html?slug=${categoria.slug}" class="category-card" style="background-image: url('${imagenSrc}');">
          <div class="category-card-content">
            <h3>${categoria.nombreCategoria}</h3>
            <p>${categoria.descripcion || 'Ver uniforme de esta categoría.'}</p>
          </div>
        </a>
      `;
    categoriasContainer.insertAdjacentHTML('beforeend', catHtml);
  });
});
