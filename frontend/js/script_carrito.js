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

  function renderCart() {
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

    cartItemsContainer.innerHTML = '';

    items.forEach((item, index) => {
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

      const itemHtml = `
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
                ${item.talla ? `<p>Talla: ${item.talla}</p>` : ''}
              </div>
            </div>
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
      cartItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    });

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
