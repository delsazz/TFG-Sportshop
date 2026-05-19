document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();

  const urlParams = new URLSearchParams(window.location.search);
  const orderIdStr = urlParams.get('id');
  const orderId = parseInt(orderIdStr, 10);

  const loadingContainer = document.getElementById('loading-container');
  const errorContainer = document.getElementById('error-container');
  const contentContainer = document.getElementById('content-container');
  
  if (!orderId || isNaN(orderId)) {
    showError('Pedido no válido');
    return;
  }

  async function fetchPedidoDetalle() {
    try {
      const token = getToken();
      if (!token) {
        window.location.href = '/iniciar_sesion.html';
        return;
      }

      const res = await fetch(`/api/pedidos/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        renderPedido(data);
      } else {
        showError('Pedido no encontrado o no tienes permiso.');
      }
    } catch (err) {
      showError('Error de conexión');
    }
  }

  function renderPedido(pedido) {
    loadingContainer.classList.add('hidden');
    contentContainer.classList.remove('hidden');

    document.getElementById('order-title').textContent = `Pedido #${pedido.idPedido}`;
    document.getElementById('order-date').textContent = `Realizado el ${new Date(pedido.fecha).toLocaleDateString('es-ES')}`;
    document.getElementById('order-status').textContent = pedido.estado || 'Desconocido';
    document.getElementById('order-total').textContent = `${(pedido.total || 0).toFixed(2)} €`;

    const itemsContainer = document.getElementById('order-items');
    itemsContainer.innerHTML = '';

    if (pedido.detalles && pedido.detalles.length > 0) {
      pedido.detalles.forEach(item => {
        const div = document.createElement('div');
        div.className = 'py-5 flex flex-col gap-3 sm:flex-row sm:justify-between';
        
        const subtotal = item.cantidad * item.precioUnitario;
        
        div.innerHTML = `
          <div>
            <p class="font-medium text-slate-900">${item.nombreProducto}</p>
            <p class="text-sm text-slate-500">Talla: ${item.talla}</p>
          </div>
          <div class="sm:text-right text-slate-700">
            <p>${item.cantidad} uds × ${item.precioUnitario.toFixed(2)} €</p>
            <p class="font-medium mt-1 text-slate-900">
              ${subtotal.toFixed(2)} €
            </p>
          </div>
        `;
        itemsContainer.appendChild(div);
      });
    } else {
      itemsContainer.innerHTML = '<p class="py-5 text-slate-500">No hay productos en este pedido.</p>';
    }
    renderDeliverySection(pedido);
  }

  function renderDeliverySection(pedido) {
    document.getElementById('delivery-section')?.remove();
    const section = document.createElement('section');
    section.id = 'delivery-section';
    section.className = 'mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm';
    const entregas = pedido.entregas || [];
    const ultima = entregas[0];
    const entregado = String(pedido.estado || '').toLowerCase().includes('entregado');
    section.innerHTML = `
      <h2 class="text-xl font-semibold mb-4">Entrega</h2>
      ${ultima ? `
        <div class="grid gap-3 text-sm sm:grid-cols-2">
          <p><strong>Persona que recibe:</strong> ${ultima.nombreRecibe || '-'}</p>
          <p><strong>DNI/NIE o referencia:</strong> ${ultima.documentoRecibe || '-'}</p>
          <p><strong>Tipo:</strong> ${ultima.tipoReceptor === 'otra_persona' ? 'Otra persona' : 'Titular del pedido'}</p>
          <p><strong>Fecha:</strong> ${new Date(ultima.fechaEntrega).toLocaleDateString('es-ES')}</p>
          ${ultima.textoAutorizacion ? `<p class="sm:col-span-2"><strong>Autorización:</strong> ${ultima.textoAutorizacion}</p>` : ''}
        </div>
        ${ultima.firmaRecepcion ? `<img src="${ultima.firmaRecepcion}" alt="Firma de entrega" class="mt-4 max-h-48 rounded-2xl border border-slate-200 bg-white p-3">` : ''}
      ` : `
        <p class="text-slate-600">Este pedido aún no tiene firma de entrega registrada.</p>
      `}
      ${!entregado ? `<button id="btn-open-signature" class="mt-5 rounded-full bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Firmar entrega</button>` : ''}
    `;
    contentContainer.appendChild(section);
    document.getElementById('btn-open-signature')?.addEventListener('click', () => openSignatureModal(pedido));
  }

  function openSignatureModal(pedido) {
    const fullName = `${pedido.usuario?.nombre || ''} ${pedido.usuario?.apellidos || ''}`.trim();
    const modal = document.createElement('div');
    modal.id = 'signature-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
    modal.innerHTML = `
      <div class="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-2xl font-bold">Firmar entrega</h2>
          <button id="close-signature-modal" class="rounded-full border px-3 py-1">Cerrar</button>
        </div>
        <form id="signature-form" class="mt-5 space-y-4">
          <div class="flex flex-wrap gap-4">
            <label class="flex items-center gap-2"><input type="radio" name="tipoReceptor" value="yo" checked> Firmar yo</label>
            <label class="flex items-center gap-2"><input type="radio" name="tipoReceptor" value="otra_persona"> Otra persona</label>
          </div>
          <div id="receiver-fields" class="grid gap-4 sm:grid-cols-2">
            <input name="nombreRecibe" placeholder="Nombre y apellidos de quien recibe" class="rounded-xl border px-3 py-2" required>
            <input name="documentoRecibe" placeholder="DNI/NIE o referencia" class="rounded-xl border px-3 py-2" required>
          </div>
          <div id="authorization-fields" class="hidden rounded-2xl bg-slate-50 p-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <input name="autorizanteNombre" placeholder="Tu nombre y apellidos" value="${fullName}" class="rounded-xl border px-3 py-2">
              <input name="autorizanteDocumento" placeholder="Tu DNI/NIE" class="rounded-xl border px-3 py-2">
            </div>
            <label class="mt-4 flex gap-3 text-sm">
              <input id="authorization-check" type="checkbox" class="mt-1">
              <span id="authorization-text">Yo, ${fullName || '[nombre apellidos]'}, con DNI [DNI], autorizo que [nombre_apellidos_persona] con DNI [DNI_persona] recoja este pedido y firme la entrega por mí.</span>
            </label>
          </div>
          <div>
            <p class="mb-2 text-sm font-semibold text-slate-700">Firma</p>
            <canvas id="signature-canvas" width="620" height="220" class="h-56 w-full rounded-2xl border border-slate-300 bg-white"></canvas>
            <button id="clear-signature" type="button" class="mt-2 rounded-xl border px-3 py-2 text-sm">Borrar firma</button>
          </div>
          <p id="signature-error" class="hidden rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"></p>
          <button type="submit" class="w-full rounded-2xl bg-blue-700 px-5 py-3 font-semibold text-white">Enviar firma</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    setupSignatureForm(pedido);
  }

  function setupSignatureForm(pedido) {
    const modal = document.getElementById('signature-modal');
    const form = document.getElementById('signature-form');
    const authorizationFields = document.getElementById('authorization-fields');
    const authorizationText = document.getElementById('authorization-text');
    const canvas = document.getElementById('signature-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let hasSignature = false;

    document.getElementById('close-signature-modal').onclick = () => modal.remove();
    form.tipoReceptor.forEach(radio => radio.addEventListener('change', () => {
      authorizationFields.classList.toggle('hidden', form.tipoReceptor.value !== 'otra_persona');
      updateAuthorizationText();
    }));
    ['nombreRecibe', 'documentoRecibe', 'autorizanteNombre', 'autorizanteDocumento'].forEach(name => {
      form.elements[name]?.addEventListener('input', updateAuthorizationText);
    });
    function updateAuthorizationText() {
      const receptor = form.nombreRecibe.value || '[nombre_apellidos_persona]';
      const receptorDni = form.documentoRecibe.value || '[DNI_persona]';
      const autorizante = form.autorizanteNombre.value || '[nombre apellidos]';
      const autorizanteDni = form.autorizanteDocumento.value || '[DNI]';
      authorizationText.textContent = `Yo, ${autorizante}, con DNI ${autorizanteDni}, autorizo que ${receptor} con DNI ${receptorDni} recoja este pedido y firme la entrega por mí.`;
    }
    function position(event) {
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches?.[0];
      return {
        x: ((touch?.clientX ?? event.clientX) - rect.left) * (canvas.width / rect.width),
        y: ((touch?.clientY ?? event.clientY) - rect.top) * (canvas.height / rect.height)
      };
    }
    function start(event) {
      event.preventDefault();
      drawing = true;
      const p = position(event);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
    function draw(event) {
      if(!drawing) return;
      event.preventDefault();
      const p = position(event);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      hasSignature = true;
    }
    function stop() { drawing = false; }
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stop);
    document.getElementById('clear-signature').onclick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSignature = false;
    };
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const error = document.getElementById('signature-error');
      error.classList.add('hidden');
      if(form.tipoReceptor.value === 'otra_persona' && !document.getElementById('authorization-check').checked) {
        error.textContent = 'Debes aceptar la autorización.';
        error.classList.remove('hidden');
        return;
      }
      if(!hasSignature) {
        error.textContent = 'Debes firmar la entrega.';
        error.classList.remove('hidden');
        return;
      }
      const payload = Object.fromEntries(new FormData(form));
      payload.textoAutorizacion = form.tipoReceptor.value === 'otra_persona' ? authorizationText.textContent : '';
      payload.firmaRecepcion = canvas.toDataURL('image/png');
      const response = await fetch(`/api/pedidos/${pedido.idPedido}/firmar-entrega`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });
      if(!response.ok) {
        const data = await response.json().catch(() => ({}));
        error.textContent = data.message || data.error || 'No se pudo registrar la entrega.';
        error.classList.remove('hidden');
        return;
      }
      modal.remove();
      fetchPedidoDetalle();
    });
  }

  function showError(msg) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.textContent = msg;
  }

  fetchPedidoDetalle();
});

