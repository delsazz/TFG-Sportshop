const productsGrid = document.getElementById('products-grid');
const loginModal = document.getElementById('login-modal');
const addedModal = document.getElementById('added-modal');
const addedProductText = document.getElementById('added-product-text');
const categoryTitle = document.getElementById('category-title');
const categoryDescription = document.getElementById('category-description');
const categoryImage = document.getElementById('category-image');
const isLoggedIn = !!sessionStorage.getItem('token');
const slug = getSlugFromUrl();
let categoria = null;
let productos = [];

async function loadData() {
  try {
    const categoriaResp = await fetch(`/api/categorias/${slug}`);
    categoria = await categoriaResp.json();
    categoryTitle.textContent = categoria.nombreCategoria;
    categoryDescription.textContent =
      categoria.descripcion;
    categoryImage.src = categoria.imagenUrl;
    const productosResp =
      await fetch('/api/productos');
    const productosData =
      await productosResp.json();
    productos =
      productosData.filter(
        p => p.categoria.slug === slug
      );
    renderProducts();
  } catch (error) {
    console.error(error);
  }
}

function renderProducts() {
  productsGrid.innerHTML = '';
  productos.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img
        src="${product.imagen}"
        alt="${product.nombre}"
        class="product-image"
      >
      <div class="product-info">
        <h3>${product.nombre}</h3>
        <p>${product.tipoPrenda}</p>
        <span class="price">
          ${product.precio.toFixed(2)} €
        </span>
        <button
          onclick="handleAddToCart(${product.idProducto})"
        >
          Añadir
        </button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}


// AÑADIR AL CARRITO
function handleAddToCart(productId) {

  if (!isLoggedIn) {
    openLoginModal();
    return;
  }

  const product =
    productos.find(
      p => p.idProducto === productId
    );
  addToCart(product);
}

function addToCart(product) {
  let cart =
    JSON.parse(
      localStorage.getItem('cart')
    ) || [];
  cart.push({
    productoId: product.idProducto,
    nombre: product.nombre,
    precio: product.precio,
    cantidad: 1
  });
  localStorage.setItem(
    'cart',
    JSON.stringify(cart)
  );
  addedProductText.textContent =
    `${product.nombre} añadido al carrito`;
  openAddedModal();

}

function openLoginModal() {
  loginModal.classList.remove('hidden');

}

function closeLoginModal() {
  loginModal.classList.add('hidden');

}

function openAddedModal() {
  addedModal.classList.remove('hidden');
}

function closeAddedModal() {
  addedModal.classList.add('hidden');

}

function getSlugFromUrl() {
  const parts =
    window.location.pathname.split('/');
  return parts[parts.length - 1];

}
loadData();