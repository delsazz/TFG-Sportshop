document.addEventListener("DOMContentLoaded", () => {
    const carritoBadge = document.querySelector(".btn-outline-light .badge");
    function actualizarCarrito(nuevosProductos) {
        if(carritoBadge) {
            carritoBadge.textContent = nuevosProductos;
            carritoBadge.style.display = nuevosProductos > 0 ? "inline-block" : "none";
        }
    }
    const btnEliminar = document.querySelectorAll(".btn-eliminar-carrito");
    btnEliminar.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const fila = btn.closest("tr");
            const cantidadInput = fila.querySelector(".cantidad-producto");
            const numeroProductos = parseInt(cantidadInput.value) || 1;
            let numeroProductosActuales = parseInt(carritoBadge.textContent) || 0;
            let nuevoNumeroProductos = numeroProductosActuales - numeroProductos;
            if(nuevoNumeroProductos < 0) {
                nuevoNumeroProductos = 0;
            }
            actualizarCarrito(nuevoNumeroProductos);
            fila.remove();
            fetch('/carrito/eliminar', { method: 'POST', body: JSON.stringify({ id: productoId }) })
        });
    });
});