const RETURN_REASON_OTHER = 'OTRO';
const RETURN_REASONS = [
  'Talla incorrecta',
  'Producto defectuoso',
  'Producto equivocado',
  'No era lo esperado',
  'Pedido incompleto',
  'Cambio de opinión'
];
let pedido = null;
let isReturnMode = false;
let selectedItems = {};
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');
const contentContainer = document.getElementById('content-container');
const orderTitle = document.getElementById('order-title');
const orderDate = document.getElementById('order-date');
const orderStatus = document.getElementById('order-status');
const orderTotal = document.getElementById('order-total');
const orderItems =  document.getElementById('order-items');
 
function getOrderId() {
  const params =
    new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchOrder() {
  try {
    const token = getToken();
    const id = getOrderId();
    const response =
      await fetch(`/api/pedidos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    if(!response.ok) {
      throw new Error();
    }
    pedido = await response.json();
    renderOrder();
  } catch(error) {
    loadingContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
  }
}

function renderOrder() {
  loadingContainer.classList.add('hidden');
  contentContainer.classList.remove('hidden');
  orderTitle.textContent =
    `Pedido #${pedido.idPedido}`;
  orderDate.textContent =
    `Realizado el ${formatDate(pedido.fecha)}`;
  orderStatus.textContent =
    pedido.estado;
  orderTotal.textContent =
    `${pedido.total.toFixed(2)} €`;
  renderProducts();
  renderReturnSection();
  renderSignature();
}

function renderProducts() {
  orderItems.innerHTML = '';
  pedido.detalles.forEach(item => {
    const div =
      document.createElement('div');
    div.className =
      'py-5 flex flex-col gap-3 sm:flex-row sm:justify-between';
    div.innerHTML = `
      <div class="flex items-center gap-4">
        ${
          item.imagen
            ? `
              <img
                src="${item.imagen}"
                class="w-16 h-16 object-cover rounded"
              >
            `
            : `
              <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs">
                Sin imagen
              </div>
            `
        }
        <div>
          <p class="font-medium">
            ${item.nombreProducto || item.productoNombre}
          </p>
          <p class="text-sm text-slate-500">
            Talla:
            ${item.talla || item.tallaNombre || 'N/A'}
          </p>
        </div>
      </div>
      <div class="sm:text-right">
        <p>
          ${item.cantidad}
          ×
          ${item.precioUnitario.toFixed(2)} €
        </p>
        <p class="font-medium mt-1">
          ${(item.cantidad * item.precioUnitario).toFixed(2)} €
        </p>
        ${
          isReturnMode
            ? renderQtyControls(item)
            : ''
        }
      </div>
    `;
    orderItems.appendChild(div);
  });
}

function renderQtyControls(item) {
  return `
    <div class="mt-3 flex items-center gap-3">
      <span class="text-xs font-medium text-amber-700">
        Cantidad:
      </span>
      <div class="flex items-center border rounded overflow-hidden">
        <button
          onclick="changeQty(${item.idDetalle}, -1, ${item.cantidad})"
          class="px-2 py-1 bg-gray-100"
        >
          -
        </button>
        <input
          type="number"
          value="${selectedItems[item.idDetalle] || 0}"
          onchange="updateQty(${item.idDetalle}, this.value, ${item.cantidad})"
          class="w-12 text-center"
        >
        <button
          onclick="changeQty(${item.idDetalle}, 1, ${item.cantidad})"
          class="px-2 py-1 bg-gray-100"
        >
          +
        </button>
      </div>
    </div>
  `;
}

function changeQty(idDetalle, delta, max) {
  let current =
    selectedItems[idDetalle] || 0;
  current += delta;
  current =
    Math.max(0, Math.min(current, max));
  selectedItems[idDetalle] = current;
  renderProducts();
}

function updateQty(idDetalle, value, max) {
  let qty = parseInt(value) || 0;
  qty = Math.max(0, Math.min(qty, max));
  selectedItems[idDetalle] = qty;
}

function renderReturnSection() {
  const canReturn =
    pedido.estado
      .toLowerCase()
      .includes('entregado');
  if(!canReturn) {
    return;
  } 
  const div =
    document.createElement('div');
  div.className =
    'mb-6';
  div.innerHTML = `
    <button
      id="return-btn"
      class="bg-amber-600 text-white px-5 py-3 rounded-full"
    >
      Solicitar devolución
    </button>
  `;
  contentContainer.prepend(div);
  document
    .getElementById('return-btn')
    .addEventListener('click', openReturnModal);
}

function openReturnModal() {
  isReturnMode = true;
  renderProducts();
  const motivoOptions =
    RETURN_REASONS.map(reason => `
      <option value="${reason}">
        ${reason}
      </option>
    `).join('');
  const modal =
    document.createElement('div');
  modal.id = 'return-modal';
  modal.className =
    'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white p-8 rounded-3xl w-full max-w-lg">
      <h2 class="text-2xl font-bold mb-4">
        Solicitud devolución
      </h2>
      <select
        id="return-reason"
        class="w-full border rounded-xl p-3 mb-4"
      >
        ${motivoOptions}
        <option value="${RETURN_REASON_OTHER}">
          Otro motivo
        </option>
      </select>
      <textarea
        id="other-reason"
        class="w-full border rounded-xl p-3 hidden"
        placeholder="Escribe el motivo"
      ></textarea>
      <div class="flex justify-end gap-3 mt-5">
        <button
          id="cancel-return"
          class="px-4 py-2 border rounded-xl"
        >
          Cancelar
        </button>
        <button
          id="submit-return"
          class="px-4 py-2 bg-amber-600 text-white rounded-xl"
        >
          Enviar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document
    .getElementById('return-reason')
    .addEventListener('change', e => {
      const textarea =
        document.getElementById('other-reason');
      if (e.target.value === RETURN_REASON_OTHER) {
        textarea.classList.remove('hidden');
      } else {
        textarea.classList.add('hidden');
      }
    });
  document
    .getElementById('cancel-return')
    .addEventListener('click', closeReturnModal);
  document
    .getElementById('submit-return')
    .addEventListener('click', submitReturn);

}

function closeReturnModal() {
  isReturnMode = false;
  selectedItems = {};
  renderProducts();
  document
    .getElementById('return-modal')
    ?.remove();

}

async function submitReturn() {
  const items =
    Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([idDetalle, qty]) => ({
        idDetallePedido: parseInt(idDetalle),
        cantidad: qty
      }));

  if(items.length === 0) {
    alert('Selecciona productos');
    return;
  }
  const reasonSelect =
    document.getElementById('return-reason');
  const otherReason =
    document.getElementById('other-reason');
  let motivo = reasonSelect.value;
  if (motivo === RETURN_REASON_OTHER) {
    motivo = otherReason.value;
  }
  if(!motivo.trim()) {
    alert('Indica motivo');
    return;
  }
  try {
    const token = getToken();
    const response =
      await fetch('/api/devoluciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          idPedido: pedido.idPedido,
          motivo,
          items
        })
      });
    if(response.ok) {
      alert('Solicitud enviada');
      closeReturnModal();
    } else {
      alert('Error enviando devolución');
    }
  } catch(error) {
    alert('Error de conexión');
  }
}

function renderSignature() {
  const entrega =
    pedido.entregas?.find(
      e => e.firmaRecepcion
    );
  if(!entrega) {
    return;
  } 
  const div =
    document.createElement('div');
  div.className =
    'mt-6 bg-white border rounded-3xl p-6';
  div.innerHTML = `
    <h2 class="text-xl font-semibold mb-3">
      Firma de recepción
    </h2>
    <p class="text-sm text-slate-500 mb-4">
      Recibido el
      ${formatDate(entrega.fechaEntrega)}
    </p>
    <img
      src="${entrega.firmaRecepcion}"
      class="max-w-2xl rounded-2xl border p-4"
    >
  `;
  contentContainer.appendChild(div);
}

function formatDate(date) {
  return new Date(date)
    .toLocaleDateString('es-ES');

}

fetchOrder();
lucide.createIcons();