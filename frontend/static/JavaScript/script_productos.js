document.addEventListener('DOMContentLoaded', function() {
    window.mostrarMensaje = function() {
        const alerta = document.getElementById("mensajeLogin");
        if(alerta) {
            alerta.classList.remove("d-none");
            setTimeout(function() {
                alerta.classList.add("d-none");
            }, 4000);
        }
    };
});