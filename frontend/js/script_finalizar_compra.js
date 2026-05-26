const PAYMENT_OPTIONS = [
  { value: 'tarjeta', label: 'Tarjeta', description: 'Paga ahora con tarjeta de forma segura.' },
  { value: 'bizum', label: 'Bizum', description: 'Te llevaremos a una pantalla con el telefono de contacto para hacer el Bizum.' },
  { value: 'transferencia bancaria', label: 'Transferencia bancaria', description: 'Veras el numero de cuenta y el concepto que debes indicar.' },
  { value: 'pago en mostrador', label: 'En el mostrador', description: 'Reservamos tu pedido para pagarlo y recogerlo presencialmente.' },
];

document.addEventListener('DOMContentLoaded', async () => {
  const token = getAuthValue('token');
  if (!token) {
    window.location.href = 'iniciar_sesion.html?from=finalizar_compra.html';
    return;
  }

  const emptyState = document.getElementById('empty-state');
  const checkoutContent = document.getElementById('checkout-content');
  const orderItemsContainer = document.getElementById('order-items');
  const orderItemsCount = document.getElementById('order-items-count');
  const orderTotalEl = document.getElementById('order-total');
  const orderTotalBottomEl = document.getElementById('order-total-bottom');
  const paymentOptionsContainer = document.getElementById('payment-options');
  const checkoutForm = document.getElementById('checkout-form');
  const submitBtn = document.getElementById('submit-btn');
  const errorMessage = document.getElementById('error-message');

  let orderItems = JSON.parse(sessionStorage.getItem('checkoutDraft') || '[]');
  let selectedMethod = 'bizum';
  let configuracion_pago = { tarjetaHabilitada: true, transferenciaIban: 'ES00...', bizumTelefono: '+34...' };

  try {
    const configRes = await fetch('/api/config/payment');
    if (configRes.ok) {
      configuracion_pago = await configRes.json();
    }
  } catch (e) {
    console.warn('Usando config de pago por defecto');
  }

  if (orderItems.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    checkoutContent.classList.remove('hidden');
  }

  // Calculate total and product count
  const total = orderItems.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  const totalCount = orderItems.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);
  orderTotalEl.textContent = `${total.toFixed(2)} EUR`;
  if (orderTotalBottomEl) {
    orderTotalBottomEl.textContent = `${total.toFixed(2)} EUR`;
  }
  if (orderItemsCount) {
    orderItemsCount.textContent = `${totalCount} ${totalCount === 1 ? 'producto' : 'productos'} en el carrito.`;
  }
  submitBtn.textContent = `Confirmar pedido de ${total.toFixed(2)} EUR`;

  // Render items
  orderItems.forEach(item => {
    const html = `
      <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-semibold">${item.nombre}</p>
            <p class="mt-1 text-sm text-slate-300">Talla ${item.talla}</p>
          </div>
          <div class="text-right">
            <p class="font-semibold">x${item.cantidad}</p>
            <p class="mt-1 text-sm text-slate-300">${parseFloat(item.precioUnitario).toFixed(2)} EUR</p>
          </div>
        </div>
      </div>
    `;
    orderItemsContainer.insertAdjacentHTML('beforeend', html);
  });

  // Render payment methods
  function renderPaymentMethods() {
    paymentOptionsContainer.innerHTML = '';
    PAYMENT_OPTIONS.forEach(option => {
      const isOptionDisabled = option.value === 'tarjeta' && !configuracion_pago.tarjetaHabilitada;
      const isChecked = selectedMethod === option.value;

      let classes = isOptionDisabled
        ? 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-60'
        : (isChecked
          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
          : 'border-slate-200 bg-slate-50 hover:border-slate-300');

      const label = document.createElement('label');
      label.className = `block rounded-3xl border p-5 transition ${classes}`;

      label.innerHTML = `
        <div class="flex items-start gap-4">
          <input type="radio" name="payment-method" value="${option.value}" ${isChecked ? 'checked' : ''} ${isOptionDisabled ? 'disabled' : ''} class="mt-1 h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-500" />
          <div>
            <p class="font-semibold text-slate-900">${option.label}</p>
            <p class="mt-1 text-sm text-slate-600">${option.description}</p>
            ${isOptionDisabled ? '<p class="mt-2 text-sm font-semibold text-slate-700">No disponible temporalmente.</p>' : ''}
            ${option.value === 'transferencia bancaria' ? `<p class="mt-2 text-sm font-semibold text-slate-800">IBAN: ${configuracion_pago.transferenciaIban}</p>` : ''}
            ${option.value === 'bizum' ? `<p class="mt-2 text-sm font-semibold text-slate-800">Telefono: ${configuracion_pago.bizumTelefono}</p>` : ''}
          </div>
        </div>
      `;

      label.querySelector('input').addEventListener('change', (e) => {
        if (!isOptionDisabled) {
          selectedMethod = e.target.value;
          renderPaymentMethods();
        }
      });

      paymentOptionsContainer.appendChild(label);
    });
  }

  renderPaymentMethods();

  document.getElementById('clear-cart').addEventListener('click', () => {
    sessionStorage.removeItem('checkoutDraft');
    window.location.reload();
  });

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando pedido...';

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metodoPago: selectedMethod,
          items: orderItems.map(item => ({
            idProducto: item.productoId,
            talla: item.talla,
            cantidad: item.cantidad
          }))
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        errorMessage.textContent = payload.error || payload.message || 'Error al procesar el pedido';
        errorMessage.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = `Confirmar pedido de ${total.toFixed(2)} EUR`;
        return;
      }
      sessionStorage.removeItem('checkoutDraft');
      sessionStorage.setItem('lastOrder', JSON.stringify({
        ...payload,
        paymentMethod: selectedMethod,
        total
      }));
      if (selectedMethod === 'tarjeta' && payload.idPedido) {
        alert('Redirigiendo a pasarela de tarjeta...');
      } else {
        alert('Pedido realizado con éxito.');
        window.location.href = 'inicio.html';
      }
    } catch (err) {
      errorMessage.textContent = err.message || 'Error de red';
      errorMessage.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = `Confirmar pedido de ${total.toFixed(2)} EUR`;
    }
  });
});


