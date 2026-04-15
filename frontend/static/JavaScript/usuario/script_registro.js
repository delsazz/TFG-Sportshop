document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('registroForm');
    const nombre = document.getElementById('nombre');
    const apellidos = document.getElementById('apellidos');
    const email = document.getElementById('email');
    const contrasena = document.getElementById('password');
    const nif = document.getElementById('nif');
    const pais = document.getElementById('pais');
    const ciudad = document.getElementById('ciudad');
    const codigoPostal = document.getElementById('codigoPostal');
    const direccion = document.getElementById('direccion');
    const mostrarContrasena = document.getElementById('showPassword');
    const botonRegistro = document.getElementById('registroButton');
    const error = document.getElementById('errorAlert');
    const exito = document.getElementById('successAlert');

    if(error) { error.style.display = 'block'; setTimeout(()=>{error.style.display='none'},5000);}
    if(exito) { exito.style.display='block'; setTimeout(()=>{exito.style.display='none'; setTimeout(()=>{window.location.href='/login';},3000);},5000);}

    if(mostrarContrasena) {
        mostrarContrasena.addEventListener('change', function() {
            contrasena.type = this.checked ? 'text' : 'password';
        });
    }

    function comprobarEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);}
    function comprobarNIF(nif){ return /^[0-9]{8}[A-Z]$/i.test(nif);}
    function comprobarCodigoPostal(code){ return /^[0-9]{5}$/.test(code);}

    function comprobarFormulario(){
        let valido = true;
        if(!nombre.value.trim()){nombre.classList.add('is-invalid'); valido=false;} else {nombre.classList.remove('is-invalid');}
        if(!apellidos.value.trim()){apellidos.classList.add('is-invalid'); valido=false;} else {apellidos.classList.remove('is-invalid');}
        if(!comprobarEmail(email.value)){email.classList.add('is-invalid'); valido=false;} else {email.classList.remove('is-invalid');}
        if(!contrasena.value || contrasena.value.length<6){contrasena.classList.add('is-invalid'); valido=false;} else {contrasena.classList.remove('is-invalid');}
        if(!comprobarNIF(nif.value)){nif.classList.add('is-invalid'); valido=false;} else {nif.classList.remove('is-invalid');}
        if(!pais.value){pais.classList.add('is-invalid'); valido=false;} else {pais.classList.remove('is-invalid');}
        if(!ciudad.value.trim()){ciudad.classList.add('is-invalid'); valido=false;} else {ciudad.classList.remove('is-invalid');}
        if(!comprobarCodigoPostal(codigoPostal.value)){codigoPostal.classList.add('is-invalid'); valido=false;} else {codigoPostal.classList.remove('is-invalid');}
        if(!direccion.value.trim()){direccion.classList.add('is-invalid'); valido=false;} else {direccion.classList.remove('is-invalid');}
        return valido;
    }

    function cargarEstadoRegistro(cargando){
        if(cargando){
            botonRegistro.disabled=true;
            botonRegistro.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...`;
        } else {
            botonRegistro.disabled=false;
            botonRegistro.innerHTML='<i class="bi bi-person-plus me-2"></i>Crear cuenta';
        }
    }

    if(formulario){
        formulario.addEventListener('submit', function(event){
            if(!comprobarFormulario()){
                event.preventDefault();
                const alerta = document.querySelector('.alert-danger.mt-3');
                if(alerta) alerta.remove();
                const errorDiv=document.createElement('div');
                errorDiv.className='alert alert-danger mt-3';
                errorDiv.innerHTML='<i class="bi bi-exclamation-triangle-fill me-2"></i>Por favor, corrige los errores en el formulario';
                formulario.insertBefore(errorDiv, botonRegistro);
                setTimeout(()=>{errorDiv.remove();},5000);
            } else { cargarEstadoRegistro(true);}
        });
    }
    [nombre,apellidos,ciudad,direccion].forEach(entrada=>{
        entrada.addEventListener('input', function(){
            if(this.value.trim()){this.classList.remove('is-invalid'); this.classList.add('is-valid');} else {this.classList.remove('is-valid');}
        });
    });
    email.addEventListener('input', function(){
        if(comprobarEmail(this.value)){this.classList.remove('is-invalid'); this.classList.add('is-valid');} else {this.classList.remove('is-valid'); if(this.value.length>0){this.classList.add('is-invalid');}}
    });
    contrasena.addEventListener('input', function(){
        if(this.value.length>=6){this.classList.remove('is-invalid'); this.classList.add('is-valid');} else {this.classList.remove('is-valid'); if(this.value.length>0){this.classList.add('is-invalid');}}
    });
    nif.addEventListener('input', function(){
        this.value=this.value.toUpperCase();
        if(comprobarNIF(this.value)){this.classList.remove('is-invalid'); this.classList.add('is-valid');} else {this.classList.remove('is-valid'); if(this.value.length>0){this.classList.add('is-invalid');}}
    });
    codigoPostal.addEventListener('input', function(){
        if(comprobarCodigoPostal(this.value)){this.classList.remove('is-invalid'); this.classList.add('is-valid');} else {this.classList.remove('is-valid'); if(this.value.length>0){this.classList.add('is-invalid');}}
    });
    pais.addEventListener('change', function(){
        if(this.value){this.classList.remove('is-invalid'); this.classList.add('is-valid');} else {this.classList.remove('is-valid');}
    });
});