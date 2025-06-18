const apiUrl = 'http://localhost:8082/api/facturas';
let vistaAgrupada = true; // Estado inicial: vista agrupada

document.addEventListener('DOMContentLoaded', function () {
    obtenerFacturas();

    // Configurar el botón de toggle
    document.getElementById('toggleVistaBtn').addEventListener('click', function () {
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
        <div class="col-md-12">
            <thead>
                <tr>
                    <th class="col-md-1">Factura ID</th>
                    <th class="col-md-1">Cliente</th>
                    <th class="col-md-1">Cédula/NIT</th>
                    <th class="col-md-1">Hora</th>
                    <th class="col-md-1">Total</th>
                    <th class="col-md-1">Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${facturasPorFecha[fechaKey].map(crearFilaFactura).join('')}
            </tbody>
        </div>`;

        grupoFecha.appendChild(tabla);
        ventasContainer.appendChild(grupoFecha);
    });

    configurarBotonesDetalles();
}

// Función para mostrar ventas en lista normal
function mostrarVentasNormales(facturas) {
    const ventasContainer = document.getElementById('ventasContainer');
    ventasContainer.innerHTML = `
    <div class="col-md-12">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th class="col-md-1">Factura ID</th>
                    <th class="col-md-1">Cliente</th>
                    <th class="col-md-1">Cédula/NIT</th>
                    <th class="col-md-1">Fecha y Hora</th>
                    <th class="col-md-1">Total</th>
                    <th class="col-md-1">Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${facturas.map(crearFilaFactura).join('')}
            </tbody>
        </table>
    </div>
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

                <button class="btn btn-success btn-sm btn-imprimir-factura" data-id="${factura.id}" data-toggle="modal" data-target="#imprimirFacturaModal">
                    Imprimir
                </button>
            </td>
        </tr>
    `;
}

// Función para configurar los botones de detalles
function configurarBotonesDetalles() {
    document.querySelectorAll('.btn-ver-detalles').forEach(button => {
        button.addEventListener('click', function () {
            const facturaId = this.getAttribute('data-id');
            mostrarDetallesFactura(facturaId);
        });
    });

    // Agrega este código para configurar los botones de imprimir
    document.querySelectorAll('.btn-imprimir-factura').forEach(button => {
        button.addEventListener('click', function () {
            const facturaId = this.getAttribute('data-id');
            // Configura el data-id en los botones del modal
            document.getElementById('btnImprimirPDF').setAttribute('data-id', facturaId);
            document.getElementById('btnImprimirPOS').setAttribute('data-id', facturaId);
        });
    });
}

// Modifica las funciones de previsualización así:
function previsualizarFacturaPDF(facturaId) {
    // Convertir facturaId a número si es necesario (depende de tu API)
    facturaId = Number(facturaId);

    const factura = window.facturas.find(f => f.id === facturaId);

    if (!factura) {
        console.error('Factura no encontrada');
        return;
    }

    // Verificar si la factura tiene cliente
    if (!factura.cliente) {
        console.error('La factura no tiene información de cliente');
        // Puedes asignar valores por defecto o mostrar un mensaje al usuario
        factura.cliente = {
            nombre: 'Cliente no disponible',
            identificacion: 'N/A',
            telefono: '',
            correo: '',
            direccion: ''
        };
    }

    console.log('Datos de factura para PDF:', factura);

    fetch(`${apiUrl}/${facturaId}/detalles`)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener detalles');
            return response.json();
        })
        .then(detalles => {
            const htmlFacturaPDF = generarFacturaHTMLPDF({
                nombreCliente: factura.cliente.nombre,
                cedulaNit: factura.cliente.identificacion,
                telefonoCliente: factura.cliente.telefono || 'N/A',
                correoCliente: factura.cliente.correo || 'N/A',
                direccionCliente: factura.cliente.direccion || 'N/A',
                productosHTML: detalles.map(detalle => generarFilaProductoHTML(detalle)).join(''),
                totalFactura: factura.total,
                fechaActual: formatearFecha(new Date(factura.fechaEmision))
            });

            const ventanaImpresion = window.open('', '_blank', 'height=1200,width=800');
            ventanaImpresion.document.write(htmlFacturaPDF);
            ventanaImpresion.document.close();
            // Esperar a que cargue el contenido antes de imprimir
            ventanaImpresion.onload = function () {
                ventanaImpresion.focus();
                ventanaImpresion.print();
            };
        })
        .catch(error => {
            console.error('Error al obtener la factura:', error);
            alert('Error al generar el PDF: ' + error.message);
        });
}

document.getElementById('btnImprimirPDF').addEventListener('click', function () {
    const facturaId = this.getAttribute('data-id');
    previsualizarFacturaPDF(facturaId);
});

document.getElementById('btnImprimirPOS').addEventListener('click', function () {
    const facturaId = this.getAttribute('data-id');
    previsualizarFacturaPOS(facturaId);
});

function previsualizarFacturaPOS(facturaId) {
    // Convertir facturaId a número si es necesario
    facturaId = Number(facturaId);

    const factura = window.facturas.find(f => f.id === facturaId);

    if (!factura) {
        console.error('Factura no encontrada');
        return;
    }

    // Manejar facturas sin cliente
    if (!factura.cliente) {
        factura.cliente = {
            nombre: 'CLIENTE NO REGISTRADO',
            identificacion: 'N/A',
            telefono: '',
            correo: '',
            direccion: ''
        };
    }

    console.log('Datos de factura para POS:', factura);

    fetch(`${apiUrl}/${facturaId}/detalles`)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener detalles');
            return response.json();
        })
        .then(detalles => {
            const htmlFacturaPOS = generarFacturaHTMLPOS({
                nombreCliente: factura.cliente.nombre,
                cedulaNit: factura.cliente.identificacion,
                telefonoCliente: factura.cliente.telefono || '',
                correoCliente: factura.cliente.correo || '',
                direccionCliente: factura.cliente.direccion || '',
                productosHTML: detalles.map(detalle => generarFilaProductoHTMLPOS(detalle)).join(''),
                totalFactura: factura.total,
                fechaActual: formatearFecha(new Date(factura.fechaEmision))
            });

            const ventanaImpresion = window.open('', '_blank', 'height=900,width=300');
            ventanaImpresion.document.write(htmlFacturaPOS);
            ventanaImpresion.document.close();
            // Esperar a que cargue el contenido antes de imprimir
            ventanaImpresion.onload = function () {
                ventanaImpresion.focus();
                ventanaImpresion.print();
            };
        })
        .catch(error => {
            console.error('Error al obtener la factura:', error);
            alert('Error al generar el ticket POS: ' + error.message);
        });
}

function generarFilaProductoHTML(detalle) {
    return `
        <tr>
            <td>${detalle.nombreProducto}</td>
            <td>${detalle.cantidad}</td>
            <td>${formatNumber(detalle.precioVenta)}</td>
            <td>${detalle.garantia}</td>
            <td>${detalle.descripcion}</td>
            <td>${formatNumber(detalle.cantidad * detalle.precioVenta)}</td>
        </tr>
    `;
}

function generarFilaProductoHTMLPOS(detalle) {
    return `
        <tr style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; color: #000">
            <td style="padding: 1px 0; text-align: left; max-width: 20mm; word-wrap: break-word;">${detalle.nombreProducto.toUpperCase()} - ${detalle.descripcion || ''}</td>
            <td style="padding: 1px 0; text-align: center; max-width: 10mm;">${detalle.cantidad}</td>
            <td style="padding: 1px 0; text-align: center; max-width: 15mm;">${formatNumber(detalle.precioVenta)}</td>
            <td style="padding: 1px 0; text-align: center; max-width: 15mm;">${detalle.garantia} Mes</td>
           <td style="padding: 1px 0; text-align: center;">${formatNumber(detalle.cantidad * detalle.precioVenta)}</td>
        </tr>
    `;
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
                        <td onclick="copiarAlPortapapeles(event)" style="cursor: pointer;">${detalle.nombreProducto}</td>
                        <td onclick="copiarAlPortapapeles(event)" style="cursor: pointer;">${detalle.descripcion}</td>
                        <td onclick="copiarAlPortapapeles(event)" style="cursor: pointer;">${detalle.cantidad}</td>
                        <td onclick="copiarAlPortapapeles(event)" style="cursor: pointer;">${detalle.garantia}</td>
                        <td onclick="copiarAlPortapapeles(event)" style="cursor: pointer;">${formatNumber(detalle.precioCompra)}</td>
                        <td onclick="copiarAlPortapapeles(event)" style="cursor: pointer;">${formatNumber(detalle.precioVenta)}</td>  
                        <td style="color: #0db423; font-weight: bold; cursor: pointer;" onclick="copiarAlPortapapeles(event)">${formatNumber(detalle.cantidad * detalle.precioCompra)}</td>
                        <td style="color: #48e; font-weight: bold; cursor: pointer;" onclick="copiarAlPortapapeles(event)">${formatNumber(detalle.cantidad * detalle.precioVenta)}</td>
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

function copiarAlPortapapeles(event) {
    const texto = event.target.textContent;
    navigator.clipboard.writeText(texto)
        .then(() => {            
            const div = document.createElement('div');
            div.style.position = 'fixed';
            div.style.top = '50%';
            div.style.left = '50%';
            div.style.transform = 'translate(-50%, -50%)';
            div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            div.style.padding = '5px';
            div.style.borderRadius = '5px';
            div.style.color = '#fff';
            div.textContent = 'Copiado al portapapeles';
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 1500);
        })
        .catch(error => {
            console.error('Error al copiar al portapapeles:', error);
        });
}