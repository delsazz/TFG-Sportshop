const PAYMENT_OPTIONS = [
  { value: 'bizum', label: 'Pago con Bizum' },
  { value: 'tarjeta', label: 'Tarjeta de crédito' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'transferencia bancaria', label: 'Transferencia anticipada', extra: 'El envío se efectuará tras recibir la transferencia bancaria.' }
];

document.addEventListener('DOMContentLoaded', async () => {
  const token = getAuthValue('token');
  if (!token) {
    window.location.href = 'iniciar_sesion.html?from=finalizar_compra.html';
    return;
  }

  const emptyState = document.getElementById('empty-state');
  const checkoutContent = document.getElementById('checkout-content');
  const paymentOptionsContainer = document.getElementById('payment-options');
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

  // Calculate total
  const total = orderItems.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  submitBtn.textContent = `Confirmar pedido de ${total.toFixed(2)} EUR`;

  // Render payment methods
  function renderPaymentMethods() {
    paymentOptionsContainer.innerHTML = '';
    
    const icons = {
      'bizum': `<span class="bizum-logo-text">% bizum</span>`,
      'tarjeta': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" width="48" height="32" fill="none"><rect width="48" height="32" rx="4" fill="#eee"/><text x="24" y="20" font-family="Arial" font-size="10" font-weight="bold" fill="#666" text-anchor="middle">VISA / MC</text></svg>`,
      'paypal': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#666"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg><span style="margin-left: 4px; font-weight: bold; color: #666; font-size: 1.1rem; letter-spacing: -0.5px;">PayPal</span>`,
      'transferencia bancaria': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>`
    };

    PAYMENT_OPTIONS.forEach(option => {
      const isOptionDisabled = option.value === 'tarjeta' && !configuracion_pago.tarjetaHabilitada;
      const isChecked = selectedMethod === option.value;

      const label = document.createElement('label');
      label.className = `payment-option ${isChecked ? 'active' : ''} ${isOptionDisabled ? 'disabled' : ''}`;

      label.innerHTML = `
        <div class="payment-option-left">
          <input type="radio" name="payment-method" value="${option.value}" ${isChecked ? 'checked' : ''} ${isOptionDisabled ? 'disabled' : ''} />
          <div class="payment-option-text">
            <p class="payment-option-title">${option.label}</p>
            ${isOptionDisabled ? '<p class="payment-option-extra">No disponible temporalmente.</p>' : ''}
            ${option.extra ? `<p class="payment-option-desc">${option.extra}</p>` : ''}
            ${option.value === 'bizum' ? `<p class="payment-option-extra">Teléfono: ${configuracion_pago.bizumTelefono}</p>` : ''}
            ${option.value === 'transferencia bancaria' ? `<p class="payment-option-extra">IBAN: ${configuracion_pago.transferenciaIban}</p>` : ''}
          </div>
        </div>
        <div class="payment-option-right">
          ${icons[option.value] || ''}
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

  renderPaymentMethods();

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


