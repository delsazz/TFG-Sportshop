document.querySelectorAll('[data-upload-zone]').forEach(function(zone) {
    const input = document.getElementById(zone.dataset.inputId);
    const preview = document.getElementById(zone.dataset.previewId);

    zone.addEventListener('click', function() {
        input.click();
    });

    zone.addEventListener('dragover', function(event) {
        event.preventDefault();
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', function() {
        zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', function(event) {
        event.preventDefault();
        zone.classList.remove('dragover');

        if(event.dataTransfer.files.length > 0) {
            input.files = event.dataTransfer.files;
            mostrarVistaPrevia(input, preview);
        }
    });

    input.addEventListener('change', function() {
        mostrarVistaPrevia(input, preview);
    });
});

function mostrarVistaPrevia(input, preview) {
    const archivo = input.files[0];
    if(!archivo) {
        preview.style.display = 'none';
        return;
    }

    preview.src = URL.createObjectURL(archivo);
    preview.style.display = 'inline-block';
}
