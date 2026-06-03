document.addEventListener('DOMContentLoaded', () => {
  const emptyState = document.getElementById('empty-state');
  const cartContent = document.getElementById('cart-content');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartItemsCount = document.getElementById('cart-items-count');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTotalEl = document.getElementById('cart-total');
  const clearCartBtn = document.getElementById('clear-cart-btn');

  function getCartItems() {
    try {
      const draft = JSON.parse(sessionStorage.getItem('checkoutDraft') || '[]');
      return Array.isArray(draft) ? draft : [];
    } catch {
      return [];
    }
  }

  function saveCartItems(items) {
    sessionStorage.setItem('checkoutDraft', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-changed'));
  }

  const productSizesCache = {};

  async function fetchProductSizes(productId) {
    if (productSizesCache[productId]) return productSizesCache[productId];
    try {
      const response = await fetch(`/api/catalogo/${productId}/tallas`);
      if (!response.ok) throw new Error('Error fetch');
      const sizes = await response.json();
      const formattedSizes = sizes.map(s => s.talla || s.nombre).filter(Boolean);
      productSizesCache[productId] = formattedSizes;
      return formattedSizes;
    } catch {
      productSizesCache[productId] = [];
      return [];
    }
  }

  async function renderCart() {
    const items = getCartItems();

    if (items.length === 0) {
      emptyState.classList.remove('hidden');
      cartContent.classList.add('hidden');
      return;
    } else {
      emptyState.classList.add('hidden');
      cartContent.classList.remove('hidden');
    }

    let totalItems = 0;
    let totalPrice = 0;

    cartItemsContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Cargando productos...</td></tr>';

    let needsSave = false;
    const itemRowsHtml = await Promise.all(items.map(async (item, index) => {
      const quantity = Number(item.cantidad || 1);
      const price = Number(item.precioUnitario || 0);
      
      totalItems += quantity;
      totalPrice += price * quantity;

      const defaultImages = {
        1: '/img/productos/camiseta_nike.jpg',
        2: '/img/productos/zapatillas_adidas.jpg',
        3: '/img/productos/mochila_puma.jpg',
        4: '/img/productos/pesas_10kg.jpg',
        5: '/img/productos/proteina_whey.jpg'
      };
      
      const imageUrl = item.imagenPrincipal || item.imagen || defaultImages[item.productoId] || '/img/sportshop.jpg';

      const sizes = await fetchProductSizes(item.productoId);
      const hasNoSizes = sizes.length === 0 || sizes.includes('Sin tallas');
      
      let sizeSelectorHtml = '-';
      if (!hasNoSizes) {
        if (!item.talla) {
          item.talla = sizes[0]; 
          needsSave = true;
        }
        sizeSelectorHtml = `
          <select class="cart-size-select form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" data-index="${index}">
            ${sizes.map(s => `<option value="${s}" ${s === item.talla ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        `;
      } else {
        if (item.talla !== 'Sin tallas') {
          item.talla = 'Sin tallas';
          needsSave = true;
        }
      }

      return `
        <tr>
          <td class="col-product">
            <div class="product-info-cell">
              <button type="button" class="remove-item-btn" aria-label="Eliminar producto" data-index="${index}">
                &times;
              </button>
              <div class="product-image-box">
                ${imageUrl ? `<img src="${imageUrl}" alt="${item.nombre}" />` : `<div class="placeholder-img"></div>`}
              </div>
              <div class="product-details">
                <h3>${item.nombre || 'Producto'}</h3>
              </div>
            </div>
          </td>
          <td class="col-size">
            ${sizeSelectorHtml}
          </td>
          <td class="col-price">
            ${price.toFixed(2)} EUR
          </td>
          <td class="col-quantity">
            <div class="qty-control">
              <button type="button" class="decrease-qty-btn" data-index="${index}">-</button>
              <span class="qty-value">${quantity}</span>
              <button type="button" class="increase-qty-btn" data-index="${index}">+</button>
            </div>
          </td>
          <td class="col-subtotal font-bold">
            ${(price * quantity).toFixed(2)} EUR
          </td>
        </tr>
      `;
    }));

    if (needsSave) {
      sessionStorage.setItem('checkoutDraft', JSON.stringify(items));
    }

    cartItemsContainer.innerHTML = itemRowsHtml.join('');

    if (cartItemsCount) {
      cartItemsCount.textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} en tu carrito.`;
    }

    if (cartSubtotalEl) {
      cartSubtotalEl.textContent = `${totalPrice.toFixed(2)} EUR`;
    }

    if (cartTotalEl) {
      cartTotalEl.textContent = `${totalPrice.toFixed(2)} EUR`;
    }

    attachEventListeners();
  }

  function attachEventListeners() {
    const decreaseBtns = document.querySelectorAll('.decrease-qty-btn');
    const increaseBtns = document.querySelectorAll('.increase-qty-btn');
    const removeBtns = document.querySelectorAll('.remove-item-btn');

    decreaseBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index, 10);
        const items = getCartItems();
        if (items[index] && items[index].cantidad > 1) {
          items[index].cantidad -= 1;
          saveCartItems(items);
          renderCart();
        }
      });
    });

    increaseBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index, 10);
        const items = getCartItems();
        if (items[index]) {
          items[index].cantidad += 1;
          saveCartItems(items);
          renderCart();
        }
      });
    });

    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index, 10);
        const items = getCartItems();
        items.splice(index, 1);
        saveCartItems(items);
        renderCart();
      });
    });

    const sizeSelects = document.querySelectorAll('.cart-size-select');
    sizeSelects.forEach(select => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.currentTarget.dataset.index, 10);
        const items = getCartItems();
        if (items[index]) {
          items[index].talla = e.currentTarget.value;
          saveCartItems(items);
        }
      });
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
        saveCartItems([]);
        renderCart();
      }
    });
  }

  // Escuchar a cambios de otros lados (como el navbar)
  window.addEventListener('cart-changed', renderCart);

  // Inicializar carrito
  renderCart();
});
