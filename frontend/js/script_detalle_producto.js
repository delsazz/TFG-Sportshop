const productImagesById = {
  1: ['/img/productos/chaqueta-pc.jpg', '/img/productos/CEÑIDOR-pc.jpg'],
  2: ['/img/productos/camiseta-pc.jpg'],
  3: ['/img/productos/pantalon-pc.jpg'],
  4: ['/img/productos/botas-pc.jpg'],
  5: [
    '/img/productos/chaqueta-te.jpg',
    '/img/productos/F._T_CHAQUETA-te.jpg',
    '/img/productos/TABLA_TALLA_CHAQUETA_C-2931-te.jpg',
    '/img/productos/CASCO AMARILLO-te.jpg',
    '/img/productos/GAFAS.jpg',
    '/img/productos/mochila-te.jpg',
  ],
  6: ['/img/productos/camiseta-te.jpg', '/img/productos/CAMISETA NEGRA-te.jpg'],
  7: ['/img/productos/pantalon-te.jpg', '/img/productos/F._T_PANTALON-te.jpg'],
  8: ['/img/productos/botas-te.jpg'],
  9: ['/img/productos/parte-superior-sanidad.jpg'],
  10: ['/img/productos/pantalon-sanidad.jpg'],
  11: ['/img/productos/crocs-sanidad.jpg'],
};

function resolveImage(path) {
  const img = path?.trim();
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const cleanPath = img.startsWith('/') ? img.substring(1) : img;
  return `/${cleanPath}`;
}

function isProductImage(path) {
  return Boolean(path?.trim().toLowerCase().includes('/img/productos/'));
}

function getFallbackSizes(product) {
  const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  const clothingSizes = ['S', 'M', 'L', 'XL'];
  const names = product.tipoPrenda?.toLowerCase().includes('calzado') ? shoeSizes : clothingSizes;
  return names.map((name, index) => ({
    idTalla: index + 1,
    nombre: name,
    stock: product.stock,
  }));
}

