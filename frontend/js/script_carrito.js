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

      const itemHtml = `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0 last:pb-0">
          <div class="flex-1">
            <h3 class="font-bold text-slate-900 text-lg">${item.nombre || 'Producto'}</h3>
            <p class="text-sm text-slate-500 mt-1">Talla: <span class="font-medium text-slate-700">${item.talla || 'Única'}</span></p>
            <p class="text-sm text-slate-500">Precio unidad: <span class="font-medium text-slate-700">${price.toFixed(2)} EUR</span></p>
          </div>
          
          <div class="flex items-center gap-6 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
            <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden">
              <button type="button" class="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition decrease-qty-btn" data-index="${index}">-</button>
              <span class="px-4 py-2 text-slate-900 font-semibold min-w-[3rem] text-center">${quantity}</span>
              <button type="button" class="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition increase-qty-btn" data-index="${index}">+</button>
            </div>
            
            <div class="text-right min-w-[5rem]">
              <p class="font-bold text-slate-900">${(price * quantity).toFixed(2)} EUR</p>
            </div>
            
            <button type="button" class="text-red-500 hover:text-red-700 transition remove-item-btn p-2" aria-label="Eliminar producto" data-index="${index}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
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
