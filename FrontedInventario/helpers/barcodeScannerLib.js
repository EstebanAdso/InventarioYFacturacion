// Variables globales del escáner
let _codigoBarras = '';
let _tiempoUltimaTecla = 0;
let _campoLectura = null;
let _esEscaneoActivo = false;
let _timeoutLimpieza = null;
let _callbackScanComplete = null;
let _velocidadesTeclas = []; // Array para medir consistencia de velocidad

// Configuración
const TIEMPO_MAXIMO_ENTRE_TECLAS = 40; // ms - Escáneres son consistentes < 40ms
const LONGITUD_MIN_CODIGO_BARRAS = 6;
const AUTO_PROCESAMIENTO_DELAY = 60; // ms
const MIN_TECLAS_RAPIDAS_CONSECUTIVAS = 3; // Mínimo de teclas rápidas para detectar escáner

/**
 * Inicializa el escáner de códigos de barras
 * @param {Function} onScanComplete - Callback que recibe el código escaneado
 */
function inicializarEscanerCodigoBarras(onScanComplete) {
    _callbackScanComplete = onScanComplete;
    document.addEventListener('keydown', _leerCodigoBarras);
}

/**
 * Detiene el escáner de códigos de barras
 */
function detenerEscanerCodigoBarras() {
    document.removeEventListener('keydown', _leerCodigoBarras);
    _resetearEscaner();
}

/**
 * Función interna para leer códigos de barras
 */
function _leerCodigoBarras(event) {
    const ahora = new Date().getTime();

    // Calcular tiempo transcurrido ANTES de actualizar
    const tiempoTranscurrido = _tiempoUltimaTecla > 0 ? ahora - _tiempoUltimaTecla : 999;

    // Si ha pasado demasiado tiempo, reiniciar (lectura manual, no escáner)
    if (tiempoTranscurrido > TIEMPO_MAXIMO_ENTRE_TECLAS && _codigoBarras.length > 0) {
        _resetearEscaner();
    }

    // Guardar referencia al campo donde se está leyendo (al inicio de nueva lectura)
    if (_codigoBarras.length === 0) {
        _campoLectura = event.target;
        _esEscaneoActivo = false;
        _velocidadesTeclas = [];
    }

    // Actualizar el tiempo DESPUÉS de calcular
    _tiempoUltimaTecla = ahora;

    // Procesar solo caracteres imprimibles o Enter
    if (event.key.length === 1 || event.key === 'Enter') {
        // Si es Enter, procesar el código acumulado
        if (event.key === 'Enter') {
            if (_codigoBarras.length >= LONGITUD_MIN_CODIGO_BARRAS) {
                event.preventDefault();
                _procesarCodigoBarras();
            }
            return;
        }

        // Registrar velocidad de esta tecla
        if (tiempoTranscurrido < 999) {
            _velocidadesTeclas.push(tiempoTranscurrido);
        }

        // Detectar si es lectura de escáner ANTES de agregar el carácter
        const esLecturaRapida = tiempoTranscurrido < TIEMPO_MAXIMO_ENTRE_TECLAS;

        // Patrón flexible: acepta alfanuméricos y caracteres comunes en códigos de barras
        const esPatronCodigoBarras = /^[0-9A-Z\-\.\_\/\s]+$/i.test(_codigoBarras + event.key);

        // Calcular consistencia de velocidad (escáneres son MUY consistentes)
        const tieneTeclasConsistentes = _velocidadesTeclas.length >= MIN_TECLAS_RAPIDAS_CONSECUTIVAS &&
            _velocidadesTeclas.slice(-MIN_TECLAS_RAPIDAS_CONSECUTIVAS).every(v => v < TIEMPO_MAXIMO_ENTRE_TECLAS);

        // Marcar como escaneo activo solo si:
        // 1. Múltiples teclas rápidas consecutivas (no solo una o dos)
        // 2. Patrón de código de barras
        // 3. Velocidad consistentemente rápida
        if (tieneTeclasConsistentes && esPatronCodigoBarras && _codigoBarras.length >= 2) {
            _esEscaneoActivo = true;
        }

        // PREVENIR escritura solo si confirmamos que es escáner
        if (_esEscaneoActivo && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) {
            event.preventDefault();
        }

        // Agregar carácter al código DESPUÉS de prevenir
        _codigoBarras += event.key;

        // Limpiar campo inmediatamente si se contaminó
        if (_esEscaneoActivo) {
            _limpiarCampoTemporal();
        }

        // Si alcanzamos longitud mínima, preparar para procesar
        if (_codigoBarras.length >= LONGITUD_MIN_CODIGO_BARRAS) {
            // Auto-procesar después de X ms sin nuevas teclas
            clearTimeout(_timeoutLimpieza);
            _timeoutLimpieza = setTimeout(() => {
                if (_codigoBarras.length >= LONGITUD_MIN_CODIGO_BARRAS && esPatronCodigoBarras) {
                    _procesarCodigoBarras();
                }
            }, AUTO_PROCESAMIENTO_DELAY);
        }
    }
}

