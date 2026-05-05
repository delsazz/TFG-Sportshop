document.addEventListener("DOMContentLoaded", () => {
    const tablaProductos = document.querySelector("#tabla-productos");
    const alertaProductos = document.querySelector("#alerta-productos");
    const menuUsuario = document.querySelector("#menu-usuario");
    const menuLogin = document.querySelector("#menu-login");
    const nombreUsuario = document.querySelector("#nombre-usuario");
    const badgeCarrito = document.querySelector("#badge-carrito span");

    cargarSesion();
    cargarProductos();

    async function cargarSesion() {
        try {
            const respuesta = await fetch("/api/sesion");
            if(!respuesta.ok) {
                return;
            }

            const sesion = await respuesta.json();
            if(sesion.autenticado) {
                menuUsuario.classList.remove("d-none");
                menuUsuario.classList.add("d-flex");
                menuLogin.classList.add("d-none");
                nombreUsuario.textContent = sesion.usuario;
                actualizarBadge(sesion.productosCarrito);
            } else {
                menuUsuario.classList.add("d-none");
                menuUsuario.classList.remove("d-flex");
                menuLogin.classList.remove("d-none");
            }
        } catch(error) {
            mostrarAlerta("No se ha podido comprobar la sesion.", "warning");
        }
    }

    async function cargarProductos() {
        try {
            const respuesta = await fetch("/api/productos");
            if(!respuesta.ok) {
                throw new Error("Error al cargar productos");
            }

            const productos = await respuesta.json();
            pintarProductos(productos);
        } catch(error) {
            tablaProductos.innerHTML = "";
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.colSpan = 6;
            celda.className = "text-center py-4";
            celda.textContent = "No se han podido cargar los productos.";
            fila.appendChild(celda);
            tablaProductos.appendChild(fila);
        }
    }

    function pintarProductos(productos) {
        tablaProductos.innerHTML = "";

        if(productos.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.colSpan = 6;
            celda.className = "text-center py-4";
            celda.textContent = "No hay productos disponibles.";
            fila.appendChild(celda);
            tablaProductos.appendChild(fila);
            return;
        }

        productos.forEach(producto => {
            const fila = document.createElement("tr");
            fila.appendChild(crearCeldaFoto(producto));
            fila.appendChild(crearCeldaTexto(producto.nombre));
            fila.appendChild(crearCeldaTexto(`${producto.precio} €`));
            fila.appendChild(crearCeldaTexto(producto.tallas && producto.tallas.trim() ? producto.tallas : "Sin tallas"));
            fila.appendChild(crearCeldaTexto(producto.stock));
            fila.appendChild(crearCeldaAcciones(producto));
            tablaProductos.appendChild(fila);
        });
    }

    function crearCeldaFoto(producto) {
        const celda = document.createElement("td");
        if(producto.foto && producto.foto.nombreFoto) {
            const imagen = document.createElement("img");
            imagen.src = `/img/${encodeURIComponent(producto.foto.nombreFoto)}`;
            imagen.alt = producto.nombre;
            imagen.className = "img-thumbnail";
            imagen.style.width = "80px";
            imagen.style.height = "80px";
            imagen.style.objectFit = "cover";
            celda.appendChild(imagen);
        } else {
            celda.textContent = "Sin foto";
        }
        return celda;
    }

    function crearCeldaTexto(texto) {
        const celda = document.createElement("td");
        celda.textContent = texto;
        return celda;
    }

    function crearCeldaAcciones(producto) {
        const celda = document.createElement("td");
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn btn-sm btn-primary";
        boton.disabled = producto.stock <= 0;
        boton.innerHTML = '<i class="bi bi-cart-plus"></i> Añadir al carrito';
        boton.addEventListener("click", () => anadirCarrito(producto.idProducto));
        celda.appendChild(boton);
        return celda;
    }

    async function anadirCarrito(idProducto) {
        try {
            const respuesta = await fetch(`/api/carrito/anadir?id=${encodeURIComponent(idProducto)}`);
            if(respuesta.status === 401) {
                window.location.href = "/login";
                return;
            }

            const datos = await respuesta.json();
            if(!respuesta.ok) {
                mostrarAlerta(datos.mensaje || "No se ha podido anadir el producto.", "warning");
                return;
            }

            actualizarBadge(datos.productosCarrito);
            mostrarAlerta(datos.mensaje, "success");
        } catch(error) {
            mostrarAlerta("No se ha podido anadir el producto al carrito.", "danger");
        }
    }

    function actualizarBadge(totalProductos) {
        if(!badgeCarrito) {
            return;
        }
        badgeCarrito.textContent = totalProductos;
        badgeCarrito.parentElement.classList.add("pulse-badge");
        setTimeout(() => {
            badgeCarrito.parentElement.classList.remove("pulse-badge");
        }, 300);
    }

    function mostrarAlerta(mensaje, tipo) {
        alertaProductos.textContent = mensaje;
        alertaProductos.className = `alert alert-${tipo}`;
        setTimeout(() => {
            alertaProductos.className = "alert d-none";
        }, 3000);
    }
});
