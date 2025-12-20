// API URL
const apiPrestamos = 'http://localhost:8082/api/prestamos';

// Variables globales
let prestamosData = [];
let prestamoSeleccionado = null;
let abonosData = [];
let productosPrestamoData = [];

// Cargar préstamos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarPrestamos();
    cargarResumen();
});

// Cargar lista de préstamos según filtros
function cargarPrestamos() {
    const tipo = document.getElementById('filtroTipo').value;
    const estado = document.getElementById('filtroEstado').value;

    // Si se filtra por PAGADO, cargar todos y filtrar en frontend (incluye PAGADO y CANCELADO)
    let url = apiPrestamos;

    if (estado && estado !== 'PAGADO') {
        url = `${apiPrestamos}/estado/${estado}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Si el filtro es PAGADO, incluir tanto PAGADO como CANCELADO
            if (estado === 'PAGADO') {
                data = data.filter(p => p.estado === 'PAGADO' || p.estado === 'CANCELADO');
            }

            // Filtrar por tipo si está seleccionado
            if (tipo) {
                data = data.filter(p => p.tipo === tipo);
            }

            prestamosData = data;
            renderizarPrestamos(data);
            actualizarContadores(data);
        })
        .catch(error => {
            console.error('Error al cargar préstamos:', error);
        });
}

// Cargar resumen general
function cargarResumen() {
    fetch(`${apiPrestamos}/pendientes`)
        .then(response => response.json())
        .then(data => {
            const prestamos = data.filter(p => p.tipo === 'PRESTAMO');
            const apartados = data.filter(p => p.tipo === 'APARTADO');

            document.getElementById('totalPrestamosPendientes').textContent = prestamos.length;
            document.getElementById('totalApartadosPendientes').textContent = apartados.length;

            const totalPorCobrar = data.reduce((sum, p) => sum + p.saldoPendiente, 0);
            const totalAbonado = data.reduce((sum, p) => sum + p.totalAbonado, 0);

            document.getElementById('totalPorCobrar').textContent = `$${totalPorCobrar.toLocaleString('es-CO')}`;
            document.getElementById('totalAbonado').textContent = `$${totalAbonado.toLocaleString('es-CO')}`;
        })
        .catch(error => {
            console.error('Error al cargar resumen:', error);
        });
}

// Renderizar tarjetas de préstamos
function renderizarPrestamos(prestamos) {
    const container = document.getElementById('listaPrestamos');
    const sinPrestamos = document.getElementById('sinPrestamos');

    if (prestamos.length === 0) {
        container.innerHTML = '';
        sinPrestamos.style.display = 'block';
        return;
    }

    sinPrestamos.style.display = 'none';

    container.innerHTML = prestamos.map(prestamo => {
        const porcentaje = prestamo.total > 0 ? Math.round((prestamo.totalAbonado / prestamo.total) * 100) : 0;
        const fecha = new Date(prestamo.fechaCreacion).toLocaleDateString('es-CO');

        const badgeTipo = prestamo.tipo === 'PRESTAMO'
            ? '<span class="badge badge-prestamo">Préstamo</span>'
            : '<span class="badge badge-apartado">Apartado</span>';

        let badgeEstado = '';
        switch (prestamo.estado) {
            case 'PENDIENTE': badgeEstado = '<span class="badge badge-pendiente">Pendiente</span>'; break;
            case 'PAGADO':
            case 'CANCELADO':
                badgeEstado = '<span class="badge badge-pagado">Pagado</span>';
                break;
            case 'ANULADO': badgeEstado = '<span class="badge badge-anulado">Anulado</span>'; break;
        }

        // Si está pagado o facturado, mostrar barra al 100%
        const porcentajeMostrar = (prestamo.estado === 'CANCELADO' || prestamo.estado === 'PAGADO') ? 100 : porcentaje;

        return `
            <div class="col-md-4 mb-3">
                <div class="card card-prestamo" onclick="verDetalle(${prestamo.id})">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${prestamo.serial}</h6>
                            <div>${badgeTipo} ${badgeEstado}</div>
                        </div>
                        <p class="card-text mb-1">
                            <strong>${prestamo.clienteNombre}</strong>
                        </p>
                        <p class="card-text text-muted mb-2" style="font-size: 12px;">
                            ${fecha}
                        </p>
                        <div class="progress mb-2" style="height: 20px;">
                            <div class="progress-bar bg-success" style="width: ${porcentajeMostrar}%">${porcentajeMostrar}%</div>
                        </div>
                        <div class="d-flex justify-content-between">
                            <small>Abonado: <span class="text-success">$${prestamo.totalAbonado.toLocaleString('es-CO')}</span></small>
                            <small>Pendiente: <span class="text-danger">$${prestamo.saldoPendiente.toLocaleString('es-CO')}</span></small>
                        </div>
                        <p class="mb-0 mt-2 text-right">
                            <strong>Total: $${prestamo.total.toLocaleString('es-CO')}</strong>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Actualizar contadores
function actualizarContadores(prestamos) {
    // Los contadores se actualizan en cargarResumen()
}

// Filtrar por cliente
function filtrarPorCliente() {
    const busqueda = document.getElementById('buscarCliente').value.toLowerCase().trim();

    if (!busqueda) {
        renderizarPrestamos(prestamosData);
        return;
    }

    const filtrados = prestamosData.filter(p =>
        p.clienteNombre.toLowerCase().includes(busqueda) ||
        (p.cliente && p.cliente.identificacion && p.cliente.identificacion.includes(busqueda))
    );

    renderizarPrestamos(filtrados);
}

// Ver detalle de un préstamo
function verDetalle(id) {
    fetch(`${apiPrestamos}/${id}`)
        .then(response => response.json())
        .then(prestamo => {
            prestamoSeleccionado = prestamo;

            // Llenar datos básicos
            document.getElementById('detalleSerial').textContent = prestamo.serial;
            document.getElementById('detalleCliente').textContent = prestamo.clienteNombre;
            document.getElementById('detalleFecha').textContent = new Date(prestamo.fechaCreacion).toLocaleString('es-CO');
            document.getElementById('detalleTotal').textContent = `$${prestamo.total.toLocaleString('es-CO')}`;
            document.getElementById('detalleAbonado').textContent = `$${prestamo.totalAbonado.toLocaleString('es-CO')}`;
            document.getElementById('detallePendiente').textContent = `$${prestamo.saldoPendiente.toLocaleString('es-CO')}`;

            // Barra de progreso - Si está pagado o facturado, mostrar al 100%
            const porcentaje = prestamo.total > 0 ? Math.round((prestamo.totalAbonado / prestamo.total) * 100) : 0;
            const porcentajeMostrar = (prestamo.estado === 'CANCELADO' || prestamo.estado === 'PAGADO') ? 100 : porcentaje;
            const barra = document.getElementById('barraProgreso');
            barra.style.width = `${porcentajeMostrar}%`;
            barra.textContent = `${porcentajeMostrar}%`;

            // Observaciones
            if (prestamo.observaciones) {
                document.getElementById('detalleObservaciones').textContent = prestamo.observaciones;
                document.getElementById('detalleObservacionesContainer').style.display = 'block';
            } else {
                document.getElementById('detalleObservacionesContainer').style.display = 'none';
            }

            // Título del modal
            const tipoTexto = prestamo.tipo === 'PRESTAMO' ? 'Préstamo' : 'Apartado';
            document.getElementById('modalPrestamoTitulo').textContent = `Detalle del ${tipoTexto} - ${prestamo.serial}`;

            // Cargar productos
            cargarProductosPrestamo(id);

            // Cargar abonos
            cargarAbonosPrestamo(id);

            // Mostrar/ocultar botones según estado
            const formAbono = document.getElementById('formAbonoContainer');
            const btnConvertir = document.getElementById('btnConvertirFactura');
            const btnAnular = document.getElementById('btnAnular');

            if (prestamo.estado === 'PENDIENTE') {
                formAbono.style.display = 'block';
                btnConvertir.style.display = 'inline-block';
                btnAnular.style.display = 'inline-block';
            } else {
                formAbono.style.display = 'none';
                btnConvertir.style.display = 'none';
                btnAnular.style.display = 'none';
            }

            // Mostrar modal
            $('#modalDetallePrestamo').modal('show');
        })
        .catch(error => {
            console.error('Error al cargar detalle:', error);
            mostrarToast('error', 'Error al cargar el detalle del préstamo.');
        });
}

// Cargar productos del préstamo
function cargarProductosPrestamo(id) {
    fetch(`${apiPrestamos}/${id}/detalles`)
        .then(response => response.json())
        .then(detalles => {
            // Guardar para impresión
            productosPrestamoData = detalles;

            const tbody = document.getElementById('tablaProductosPrestamo');
            tbody.innerHTML = detalles.map(d => `
                <tr>
                    <td>${d.nombreProducto || 'N/A'}</td>
                    <td>${d.cantidad}</td>
                    <td>$${d.precioVenta.toLocaleString('es-CO')}</td>
                    <td>$${(d.cantidad * d.precioVenta).toLocaleString('es-CO')}</td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
        });
}

// Cargar abonos del préstamo
function cargarAbonosPrestamo(id) {
    fetch(`${apiPrestamos}/${id}/abonos`)
        .then(response => response.json())
        .then(abonos => {
            const tbody = document.getElementById('tablaAbonosPrestamo');

            if (abonos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sin abonos registrados</td></tr>';
                return;
            }

            // Guardar abonos para impresión
            abonosData = abonos;

            tbody.innerHTML = abonos.map((a, index) => `
                <tr>
                    <td>${new Date(a.fechaAbono).toLocaleString('es-CO')}</td>
                    <td class="text-success">$${a.monto.toLocaleString('es-CO')}</td>
                    <td>${a.metodoPago || 'N/A'}</td>
                    <td>${a.observacion || '-'}</td>
                    <td><button class="btn btn-sm btn-outline-info" onclick="imprimirRecibo(${index})">Imprimir</button></td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error al cargar abonos:', error);
        });
}

// Registrar un nuevo abono
function registrarAbono() {
    if (!prestamoSeleccionado) return;

    const montoInput = document.getElementById('montoAbono').value.replace(/\./g, '').replace(/,/g, '');
    const monto = parseFloat(montoInput);
    const metodoPago = document.getElementById('metodoAbono').value;
    const observacion = document.getElementById('observacionAbono').value.trim();

    if (!monto || monto <= 0) {
        mostrarToast('error', 'El monto del abono debe ser mayor a cero.');
        return;
    }

    if (monto > prestamoSeleccionado.saldoPendiente) {
        mostrarToast('error', 'El monto del abono no puede ser mayor al saldo pendiente.');
        return;
    }

    const abono = {
        prestamoId: prestamoSeleccionado.id,
        monto: monto,
        metodoPago: metodoPago,
        observacion: observacion || null
    };

    fetch(`${apiPrestamos}/abono`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(abono)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            if (data.estado === 'PAGADO') {
                mensaje += '. El préstamo ha sido completamente pagado y convertido a factura.';
            }
            mostrarToast('success', 'Abono registrado exitosamente');


            // Limpiar formulario
            document.getElementById('montoAbono').value = '';
            document.getElementById('observacionAbono').value = '';

            // Recargar detalle
            verDetalle(prestamoSeleccionado.id);

            // Recargar lista y resumen
            cargarPrestamos();
            cargarResumen();
        })
        .catch(error => {
            console.error('Error al registrar abono:', error);
            mostrarToast('error', 'Error al registrar el abono: ' + error.message);
        });
}

// Convertir préstamo a factura
function convertirAFactura() {
    if (!prestamoSeleccionado) return;

    mostrarConfirmacionToast({
        mensaje: '¿Está seguro de convertir este préstamo a factura? Esta acción no se puede deshacer.',
        onAceptar: () => {
            fetch(`${apiPrestamos}/${prestamoSeleccionado.id}/convertir-factura`, {
                method: 'POST'
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => { throw new Error(text); });
                    }
                    return response.json();
                })
                .then(factura => {
                    mostrarToast('success', `Factura #${factura.serial} generada exitosamente. El préstamo ha sido marcado como PAGADO.`);
                    $('#modalDetallePrestamo').modal('hide');
                    cargarPrestamos();
                    cargarResumen();
                })
                .catch(error => {
                    console.error('Error al convertir a factura:', error);
                    mostrarToast('error', 'Error al convertir a factura: ' + error.message);
                });
        },
        onCancelar: () => { },
        textoAceptar: 'Sí, convertir',
        textoCancelar: 'Cancelar'
    });
}

