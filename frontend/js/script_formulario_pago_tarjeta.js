const content = document.querySelector('#page-content');

if (content) {
  content.innerHTML = `
    <form id="card-payment-form" class="space-y-4">
      <div id="card-error" class="hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></div>
      <label class="block text-sm font-medium text-slate-700">
        Número de tarjeta
        <input id="card-number" type="text" inputmode="numeric" maxlength="19" required placeholder="4242 4242 4242 4242" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block text-sm font-medium text-slate-700">
          Caducidad
          <input id="card-expiry" type="text" maxlength="5" required placeholder="MM/AA" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label class="block text-sm font-medium text-slate-700">
          CVC
          <input id="card-cvc" type="text" inputmode="numeric" maxlength="4" required placeholder="123" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
      </div>
      <label class="block text-sm font-medium text-slate-700">
        Titular
        <input id="card-holder" type="text" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>
      <button id="card-submit" type="submit" class="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800">
        Confirmar pago con tarjeta
      </button>
    </form>
  `;
}

document.getElementById('card-payment-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const token = typeof getToken === 'function' ? getToken() : sessionStorage.getItem('token');
  const error = document.getElementById('card-error');
  const submit = document.getElementById('card-submit');
  const idPedido = new URLSearchParams(window.location.search).get('idPedido') || JSON.parse(sessionStorage.getItem('lastOrder') || '{}').idPedido;

  if (!token) {
    window.location.href = 'iniciar_sesion.html?from=formulario_pago_tarjeta.html';
    return;
  }
  if (!idPedido) {
    error.textContent = 'No se ha encontrado el pedido para pagar.';
    error.classList.remove('hidden');
    return;
  }

  submit.disabled = true;
  submit.textContent = 'Confirmando pago...';
  error.classList.add('hidden');

  try {
    const paymentResponse = await fetch('/api/pagos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idPedido: Number(idPedido),
        successUrl: `${window.location.origin}/confirmacion_pedido.html`,
        cancelUrl: `${window.location.origin}/formulario_pago_tarjeta.html?idPedido=${idPedido}`,
      }),
    });

    const payment = await paymentResponse.json().catch(() => ({}));
    if (!paymentResponse.ok) throw new Error(payment.message || 'No se pudo iniciar el pago');

    const confirmResponse = await fetch(`/api/pagos/${payment.idPago}/confirmar-tarjeta`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId: `card-${Date.now()}` }),
    });
    if (!confirmResponse.ok) throw new Error('No se pudo confirmar el pago con tarjeta');

    sessionStorage.removeItem('checkoutDraft');
    window.dispatchEvent(new Event('cart-changed'));
    window.location.href = `confirmacion_pedido.html?idPedido=${idPedido}`;
  } catch (err) {
    error.textContent = err.message || 'Error al pagar con tarjeta';
    error.classList.remove('hidden');
    submit.disabled = false;
    submit.textContent = 'Confirmar pago con tarjeta';
  }
});
