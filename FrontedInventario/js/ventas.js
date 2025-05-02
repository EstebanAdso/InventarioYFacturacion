const apiUrl = 'http://localhost:8082/api/facturas';
let vistaAgrupada = true; // Estado inicial: vista agrupada

document.addEventListener('DOMContentLoaded', function () {
    obtenerFacturas();
    
    // Configurar el botón de toggle
    document.getElementById('toggleVistaBtn').addEventListener('click', function() {
        vistaAgrupada = !vistaAgrupada;
        actualizarVista();
        this.innerHTML = vistaAgrupada 
            ? '<i class="fas fa-list"></i> Vista Normal' 
            : '<i class="fas fa-calendar-alt"></i> Vista Agrupada';
    });
});

// Función principal para obtener facturas
function obtenerFacturas() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(facturas => {
            if (facturas.length > 0) {
                // Guardar las facturas y ordenarlas
                window.facturas = facturas.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
                actualizarVista();
            } else {
                mostrarMensajeParrafo('No hay facturas disponibles.', 'red', 'ventasContainer');
            }
        })
        .catch(error => {
            mostrarMensajeParrafo('Error al cargar las facturas.', 'red', 'ventasContainer');
        });
}

// Función para actualizar la vista según el modo seleccionado
function actualizarVista() {
    if (vistaAgrupada) {
        mostrarVentasAgrupadasPorFecha(window.facturas);
    } else {
        mostrarVentasNormales(window.facturas);
    }
}

// Función para mostrar ventas agrupadas por fecha
function mostrarVentasAgrupadasPorFecha(facturas) {
    const ventasContainer = document.getElementById('ventasContainer');
    ventasContainer.innerHTML = '';
    
    const facturasPorFecha = {};
    
    facturas.forEach(factura => {
        const fecha = new Date(factura.fechaEmision);
        const fechaKey = fecha.toISOString().split('T')[0];
        
        if (!facturasPorFecha[fechaKey]) {
            facturasPorFecha[fechaKey] = [];
        }
        facturasPorFecha[fechaKey].push(factura);
    });
    
    Object.keys(facturasPorFecha).forEach(fechaKey => {
        const grupoFecha = document.createElement('div');
        grupoFecha.className = 'grupo-fecha mb-4';
        
        const fechaHeader = document.createElement('h4');
        fechaHeader.className = 'fecha-header bg-light p-2 rounded';
        
        const fecha = new Date(fechaKey);
        const hoy = new Date();
        const esHoy = fecha.toDateString() === hoy.toDateString();
        
        fechaHeader.textContent = esHoy ? 'Hoy - ' + formatearFecha(fecha) : formatearFecha(fecha);
        grupoFecha.appendChild(fechaHeader);
        
        const tabla = document.createElement('table');
        tabla.className = 'table table-striped table-hover';
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Factura ID</th>
                    <th>Cliente</th>
                    <th>Cédula/NIT</th>
                    <th>Hora</th>
                    <th>Total</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${facturasPorFecha[fechaKey].map(crearFilaFactura).join('')}
            </tbody>
        `;
        
        grupoFecha.appendChild(tabla);
        ventasContainer.appendChild(grupoFecha);
    });
    
    configurarBotonesDetalles();
}

// Función para mostrar ventas en lista normal
function mostrarVentasNormales(facturas) {
    const ventasContainer = document.getElementById('ventasContainer');
    ventasContainer.innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Factura ID</th>
                    <th>Cliente</th>
                    <th>Cédula/NIT</th>
                    <th>Fecha y Hora</th>
                    <th>Total</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${facturas.map(crearFilaFactura).join('')}
            </tbody>
        </table>
    `;
    
    configurarBotonesDetalles();
}

// Función auxiliar para crear fila de factura
function crearFilaFactura(factura) {
    return `
        <tr>
            <td>${factura.serial}</td>
            <td>${factura.cliente ? factura.cliente.nombre : 'Cliente no disponible'}</td>
            <td>${factura.cliente ? factura.cliente.identificacion : 'N/A'}</td>
            <td>${vistaAgrupada 
                ? new Date(factura.fechaEmision).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                : formatearFecha(new Date(factura.fechaEmision))}</td>
            <td style="color: #48e; font-weight: bold">${formatNumber(factura.total)}</td>
            <td>
                <button class="btn btn-info btn-sm btn-ver-detalles" data-id="${factura.id}">
                    Ver detalles
                </button>
            </td>
        </tr>
    `;
}

// Función para configurar los botones de detalles
function configurarBotonesDetalles() {
    document.querySelectorAll('.btn-ver-detalles').forEach(button => {
        button.addEventListener('click', function() {
            const facturaId = this.getAttribute('data-id');
            mostrarDetallesFactura(facturaId);
        });
    });
}

// Función para mostrar detalles de factura (sin cambios)
function mostrarDetallesFactura(facturaId) {
    fetch(`${apiUrl}/${facturaId}/detalles`)
        .then(response => response.json())
        .then(detalles => {
            const detallesBody = document.getElementById('detallesFacturaBody');
            detallesBody.innerHTML = '';

            detalles.forEach(detalle => {
                const fila = `
                    <tr>
                        <td>${detalle.nombreProducto}</td>
                        <td>${detalle.descripcion}</td>
                        <td>${detalle.cantidad}</td>
                        <td>${detalle.garantia}</td>
                        <td>${formatNumber(detalle.precioCompra)}</td>
                        <td>${formatNumber(detalle.precioVenta)}</td>  
                        <td style="color: #0db423; font-weight: bold">${formatNumber(detalle.cantidad * detalle.precioCompra)}</td>
                        <td style="color: #48e; font-weight: bold">${formatNumber(detalle.cantidad * detalle.precioVenta)}</td>
                    </tr>
                `;
                detallesBody.innerHTML += fila;
            });

            $('#detalleFacturaModal').modal('show');
        })
        .catch(error => {
            console.error('Error al obtener los detalles de la factura:', error);
            alert('Error al cargar los detalles de la factura.');
        });
}