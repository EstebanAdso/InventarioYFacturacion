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

// Función para mostrar mensajes
function mostrarMensajeParrafo(mensaje, color = 'black', element) {
  document.getElementById(element).innerHTML = 
      `<p style="text-align: center; color: ${color}; font-weight: bold">${mensaje}</p>`;
      setTimeout(() => {
        document.getElementById(element).innerHTML = '';
      }, 3000);
}

function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Función para formatear fecha
function formatearFecha(fecha) {
  const opciones = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  };
  return fecha.toLocaleDateString('es-CO', opciones);
}

function mostrarConfirmacionDinamica({
    mensaje,
    onAceptar,
    onCancelar,
    textoAceptar = 'Aceptar',
    textoCancelar = 'Cancelar',
}) {
    // Si el modal no existe, lo crea e inyecta en el body
    let modal = document.getElementById('modalConfirmacionDinamica');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalConfirmacionDinamica';
        modal.innerHTML = `
        <div class="modal fade" id="modalConfirmacionDinamicaInner" tabindex="-1" role="dialog" aria-labelledby="modalConfirmacionLabel" >
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header bg-danger text-white" >
                <h5 class="modal-title" id="modalConfirmacionLabel">Confirmación</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span >&times;</span>
                </button>
              </div>
              <div class="modal-body" id="modalConfirmacionTexto"></div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="btnCancelarConfirmacion">${textoCancelar}</button>
                <button type="button" class="btn btn-danger" id="btnAceptarConfirmacion">${textoAceptar}</button>
              </div>
            </div>
          </div>
        </div>`;
        document.body.appendChild(modal);
    }
    // Actualizar el mensaje y los textos de los botones
    document.getElementById('modalConfirmacionTexto').innerText = mensaje;
    document.getElementById('btnAceptarConfirmacion').innerText = textoAceptar;
    document.getElementById('btnCancelarConfirmacion').innerText = textoCancelar;

    // Remover listeners anteriores
    const btnAceptar = document.getElementById('btnAceptarConfirmacion');
    const btnCancelar = document.getElementById('btnCancelarConfirmacion');
    btnAceptar.onclick = null;
    btnCancelar.onclick = null;

    // Asignar nuevos listeners
    btnAceptar.onclick = function () {
        $("#modalConfirmacionDinamicaInner").modal('hide');
        if (typeof onAceptar === 'function') onAceptar();
    };
    btnCancelar.onclick = function () {
        $("#modalConfirmacionDinamicaInner").modal('hide');
        if (typeof onCancelar === 'function') onCancelar();
    };
    // Mostrar el modal
    $("#modalConfirmacionDinamicaInner").modal('show');
}