document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();
  
  const urlParams = new URLSearchParams(window.location.search);
  const productIdStr = urlParams.get('id');
  const productId = parseInt(productIdStr, 10);

  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const productContainer = document.getElementById('product-container');

  if (!productId || isNaN(productId)) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.textContent = 'Error: Producto no válido';
    return;
  }

  let product = null;
  let sizes = [];
  let availableSizes = [];

  try {
    const apiBaseUrl = '/api';
    
    // Fetch product
    const productRes = await fetch(`${apiBaseUrl}/productos/${productId}`);
    if (!productRes.ok) throw new Error('Producto no encontrado');
    product = await productRes.json();

    // Fetch images (optional)
    let dbImages = [];
    try {
      const imgRes = await fetch(`${apiBaseUrl}/productos/${productId}/imagenes`);
      if (imgRes.ok) dbImages = await imgRes.json();
    } catch(e) {}

    // Fetch sizes (optional)
    try {
      const sizesRes = await fetch(`${apiBaseUrl}/productos/${productId}/tallas`);
      if (sizesRes.ok) {
        const sz = await sizesRes.json();
        sizes = sz.filter(s => s.stock > 0);
      }
    } catch(e) {}

    // Render logic
    loadingContainer.classList.add('hidden');
    productContainer.classList.remove('hidden');

    document.getElementById('back-link').href = product.categoria?.slug ? `/catalogo.html?slug=${product.categoria.slug}` : '/catalogo.html';
    
    document.getElementById('product-category').textContent = product.categoria?.nombreCategoria || '-';
    document.getElementById('product-title').textContent = product.nombre || '-';
    document.getElementById('product-type').textContent = product.tipoPrenda || '-';
    document.getElementById('product-price').textContent = `${(product.precio || 0).toFixed(2)} EUR`;
    document.getElementById('product-stock').textContent = `Stock ${product.stock || 0}`;

    const fallbackDescription = `${product.tipoPrenda} en color ${product.color}. Producto de ${product.categoria?.nombreCategoria || 'catálogo'} preparado para uso académico y profesional.`;
    document.getElementById('product-description').textContent = product.descripcion || fallbackDescription;
    
    document.getElementById('product-color').textContent = product.color || 'No indicado';
    document.getElementById('product-composition').textContent = product.composicion || 'No indicada';
    document.getElementById('product-norm').textContent = product.normativa || 'No indicada';
    document.getElementById('product-wash').textContent = product.instruccionesLavado || 'No indicado';

    // Sizes
    availableSizes = sizes.length > 0 ? sizes : getFallbackSizes(product);
    const sizeSelect = document.getElementById('product-size');
    availableSizes.forEach(size => {
      const opt = document.createElement('option');
      opt.value = size.nombre;
      opt.textContent = `${size.nombre} (Stock: ${size.stock})`;
      sizeSelect.appendChild(opt);
    });

    // Gallery
    const orderedImages = [...dbImages].sort((a, b) => a.orden - b.orden);
    const mappedImages = productImagesById[product.idProducto] || [];
    
    const urlsMap = new Map();
    
    const mainImageSrc = resolveImage(product.imagen);
    if (mainImageSrc) urlsMap.set(mainImageSrc, { src: mainImageSrc, alt: product.nombre });

    mappedImages.forEach(img => {
      const src = resolveImage(img);
      if (src && !urlsMap.has(src)) urlsMap.set(src, { src, alt: product.nombre });
    });

    orderedImages.filter(img => isProductImage(img.urlImagen)).forEach(img => {
      const src = resolveImage(img.urlImagen);
      if (src && !urlsMap.has(src)) urlsMap.set(src, { src, alt: img.altText || product.nombre });
    });

    const gallery = Array.from(urlsMap.values());
    const mainImgEl = document.getElementById('main-product-image');
    const placeholderEl = document.getElementById('main-product-placeholder');
    
    if (gallery.length > 0) {
      placeholderEl.classList.add('hidden');
      mainImgEl.classList.remove('hidden');
      mainImgEl.src = gallery[0].src;
      mainImgEl.alt = gallery[0].alt;

      if (gallery.length > 1) {
        const galleryContainer = document.getElementById('gallery-container');
        galleryContainer.classList.remove('hidden');
        gallery.forEach(image => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `aspect-square overflow-hidden rounded-lg border bg-slate-100 border-slate-200 hover:border-slate-400 transition cursor-pointer`;
          btn.innerHTML = `<img src="${image.src}" alt="${image.alt}" class="h-full w-full object-cover pointer-events-none" />`;
          btn.addEventListener('click', () => {
            mainImgEl.src = image.src;
            mainImgEl.alt = image.alt;
            // update border on buttons (not fully implemented for brevity, but easy to add active class)
          });
          galleryContainer.appendChild(btn);
        });
      }
    } else {
      placeholderEl.textContent = product.nombre;
    }

  } catch (err) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.textContent = `Error: ${err.message}`;
  }

  // Cart logic
  const btnAddCart = document.getElementById('btn-add-cart');
  const sizeSelect = document.getElementById('product-size');
  const sizeError = document.getElementById('size-error');
  const loginModal = document.getElementById('login-modal');
  const addedModal = document.getElementById('added-modal');

  sizeSelect.addEventListener('change', () => {
    sizeError.classList.add('hidden');
  });

  btnAddCart.addEventListener('click', () => {
    if (!product) return;
    const selectedSize = sizeSelect.value;
    
    if (!selectedSize) {
      sizeError.textContent = 'Selecciona una talla';
      sizeError.classList.remove('hidden');
      return;
    }

    const token = getToken();
    if (!token) {
      loginModal.classList.remove('hidden');
      return;
    }

    // Add to cart
    let draft = JSON.parse(sessionStorage.getItem('checkoutDraft') || '[]');
    
    // check if it already exists
    const existingIndex = draft.findIndex(item => item.productoId === product.idProducto && item.talla === selectedSize);
    if (existingIndex >= 0) {
      draft[existingIndex].cantidad += 1;
    } else {
      draft.push({
        productoId: product.idProducto,
        nombre: product.nombre,
        talla: selectedSize,
        tallasDisponibles: availableSizes.map((size) => size.nombre),
        cantidad: 1,
        precioUnitario: product.precio,
      });
    }

    sessionStorage.setItem('checkoutDraft', JSON.stringify(draft));
    
    document.getElementById('added-product-name').textContent = `${product.nombre} (Talla ${selectedSize})`;
    addedModal.classList.remove('hidden');
  });

  document.getElementById('btn-close-login-modal').addEventListener('click', () => {
    loginModal.classList.add('hidden');
  });

  document.getElementById('btn-close-added-modal').addEventListener('click', () => {
    addedModal.classList.add('hidden');
  });
});
