document.getElementById('formPago').addEventListener('submit', function(e) {
    let valido = true;
    const numero = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
    if(!/^\d{16}$/.test(numero)) {
        document.getElementById('numeroTarjeta').classList.add('is-invalid');
        valido = false;
    } else {
        document.getElementById('numeroTarjeta').classList.remove('is-invalid');
    }
    const fecha = document.getElementById('fechaCaducidad').value;
    if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fecha)) {
        document.getElementById('fechaCaducidad').classList.add('is-invalid');
        valido = false;
    } else {
        document.getElementById('fechaCaducidad').classList.remove('is-invalid');
    }
    const cvv = document.getElementById('cvv').value;
    if(!/^\d{3,4}$/.test(cvv)) {
        document.getElementById('cvv').classList.add('is-invalid');
        valido = false;
    } else {
        document.getElementById('cvv').classList.remove('is-invalid');
    }
    if(!valido) {
        e.preventDefault();
    }
});
document.getElementById('numeroTarjeta').addEventListener('input', function(e) {
    let valor = this.value.replace(/\s/g, '');
    if(valor.length > 16) {
        value = valor.slice(0, 16);
    }
    let formateado = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.valor = formateado;
});
document.getElementById('fechaCaducidad').addEventListener('input', function(e) {
    let valor = this.value.replace(/\//g, '');
    if(valor.length > 4) {
        valor = valor.slice(0, 4);
    }
    if(valor.length >= 2) {
        valor = valor.slice(0, 2) + '/' + valor.slice(2);
    }
    this.valor = valor;
});
document.getElementById('cvv').addEventListener('input', function(e) {
    this.valor = this.valor.replace(/[^\d]/g, '').slice(0, 4);
});