
// Configuración de la API
const API_BASE_URL = 'http://localhost:8082';

// Referencias a elementos DOM
const $codigoBarras = $('#codigoBarras');
const $btnBuscar = $('#btnBuscar');
const $loadingArea = $('#loadingArea');
const $resultadoArea = $('#resultadoArea');

// Inicializar el escáner de códigos de barras usando la librería compartida
inicializarEscanerCodigoBarras(function (codigoDetectado) {
    // Callback que se ejecuta cuando se detecta un código de barras
    // Simplemente buscar con el código detectado
    buscarProducto(codigoDetectado);
});

// Evento para buscar al presionar Enter en el input
$codigoBarras.on('keypress', function (e) {
    if (e.which === 13) { // Enter
        buscarProducto();
    }
});

// Evento para el botón buscar
$btnBuscar.on('click', buscarProducto);

// Función unificada para buscar producto (desde escáner, input o botón)
function buscarProducto(codigoParam) {
    // Si se pasa un código como parámetro (escáner), usarlo
    // Si no, leer del input (usuario manual)
    const codigoBarra = codigoParam || $codigoBarras.val().trim();

    if (!codigoBarra) {
        mostrarError('Por favor ingresa un código de barras');
        return;
    }

    // Mostrar loading
    $loadingArea.show();
    $resultadoArea.empty();
    $btnBuscar.prop('disabled', true);

    // Realizar petición a la API
    $.ajax({
        url: `${API_BASE_URL}/producto/buscar-codigo/${codigoBarra}`,
        method: 'GET',
        contentType: 'application/json',
        timeout: 10000, // 10 segundos
        success: function (producto) {
            mostrarProducto(producto);
        },
        error: function (xhr, status, error) {
            let mensaje = 'Error al buscar el producto';

            if (xhr.status === 404) {
                mensaje = 'Producto no encontrado con ese código de barras';
            } else if (xhr.status === 0) {
                mensaje = 'No se puede conectar con el servidor. Verifica que esté ejecutándose.';
            } else if (status === 'timeout') {
                mensaje = 'La búsqueda está tardando demasiado. Intenta nuevamente.';
            }

            mostrarError(mensaje);
        },
        complete: function () {
            $loadingArea.hide();
            $btnBuscar.prop('disabled', false);
        }
    });
}

// Función para mostrar la información del producto
function mostrarProducto(producto) {
    // Determinar estado del stock
    let stockClass = 'stock-available';
    let stockText = `${producto.cantidad} unidades disponibles`;

    if (producto.cantidad === 0) {
        stockClass = 'stock-out';
        stockText = 'Sin stock';
    } else if (producto.cantidad <= producto.alertaStock && producto.alertaStock > 0) {
        stockClass = 'stock-low';
        stockText = `${producto.cantidad} unidades (Stock bajo)`;
    }

    // Formatear códigos de barras
    let codigosBarraHtml = '';
    if (producto.codigosDeBarra && producto.codigosDeBarra.length > 0) {
        codigosBarraHtml = producto.codigosDeBarra.map(cb => cb.codigoBarra).join(', ');
    } else {
        codigosBarraHtml = 'Sin códigos de barras';
    }

    const html = `
            <div class="product-card">
                <div class="product-header">
                    <div class="product-name">${producto.nombre}</div>
                    <div class="product-price">$${formatearPrecio(producto.precioVendido)}</div>
                    <small>Precio de venta</small>
                </div>
                <div class="product-details">
                    <div class="detail-row">
                        <span class="detail-label">📦 Stock:</span>
                        <span class="stock-badge ${stockClass}">${stockText}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">💰 Precio Compra:</span>
                        <span class="detail-value">$${formatearPrecio(producto.precioComprado)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">🏪 Precio Mayorista:</span>
                        <span class="detail-value">$${formatearPrecio(producto.precioMayorista)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">🏷️ SKU:</span>
                        <span class="detail-value">${producto.sku || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">📂 Categoría:</span>
                        <span class="detail-value">${producto.categoria ? producto.categoria.nombre : 'Sin categoría'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">🛡️ Garantía:</span>
                        <span class="detail-value">${producto.garantia} meses</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">📊 Estado:</span>
                        <span class="detail-value">
                            <span class="badge ${producto.estado === 'activo' ? 'badge-success' : 'badge-secondary'}">
                                ${producto.estado.toUpperCase()}
                            </span>
                        </span>
                    </div>
                    ${producto.descripcion ? `
                    <div class="detail-row">
                        <span class="detail-label" style="width: 40%;">📝 Descripción:</span>
                        <span class="detail-value" style="width: 80%;">${producto.descripcion}</span>
                    </div>
                    ` : ''}

                </div>
            </div>
        `;

    $resultadoArea.html(html);

    // Limpiar campo de búsqueda y enfocarlo para próxima búsqueda
    $codigoBarras.val('').focus();
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const html = `
            <div class="error-message">
                ❌ ${mensaje}
            </div>
        `;
    $resultadoArea.html(html);
}

// Función para formatear precios
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