/**
 * Procesar el código de barras capturado
 */
function _procesarCodigoBarras() {
    clearTimeout(_timeoutLimpieza);

    const codigoFinal = _codigoBarras;

    // Limpiar el campo que pudo contaminarse
    _limpiarCampoCompleto();

    // Ejecutar callback con el código
    if (_callbackScanComplete) {
        _callbackScanComplete(codigoFinal);
    }

    // Resetear
    _resetearEscaner();
}

/**
 * Limpiar campo contaminado durante la lectura (limpieza temporal)
 */
function _limpiarCampoTemporal() {
    if (_campoLectura && (_campoLectura.tagName === 'INPUT' || _campoLectura.tagName === 'TEXTAREA')) {
        const valorActual = _campoLectura.value;

        // Buscar y eliminar el código parcial del final
        for (let i = _codigoBarras.length; i > 0; i--) {
            const fragmento = _codigoBarras.substring(0, i);
            if (valorActual.endsWith(fragmento)) {
                _campoLectura.value = valorActual.substring(0, valorActual.length - fragmento.length);
                break;
            }
        }
    }
}

/**
 * Limpiar el campo donde se leyó el código de barras (limpieza completa)
 */
function _limpiarCampoCompleto() {
    if (!_campoLectura || !(_campoLectura.tagName === 'INPUT' || _campoLectura.tagName === 'TEXTAREA')) {
        return;
    }

    const valorOriginal = _campoLectura.value;
    let valorFinal = valorOriginal;

    // Intentar eliminar el código completo o fragmentos parciales del final
    for (let i = _codigoBarras.length; i > 0; i--) {
        const fragmento = _codigoBarras.substring(0, i);
        if (valorOriginal.endsWith(fragmento)) {
            valorFinal = valorOriginal.slice(0, -fragmento.length);
            break;
        }
    }

    // Si el campo solo contiene el código o quedó vacío, limpiarlo
    if (valorFinal.trim() === '' || valorFinal.trim() === _codigoBarras) {
        valorFinal = '';
    }

    _campoLectura.value = valorFinal;

    // Restaurar valores predeterminados según el ID del campo
    if (_campoLectura.value === '') {
        switch (_campoLectura.id) {
            case 'garantiaProducto':
                _campoLectura.value = '0';
                break;
            case 'cantidadProductoManual':
                _campoLectura.value = '1';
                break;
        }
    }
}

/**
 * Resetear el escáner de códigos de barras
 */
function _resetearEscaner() {
    _codigoBarras = '';
    _campoLectura = null;
    _tiempoUltimaTecla = 0;
    _esEscaneoActivo = false;
    _velocidadesTeclas = [];
    clearTimeout(_timeoutLimpieza);
}
