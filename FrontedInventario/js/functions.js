function mostrarMensaje(tipo, texto) {
  const mensajeNotificacion = document.getElementById('mensajeNotificacion');
  const mensajeTexto = document.getElementById('mensajeTexto');

  mensajeTexto.innerText = texto;
  if (tipo === 'error') {
    mensajeNotificacion.className = 'alert alert-danger alert-dismissible fade show';
  } else if (tipo === 'success') {
    mensajeNotificacion.className = 'alert alert-success alert-dismissible fade show';
  } else if( tipo === 'info') {
    mensajeNotificacion.className = 'alert alert-info alert-dismissible fade show';
  }

  mensajeNotificacion.style.display = 'block';

  // Ocultar el mensaje después de 5 segundos
  setTimeout(() => {
    mensajeNotificacion.style.display = 'none';
  }, 5000);
}

function mostrarToast(tipo, texto) {
  const toastNotificacion = document.getElementById('toastNotificacion');
  const toastTexto = document.getElementById('toastTexto');
  const toastIcon = document.getElementById('toastIcon');

  if (!toastNotificacion || !toastTexto) {
    console.warn('Elementos del toast no encontrados. Usando alert fallback.');
    alert(texto);
    return;
  }

  // Limpiar clases anteriores
  toastNotificacion.classList.remove('success', 'error', 'info');

  // Configurar tipo, icono y clase
  let iconClass = 'fas fa-info-circle';
  if (tipo === 'error') {
    toastNotificacion.classList.add('error');
    iconClass = 'fas fa-times-circle';
  } else if (tipo === 'success') {
    toastNotificacion.classList.add('success');
    iconClass = 'fas fa-check-circle';
  } else if (tipo === 'info') {
    toastNotificacion.classList.add('info');
    iconClass = 'fas fa-info-circle';
  }

  // Actualizar icono y texto
  if (toastIcon) {
    toastIcon.innerHTML = `<i class="${iconClass}"></i>`;
  }
  toastTexto.innerText = texto;

  // Mostrar el toast
  toastNotificacion.style.display = 'block';

  // Ocultar después de 4 segundos
  setTimeout(() => {
    toastNotificacion.style.display = 'none';
  }, 4000);
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
        <div class="modal fade" id="modalConfirmacionDinamicaInner" tabindex="-1" role="dialog" aria-labelledby="modalConfirmacionLabel" data-backdrop="static">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header bg-danger text-white" >
                <h5 class="modal-title" id="modalConfirmacionLabel">Confirmación</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
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

function mostrarConfirmacionToast({
  mensaje,
  onAceptar,
  onCancelar,
  textoAceptar = 'Aceptar',
  textoCancelar = 'Cancelar',
}) {
  const toastConfirmacion = document.getElementById('toastConfirmacion');
  const toastConfirmacionTexto = document.getElementById('toastConfirmacionTexto');
  const btnAceptarToast = document.getElementById('btnAceptarToast');
  const btnCancelarToast = document.getElementById('btnCancelarToast');
  const backdropConfirmacion = document.getElementById('backdropConfirmacion');

  if (!toastConfirmacion || !toastConfirmacionTexto) {
    console.warn('Elementos del toast de confirmación no encontrados.');
    return;
  }

  // Actualizar mensaje y textos de botones
  toastConfirmacionTexto.innerText = mensaje;
  btnAceptarToast.innerText = textoAceptar;
  btnCancelarToast.innerText = textoCancelar;

  // Remover listeners anteriores
  btnAceptarToast.onclick = null;
  btnCancelarToast.onclick = null;

  // Función para cerrar
  function cerrarConfirmacionToast() {
    toastConfirmacion.style.display = 'none';
    backdropConfirmacion.style.display = 'none';
  }

  // Asignar nuevos listeners
  btnAceptarToast.onclick = function () {
    cerrarConfirmacionToast();
    if (typeof onAceptar === 'function') onAceptar();
  };

  btnCancelarToast.onclick = function () {
    cerrarConfirmacionToast();
    if (typeof onCancelar === 'function') onCancelar();
  };

  // Cerrar al hacer clic en el backdrop
  backdropConfirmacion.onclick = function (e) {
    if (e.target === backdropConfirmacion) {
      cerrarConfirmacionToast();
      if (typeof onCancelar === 'function') onCancelar();
    }
  };

  // Mostrar el toast
  toastConfirmacion.style.display = 'flex';
  backdropConfirmacion.style.display = 'block';
}

