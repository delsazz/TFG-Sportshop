const formPago = document.getElementById('formPago');
const numeroTarjeta = document.getElementById('numeroTarjeta');
const fechaCaducidad = document.getElementById('fechaCaducidad');
const cvv = document.getElementById('cvv');

if(formPago && numeroTarjeta && fechaCaducidad && cvv) {
    formPago.addEventListener('submit', function(e) {
        let valido = true;
        const numero = numeroTarjeta.value.replace(/\s/g, '');

        if(!/^\d{16}$/.test(numero)) {
            numeroTarjeta.classList.add('is-invalid');
            valido = false;
        } else {
            numeroTarjeta.classList.remove('is-invalid');
        }

        if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fechaCaducidad.value)) {
            fechaCaducidad.classList.add('is-invalid');
            valido = false;
        } else {
            fechaCaducidad.classList.remove('is-invalid');
        }

        if(!/^\d{3,4}$/.test(cvv.value)) {
            cvv.classList.add('is-invalid');
            valido = false;
        } else {
            cvv.classList.remove('is-invalid');
        }

        if(!valido) {
            e.preventDefault();
        }
    });

    numeroTarjeta.addEventListener('input', function() {
        let valor = this.value.replace(/\D/g, '').slice(0, 16);
        this.value = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    });

    fechaCaducidad.addEventListener('input', function() {
        let valor = this.value.replace(/\D/g, '').slice(0, 4);
        if(valor.length >= 3) {
            valor = valor.slice(0, 2) + '/' + valor.slice(2);
        }
        this.value = valor;
    });

    cvv.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 4);
    });
}
