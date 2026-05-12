document.addEventListener('DOMContentLoaded', () => {
  const notFoundContainer = document.getElementById('not-found-container');
  const confirmationContainer = document.getElementById('confirmation-container');
  const orderSubtitle = document.getElementById('order-subtitle');
  const receiptUploadSection = document.getElementById('receipt-upload-section');
  const summaryItems = document.getElementById('order-summary-items');
  
  const receiptFile = document.getElementById('receipt-file');
  const btnUploadReceipt = document.getElementById('btn-upload-receipt');
  const uploadMessage = document.getElementById('upload-message');

  const orderRaw = sessionStorage.getItem('lastOrder');
  let order = null;

  try {
    if (orderRaw) order = JSON.parse(orderRaw);
  } catch(e) {}

  if (!order || !order.idPedido) {
    notFoundContainer.classList.remove('hidden');
    return;
  }

  confirmationContainer.classList.remove('hidden');

  const paymentMethod = order.paymentMethod || 'pendiente';
  const status = order.paymentStatus || 'pendiente';
  orderSubtitle.textContent = `Pedido #${order.idPedido}. Pago ${paymentMethod}. Estado ${status}.`;

  const requiresReceipt = paymentMethod === 'bizum' || paymentMethod === 'transferencia bancaria';
  if (requiresReceipt) {
    receiptUploadSection.classList.remove('hidden');
  }

  if (order.items && order.items.length) {
    order.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between';
      
      div.innerHTML = `
        <div>
          <p class="font-semibold text-slate-900">${item.nombre}</p>
          <p class="mt-1 text-sm text-slate-500">Talla ${item.talla}</p>
        </div>
        <div class="sm:text-right">
          <p class="font-semibold text-slate-900">x${item.cantidad}</p>
          <p class="mt-1 text-sm text-slate-500">${(item.precioUnitario * item.cantidad).toFixed(2)} EUR</p>
        </div>
      `;
      summaryItems.appendChild(div);
    });
  }

  let selectedFile = null;

  receiptFile.addEventListener('change', (e) => {
    selectedFile = e.target.files?.[0] || null;
    btnUploadReceipt.disabled = !selectedFile;
  });

  btnUploadReceipt.addEventListener('click', async () => {
    if (!order.idPedido || !selectedFile) {
      showMessage('Selecciona comprobante.');
      return;
    }

    const token = getToken();
    if (!token) {
      showMessage('Sesión requerida.');
      return;
    }

    btnUploadReceipt.disabled = true;
    btnUploadReceipt.textContent = 'Subiendo...';
    showMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Note: Endpoint from original was /api/pagos/${order.paymentId}/comprobante
      // but payload usually gives idPedido and maybe id as paymentId. We'll use idPedido.
      const paymentId = order.paymentId || order.idPedido;

      const response = await fetch(`/api/pagos/${paymentId}/comprobante`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        showMessage(payload.error || payload.message || 'Error subiendo comprobante.');
        return;
      }

      showMessage('Comprobante subido.');
    } catch {
      showMessage('Error subiendo comprobante.');
    } finally {
      btnUploadReceipt.disabled = false;
      btnUploadReceipt.textContent = 'Subir comprobante';
    }
  });

  function showMessage(msg) {
    if (msg) {
      uploadMessage.textContent = msg;
      uploadMessage.classList.remove('hidden');
    } else {
      uploadMessage.classList.add('hidden');
    }
  }
});
