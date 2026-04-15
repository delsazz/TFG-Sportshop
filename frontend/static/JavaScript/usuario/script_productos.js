document.addEventListener("DOMContentLoaded", () => {
    const botonAnadirCarrito = document.querySelectorAll(".btn-cart-add");
    const badgeCarrito = document.querySelector("#badge-carrito span");
    let contadorCarrito = parseInt(badgeCarrito.textContent) || 0;
    function actualizarBadge() {
        badgeCarrito.textContent = contadorCarrito;
        badgeCarrito.parentElement.classList.add("pulse-badge");
        setTimeout(() => {
            badgeCarrito.parentElement.classList.remove("pulse-badge");
        }, 300);
    }
    botonAnadirCarrito.forEach(boton => {
        boton.addEventListener("click", () => {
            contadorCarrito++;
            actualizarBadge();
        });
    });
});