document.addEventListener('DOMContentLoaded', () => {
  const token = getAuthValue('token');
  if (!token) {
    window.location.href = 'iniciar_sesion.html?from=finalizar_compra.html';
    return;
  }

  const emptyState = document.getElementById('empty-state');
  const checkoutContent = document.getElementById('checkout-content');
  const paymentOptionsContainer = document.getElementById('payment-options');
  const checkoutForm = document.getElementById('checkout-form');
  const submitBtn = document.getElementById('submit-btn');
  const errorMessage = document.getElementById('error-message');
  const orderItems = JSON.parse(sessionStorage.getItem('checkoutDraft') || '[]');

  if (!orderItems.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  checkoutContent.classList.remove('hidden');
  const total = orderItems.reduce((acc, item) => acc + Number(item.precioUnitario || item.precio || 0) * Number(item.cantidad || 1), 0);
  submitBtn.textContent = `Pagar con tarjeta ${total.toFixed(2)} EUR`;
  paymentOptionsContainer.innerHTML = `
    <label class="payment-option active">
      <div class="payment-option-left">
        <input type="radio" name="payment-method" value="tarjeta" checked />
        <div class="payment-option-text">
          <p class="payment-option-title">Tarjeta de crédito</p>
          <p class="payment-option-desc">La tienda solo acepta pago con tarjeta.</p>
        </div>
      </div>
    </label>
  `;

  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando pedido...';

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metodoPago: 'tarjeta',
          items: orderItems.map((item) => ({
            idProducto: item.productoId,
            talla: item.talla,
            cantidad: item.cantidad,
          })),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || payload.message || 'No se pudo crear el pedido');
      }

      sessionStorage.setItem('lastOrder', JSON.stringify({ ...payload, paymentMethod: 'tarjeta', total }));
      window.location.href = `formulario_pago_tarjeta.html?idPedido=${payload.idPedido || ''}`;
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = `Pagar con tarjeta ${total.toFixed(2)} EUR`;
    }
  });
});
