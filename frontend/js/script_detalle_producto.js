const productImagesById = {
  1: ['/img/productos/camiseta_nike.jpg'],
  2: ['/img/productos/zapatillas_adidas.jpg'],
  3: ['/img/productos/mochila_puma.jpg'],
  4: ['/img/productos/pesas_10kg.jpg'],
  5: ['/img/productos/proteina_whey.jpg'],
};

const fallbackProductsById = {
  1: {
    idProducto: 1,
    nombre: 'Camiseta Nike Dri-FIT',
    tipoPrenda: 'Ropa deportiva',
    descripcion: 'Camiseta transpirable para entrenamiento diario.',
    color: 'Negro',
    precio: 24.99,
    stock: 40,
    imagen: '/img/productos/camiseta_nike.jpg',
    categoria: { nombreCategoria: 'Ropa deportiva', slug: 'ropa-deportiva' },
  },
  2: {
    idProducto: 2,
    nombre: 'Zapatillas Adidas Run',
    tipoPrenda: 'Calzado',
    descripcion: 'Zapatillas ligeras para running y gimnasio.',
    color: 'Blanco',
    precio: 69.99,
    stock: 25,
    imagen: '/img/productos/zapatillas_adidas.jpg',
    categoria: { nombreCategoria: 'Calzado', slug: 'calzado' },
  },
  3: {
    idProducto: 3,
    nombre: 'Mochila Puma Training',
    tipoPrenda: 'Accesorios',
    descripcion: 'Mochila deportiva con compartimentos amplios.',
    color: 'Azul',
    precio: 34.99,
    stock: 18,
    imagen: '/img/productos/mochila_puma.jpg',
    categoria: { nombreCategoria: 'Accesorios', slug: 'accesorios' },
  },
  4: {
    idProducto: 4,
    nombre: 'Set de pesas 10 kg',
    tipoPrenda: 'Equipamiento',
    descripcion: 'Kit de mancuernas para fuerza y tonificación.',
    color: 'Negro',
    precio: 44.99,
    stock: 12,
    imagen: '/img/productos/pesas_10kg.jpg',
    categoria: { nombreCategoria: 'Equipamiento', slug: 'equipamiento' },
  },
  5: {
    idProducto: 5,
    nombre: 'Proteína Whey Sport',
    tipoPrenda: 'Suplementos',
    descripcion: 'Suplemento proteico para recuperación muscular.',
    color: 'Vainilla',
    precio: 29.99,
    stock: 30,
    imagen: '/img/productos/proteina_whey.jpg',
    categoria: { nombreCategoria: 'Suplementos', slug: 'suplementos' },
  },
};