// Anular préstamo
function anularPrestamo() {
    if (!prestamoSeleccionado) return;

    mostrarConfirmacionToast({
        mensaje: '¿Está seguro de anular este préstamo? Los productos volverán al inventario. Esta acción no se puede deshacer.',
        onAceptar: () => {
            fetch(`${apiPrestamos}/${prestamoSeleccionado.id}/anular`, {
                method: 'POST'
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => { throw new Error(text); });
                    }
                    return response.json();
                })
                .then(data => {
                    mostrarToast('success', 'Préstamo anulado. Los productos han sido devueltos al inventario.');
                    $('#modalDetallePrestamo').modal('hide');
                    cargarPrestamos();
                    cargarResumen();
                })
                .catch(error => {
                    console.error('Error al anular préstamo:', error);
                    mostrarToast('error', 'Error al anular el préstamo: ' + error.message);
                });
        },
        onCancelar: () => { },
        textoAceptar: 'Sí, anular',
        textoCancelar: 'Cancelar'
    });
}

// Imprimir documento de préstamo/apartado en formato POS
function imprimirPrestamo() {
    if (!prestamoSeleccionado) return;

    const fechaActual = new Date(prestamoSeleccionado.fechaCreacion).toLocaleString('es-CO');

    // Generar filas de productos para POS
    const productosHTML = productosPrestamoData.map(p => `
        <tr style="font-size: 11px;">
            <td style="padding: 2px 0; text-align: left; max-width: 20mm; word-wrap: break-word;">${p.nombreProducto || 'N/A'}</td>
            <td style="text-align: center;">${p.cantidad}</td>
            <td style="text-align: center;">${p.precioVenta.toLocaleString('es-CO')}</td>
            <td style="text-align: center;">${(p.cantidad * p.precioVenta).toLocaleString('es-CO')}</td>
        </tr>
    `).join('');

    const htmlPrestamoPOS = generarPrestamoHTMLPOS({
        prestamoId: prestamoSeleccionado.serial,
        tipoDocumento: prestamoSeleccionado.tipo,
        nombreCliente: prestamoSeleccionado.clienteNombre,
        cedulaNit: prestamoSeleccionado.cliente?.identificacion || 'N/A',
        telefonoCliente: prestamoSeleccionado.cliente?.telefono || null,
        productosHTML: productosHTML,
        totalPrestamo: prestamoSeleccionado.total,
        totalAbonado: prestamoSeleccionado.totalAbonado,
        saldoPendiente: prestamoSeleccionado.saldoPendiente,
        fechaActual: fechaActual,
        observaciones: prestamoSeleccionado.observaciones
    });

    const ventana = window.open('', '', 'height=900,width=300');
    ventana.document.write(`
        <html>
        <head>
            <title>Préstamo POS</title>
            <style>
                @page { margin: 0; padding: 0 }
                body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #000 !important; }
            </style>
        </head>
        <body>
            ${htmlPrestamoPOS}
        </body>
        </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
}

// Imprimir documento de préstamo/apartado en formato PDF
function imprimirPrestamoPDF() {
    if (!prestamoSeleccionado) return;

    const fechaActual = new Date(prestamoSeleccionado.fechaCreacion).toLocaleString('es-CO');

    // Generar filas de productos para PDF
    const productosHTML = productosPrestamoData.map(p => `
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${p.nombreProducto || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${p.cantidad}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${p.precioVenta.toLocaleString('es-CO')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${p.garantia || '1 Mes'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${p.descripcion || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(p.cantidad * p.precioVenta).toLocaleString('es-CO')}</td>
        </tr>
    `).join('');

    // Generar filas de abonos para PDF
    const abonosHTML = abonosData.length > 0 ? abonosData.map(a => `
        <tr>
            <td style="border: 1px solid #ddd; padding: 6px;">${new Date(a.fechaAbono).toLocaleString('es-CO')}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: right; color: green;">$${a.monto.toLocaleString('es-CO')}</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${a.metodoPago || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${a.observacion || '-'}</td>
        </tr>
    `).join('') : '';

    const htmlPrestamoPDF = generarPrestamoHTMLPDF({
        prestamoId: prestamoSeleccionado.serial,
        tipoDocumento: prestamoSeleccionado.tipo,
        nombreCliente: prestamoSeleccionado.clienteNombre,
        cedulaNit: prestamoSeleccionado.cliente?.identificacion || 'N/A',
        telefonoCliente: prestamoSeleccionado.cliente?.telefono || null,
        correoCliente: prestamoSeleccionado.cliente?.correo || null,
        direccionCliente: prestamoSeleccionado.cliente?.direccion || null,
        productosHTML: productosHTML,
        totalPrestamo: prestamoSeleccionado.total,
        totalAbonado: prestamoSeleccionado.totalAbonado,
        saldoPendiente: prestamoSeleccionado.saldoPendiente,
        fechaActual: fechaActual,
        observaciones: prestamoSeleccionado.observaciones,
        abonosHTML: abonosHTML
    });

    const ventana = window.open('', '', 'height=1200,width=800');
    ventana.document.write(`
        <html>
        <head>
            <title>Préstamo PDF</title>
            <style>
                body { font-family: Helvetica, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            ${htmlPrestamoPDF}
        </body>
        </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
}

// Imprimir recibo de abono en formato POS
function imprimirRecibo(index) {
    if (!prestamoSeleccionado || !abonosData[index]) return;

    const abono = abonosData[index];
    const fechaAbono = new Date(abono.fechaAbono).toLocaleString('es-CO');
    const numeroRecibo = index + 1;

    const htmlAbonoPOS = generarAbonoHTMLPOS({
        prestamoId: prestamoSeleccionado.serial,
        tipoDocumento: prestamoSeleccionado.tipo,
        nombreCliente: prestamoSeleccionado.clienteNombre,
        cedulaNit: prestamoSeleccionado.cliente?.identificacion || 'N/A',
        montoAbono: abono.monto,
        metodoPago: abono.metodoPago,
        observacion: abono.observacion,
        totalPrestamo: prestamoSeleccionado.total,
        totalAbonado: prestamoSeleccionado.totalAbonado,
        saldoPendiente: prestamoSeleccionado.saldoPendiente,
        fechaAbono: fechaAbono,
        numeroAbono: numeroRecibo
    });

    const ventana = window.open('', '', 'height=600,width=300');
    ventana.document.write(`
        <html>
        <head>
            <title>Recibo de Abono</title>
            <style>
                @page { margin: 0; padding: 0 }
                body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #000 !important; }
            </style>
        </head>
        <body>
            ${htmlAbonoPOS}
        </body>
        </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
}
