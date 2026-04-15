document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('loginForm');
    const usuario = document.getElementById('username');
    const contrasena = document.getElementById('password');
    const mostrarContrasena = document.getElementById('showPassword');
    const error = document.getElementById('errorAlert');
    const exito = document.getElementById('successAlert');
    if(error) {
        error.style.display = 'block';
        setTimeout(() => {
            error.style.display = 'none';
        }, 4000);
    }
    if(exito) {
        exito.style.display = 'block';
        setTimeout(() => {
            exito.style.display = 'none';
        }, 4000);
    }
    if(mostrarContrasena) {
        mostrarContrasena.addEventListener('change', function() {
            if(this.checked) {
                contrasena.type = 'text';
            } else {
                contrasena.type = 'password';
            }
        });
    }
    if(formulario) {
        formulario.addEventListener('submit', function(event) {
            let valido = true;
            if(!usuario.value || !usuario.value.includes('@')) {
                usuario.classList.add('is-invalid');
                valido = false;
            } else {
                usuario.classList.remove('is-invalid');
            }
            if(!contrasena.value || contrasena.value.length < 3) {
                contrasena.classList.add('is-invalid');
                valido = false;
            } else {
                contrasena.classList.remove('is-invalid');
            }
            if(!valido) {
                event.preventDefault();
                alert('Por favor, completa correctamente todos los campos');
            }
        });
    }
    usuario.addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
    contrasena.addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
});