function isSportShopProduct(product) {
  const text = [
    product?.nombre,
    product?.descripcion,
    product?.tipoPrenda,
    product?.categoria?.nombreCategoria,
    product?.categoria?.categoria,
  ].join(' ').toLowerCase();

  return !/(proteccion|protección|emergencia|sanidad|laboratorio|uniforme|campus|dotes)/i.test(text);
}

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
  const pagesBase = window.location.pathname.includes('/src/pages/') ? '/src/pages/' : '/';
  const pageHref = (file) => `${pagesBase}${file}`;
  
  const urlParams = new URLSearchParams(window.location.search);
  const productIdStr = urlParams.get('id');
  const productId = parseInt(productIdStr, 10);

  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const productContainer = document.getElementById('product-container');
  const sizeSelect = document.getElementById('product-size');

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
    if (!isSportShopProduct(product) && fallbackProductsById[productId]) {
      product = fallbackProductsById[productId];
    }

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

    document.getElementById('back-link').href = product.categoria?.slug ? `${pageHref('catalogo.html')}?slug=${product.categoria.slug}` : pageHref('catalogo.html');
    
    document.getElementById('product-category').textContent = product.categoria?.nombreCategoria || '-';
    document.getElementById('product-title').textContent = product.nombre || '-';
    document.getElementById('product-type').textContent = product.tipoPrenda || '-';
    document.getElementById('product-price').textContent = `${(product.precio || 0).toFixed(2)} EUR`;
    document.getElementById('product-stock').textContent = `Stock ${product.stock || 0}`;

    const fallbackDescription = `${product.tipoPrenda || 'Producto'} en color ${product.color || 'no indicado'}. Artículo de ${product.categoria?.nombreCategoria || 'catálogo'} preparado para entrenamiento, competición y uso diario.`;
    document.getElementById('product-description').textContent = product.descripcion || fallbackDescription;
    
    document.getElementById('product-color').textContent = product.color || 'No indicado';
    document.getElementById('product-composition').textContent = product.composicion || 'No indicada';
    document.getElementById('product-norm').textContent = product.normativa || 'No indicada';
    document.getElementById('product-wash').textContent = product.instruccionesLavado || 'No indicado';

    // Sizes
    availableSizes = sizes.length > 0 ? sizes : getFallbackSizes(product);
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
    if (fallbackProductsById[productId]) {
      product = fallbackProductsById[productId];
      loadingContainer.classList.add('hidden');
      productContainer.classList.remove('hidden');

      document.getElementById('back-link').href = product.categoria?.slug ? `${pageHref('catalogo.html')}?slug=${product.categoria.slug}` : pageHref('catalogo.html');
      document.getElementById('product-category').textContent = product.categoria?.nombreCategoria || '-';
      document.getElementById('product-title').textContent = product.nombre || '-';
      document.getElementById('product-type').textContent = product.tipoPrenda || '-';
      document.getElementById('product-price').textContent = `${(product.precio || 0).toFixed(2)} EUR`;
      document.getElementById('product-stock').textContent = `Stock ${product.stock || 0}`;
      document.getElementById('product-description').textContent = product.descripcion || '-';
      document.getElementById('product-color').textContent = product.color || 'No indicado';
      document.getElementById('product-composition').textContent = 'No indicada';
      document.getElementById('product-norm').textContent = 'No indicada';
      document.getElementById('product-wash').textContent = 'No indicado';

      availableSizes = getFallbackSizes(product);
      availableSizes.forEach(size => {
        const opt = document.createElement('option');
        opt.value = size.nombre;
        opt.textContent = `${size.nombre} (Stock: ${size.stock})`;
        sizeSelect.appendChild(opt);
      });

      const mainImgEl = document.getElementById('main-product-image');
      const placeholderEl = document.getElementById('main-product-placeholder');
      placeholderEl.classList.add('hidden');
      mainImgEl.classList.remove('hidden');
      mainImgEl.src = product.imagen;
      mainImgEl.alt = product.nombre;
    } else {
      loadingContainer.classList.add('hidden');
      errorContainer.classList.remove('hidden');
      errorContainer.textContent = `Error: ${err.message}`;
    }
  }

  // Cart logic
  const btnAddCart = document.getElementById('btn-add-cart');
  const sizeError = document.getElementById('size-error');
  const addedModal = document.getElementById('added-modal');

  function openAccountMenu() {
    const accountButton = document.querySelector('[data-account-toggle]');
    const accountPanel = document.querySelector('[data-account-panel]');
    const cartPanel = document.querySelector('[data-cart-panel]');

    if (accountButton && accountPanel) {
      if (cartPanel) cartPanel.hidden = true;
      accountPanel.hidden = false;
      accountButton.focus();
      return;
    }

    window.location.href = pageHref('iniciar_sesion.html');
  }

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
      openAccountMenu();
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
    window.dispatchEvent(new Event('cart-changed'));
    
    document.getElementById('added-product-name').textContent = `${product.nombre} (Talla ${selectedSize})`;
    addedModal.classList.remove('hidden');
  });

  document.getElementById('btn-close-added-modal').addEventListener('click', () => {
    addedModal.classList.add('hidden');
  });
});
