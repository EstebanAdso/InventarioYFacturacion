function mostrarMensaje(tipo, texto) {
    const mensajeNotificacion = document.getElementById('mensajeNotificacion');
    const mensajeTexto = document.getElementById('mensajeTexto');

    mensajeTexto.innerText = texto;

    if (tipo === 'error') {
        mensajeNotificacion.className = 'alert alert-danger alert-dismissible fade show';
    } else if (tipo === 'success') {
        mensajeNotificacion.className = 'alert alert-success alert-dismissible fade show';
    }

    mensajeNotificacion.style.display = 'block';

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        mensajeNotificacion.style.display = 'none';
    }, 5000);
}

function cerrarMensaje() {
    const mensajeNotificacion = document.getElementById('mensajeNotificacion');
    mensajeNotificacion.style.display = 'none';
}

function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
