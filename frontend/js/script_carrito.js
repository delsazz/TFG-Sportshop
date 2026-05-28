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

      const imageUrl = item.imagenPrincipal || item.imagen || ''; // Intentar coger imagen si existe

      const itemHtml = `
        <div class="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 py-4 border-b border-slate-200 items-center min-w-[700px]">
          <div class="flex items-center gap-4">
            <button type="button" class="text-slate-400 hover:text-red-500 transition remove-item-btn p-1" aria-label="Eliminar producto" data-index="${index}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
            </button>
            <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center">
              ${imageUrl ? `<img src="${imageUrl}" alt="${item.nombre}" class="h-full w-full object-cover object-center" />` : `<svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`}
            </div>
            <div>
              <h3 class="font-bold text-slate-900">${item.nombre || 'Producto'}</h3>
              <p class="text-sm text-slate-500">Talla: ${item.talla || 'Única'}</p>
            </div>
          </div>
          
          <div class="text-center font-semibold text-slate-900">
            ${price.toFixed(2)} EUR
          </div>

          <div class="flex justify-center">
            <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden w-24">
              <button type="button" class="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition decrease-qty-btn w-1/3" data-index="${index}">-</button>
              <span class="py-1 text-slate-900 font-semibold text-center w-1/3">${quantity}</span>
              <button type="button" class="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition increase-qty-btn w-1/3" data-index="${index}">+</button>
            </div>
          </div>
          
          <div class="text-right font-bold text-slate-900">
            ${(price * quantity).toFixed(2)} EUR
          </div>
        </div>
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
