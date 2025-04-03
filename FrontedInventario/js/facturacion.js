const apiClient = 'http://localhost:8082/cliente';
const apiProducto = 'http://localhost:8082/producto'

let productosFiltrados = [];
let productosEnFactura = [];
let totalFacturaGlobal = 0;
let productoSeleccionadoId = null;
let detalles = [];

document.addEventListener('DOMContentLoaded', () => {
    const agregarProductoBtn = document.getElementById('agregarProductoBtn');
    if (agregarProductoBtn) agregarProductoBtn.addEventListener('click', agregarProducto);

    const guardarFacturaBtn = document.getElementById('guardarFacturaBtn');
    if (guardarFacturaBtn) guardarFacturaBtn.addEventListener('click', guardarFactura);

    const limpiarFormularioBtn = document.getElementById('limpiarFormularioBtn');
    if (limpiarFormularioBtn) limpiarFormularioBtn.addEventListener('click', limpiarFormulario);
});

// Función para cargar los datos de cliente desde localStorage al cargar la página
window.addEventListener('load', () => {
    const nombreCliente = localStorage.getItem('nombreCliente');
    const cedulaNit = localStorage.getItem('cedulaNit');
    const correoCliente = localStorage.getItem('correoCliente');
    const telefonoCliente = localStorage.getItem('telefonoCliente');
    const direccionCliente = localStorage.getItem('direccionCliente');

    // Solo asignar si el valor no es null o undefined
    if (nombreCliente !== null && nombreCliente !== "null") document.getElementById('nombreCliente').value = nombreCliente;
    if (cedulaNit !== null && cedulaNit !== "null") document.getElementById('cedulaNit').value = cedulaNit;
    if (correoCliente !== null && correoCliente !== "null") document.getElementById('correoCliente').value = correoCliente;
    if (telefonoCliente !== null && telefonoCliente !== "null") document.getElementById('telefonoCliente').value = telefonoCliente;
    if (direccionCliente !== null && direccionCliente !== "null") document.getElementById('direccionCliente').value = direccionCliente;

    // Limpiar datos de cliente en `localStorage` después de 2 minutos
    setTimeout(() => {
        localStorage.removeItem('nombreCliente');
        localStorage.removeItem('cedulaNit');
        localStorage.removeItem('correoCliente');
        localStorage.removeItem('telefonoCliente');
        localStorage.removeItem('direccionCliente');
        console.log('Datos de cliente eliminados de localStorage después de 20 minutos.');
    }, 20 * 60 * 1000);
});

window.addEventListener('load', () => {
    const storedProducts = localStorage.getItem('productosEnFactura');
    if (storedProducts) {
        productosEnFactura = JSON.parse(storedProducts);

        productosEnFactura.forEach(producto => {
            const tbody = document.getElementById('productosTabla').getElementsByTagName('tbody')[0];
            const newRow = tbody.insertRow();

            // Agregar cada celda de la misma forma que en agregarProducto
            const cellId = newRow.insertCell(0);
            cellId.textContent = producto.id || 'N/A';
            cellId.style.display = 'none';

            const cellNombre = newRow.insertCell(1);
            const cellCantidad = newRow.insertCell(2);
            const cellPrecioUnitario = newRow.insertCell(3);
            const cellGarantia = newRow.insertCell(4);
            const cellDescripcion = newRow.insertCell(5);
            const cellTotal = newRow.insertCell(6);
            const cellAcciones = newRow.insertCell(7);

            cellNombre.textContent = producto.nombre;
            cellCantidad.textContent = producto.cantidad;
            cellPrecioUnitario.textContent = producto.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0 });
            cellGarantia.textContent = producto.garantia;
            cellDescripcion.textContent = producto.descripcion;
            cellTotal.textContent = producto.total.toLocaleString('es-CO', { minimumFractionDigits: 0 });

            //Boton de Eliminar
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.addEventListener('click', () => {
                const row = deleteBtn.closest('tr');
                const index = Array.from(tbody.rows).indexOf(row);
                tbody.deleteRow(index);

                // Restar el total del producto eliminado
                totalFacturaGlobal -= productosEnFactura[index].total;
                productosEnFactura.splice(index, 1);

                // Actualizar en localStorage
                localStorage.setItem('productosEnFactura', JSON.stringify(productosEnFactura));

                actualizarTotalFactura();
            });
            cellAcciones.appendChild(deleteBtn);

            // Agregar el precio de cada producto al total
            totalFacturaGlobal += producto.total;
        });

        // Actualizar total de factura en el DOM
        actualizarTotalFactura();

        setTimeout(() => {
            localStorage.removeItem('productosEnFactura');
            console.log('Productos en factura eliminados de localStorage después de 20 minutos.');
        }, 20 * 60 * 1000); // 8 minutos en milisegundos
    }
});

// Escucha de cambios en los campos del formulario para almacenar en localStorage
document.getElementById('nombreCliente').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    localStorage.setItem('nombreCliente', query ? query : "");

    if (query.length > 1) {
        obtenerSugerencias(query);
    } else {
        document.getElementById('sugerenciasClientes').style.display = 'none';
    }
});

document.getElementById('cedulaNit').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    localStorage.setItem('cedulaNit', query ? query : "");

    if (query.length > 1) {
        obtenerSugerencias(query);
    } else {
        document.getElementById('sugerenciasClientes').style.display = 'none';
    }
});

document.getElementById('correoCliente').addEventListener('input', (e) => {
    localStorage.setItem('correoCliente', e.target.value.trim() ? e.target.value.trim() : "");
});

document.getElementById('telefonoCliente').addEventListener('input', (e) => {
    localStorage.setItem('telefonoCliente', e.target.value.trim() ? e.target.value.trim() : "");
});

document.getElementById('direccionCliente').addEventListener('input', (e) => {
    localStorage.setItem('direccionCliente', e.target.value.trim() ? e.target.value.trim() : "");
});


// Función para obtener sugerencias
function obtenerSugerencias(query) {
    fetch(`${apiClient}/suggestions?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(clientes => {
            mostrarSugerencias(clientes);
        })
        .catch(error => {
            console.error('Error al obtener sugerencias:', error);
        });
}

// Función para mostrar sugerencias
function mostrarSugerencias(clientes) {
    const sugerenciasDiv = document.getElementById('sugerenciasClientes');
    sugerenciasDiv.innerHTML = '';

    if (clientes.length === 0) {
        sugerenciasDiv.style.display = 'none';
        return;
    }

    clientes.forEach(cliente => {
        const li = document.createElement('li');
        li.textContent = cliente.nombre.toUpperCase();
        li.style.padding = '8px';
        li.style.cursor = 'pointer';
        li.classList.add('hover-effect');

        li.addEventListener('click', () => {
            document.getElementById('nombreCliente').value = cliente.nombre.toUpperCase();
            document.getElementById('cedulaNit').value = cliente.identificacion;
            document.getElementById('correoCliente').value = cliente.correo;
            document.getElementById('telefonoCliente').value = cliente.telefono;
            document.getElementById('direccionCliente').value = cliente.direccion;

            // Guardar datos seleccionados en localStorage
            localStorage.setItem('nombreCliente', cliente.nombre);
            localStorage.setItem('cedulaNit', cliente.identificacion);
            localStorage.setItem('correoCliente', cliente.correo);
            localStorage.setItem('telefonoCliente', cliente.telefono);
            localStorage.setItem('direccionCliente', cliente.direccion);

            sugerenciasDiv.style.display = 'none';
        });

        sugerenciasDiv.appendChild(li);
    });
    sugerenciasDiv.style.display = 'block';
}


// Función para buscar productos y mostrar sugerencias
function buscarProductos() {
    const nombreProducto = document.getElementById('nombreProductoManual').value.trim();

    if (nombreProducto.length < 2) {
        // Oculta la lista si el texto es menor a 2 caracteres
        document.getElementById('sugerenciasProductos').style.display = 'none';
        return;
    }

    // Llama al endpoint de búsqueda de productos
    fetch(`${apiProducto}/buscar?query=${encodeURIComponent(nombreProducto)}`)
        .then(response => {
            if (!response.ok) {
                mostrarMensajeError('Error en la red');
            }
            return response.json();
        })
        .then(data => {
            const sugerencias = document.getElementById('sugerenciasProductos');
            sugerencias.innerHTML = ''; // Limpiar sugerencias anteriores

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(producto => {
                    const li = document.createElement('li');
                    li.innerHTML = producto.nombre.toUpperCase() +
                        "<i> || P.C <span style='color: red;'>$ " + formatNumber(producto.precioComprado) + "</span></i>" +
                        "<i> || P.V $ " + formatNumber(producto.precioVendido) + "</i>";
                    li.style.cursor = 'pointer';
                    li.classList.add('hover-effect');

                    // Evento al hacer clic en la sugerencia
                    li.onclick = () => {
                        productoSeleccionadoId = producto.id;
                        seleccionarProducto(producto); // Llama a la función para mostrar los detalles
                    };

                    sugerencias.appendChild(li);
                });
                sugerencias.style.display = 'block';
            } else {
                sugerencias.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

// Agregar evento para el campo de producto
document.getElementById('nombreProductoManual').addEventListener('input', buscarProductos);

// Función para seleccionar un producto de la lista de sugerencias
function seleccionarProducto(producto) {
    document.getElementById('nombreProductoManual').value = producto.nombre;
    document.getElementById('precioUnitarioManual').value = formatNumber(producto.precioVendido);
    document.getElementById('PCProducto').value = producto.precioComprado;
    document.getElementById('sugerenciasProductos').style.display = 'none';

    productoSeleccionadoId = producto.id;

    // Ajusta el máximo permitido en el campo de cantidad
    const inputCantidad = document.getElementById('cantidadProductoManual');
    inputCantidad.max = producto.cantidad;

    // Mostrar un mensaje al usuario sobre el stock máximo
    document.getElementById('mensajeMaxCantidad').innerText =
        `Cantidad máxima disponible: ${producto.cantidad}`;
}

// Agregar evento para el campo de producto
document.getElementById('nombreProductoManual').addEventListener('input', buscarProductos);

// Función para agregar detalles
function agregarDetalle(detalle) {
    detalles.push(detalle); // Agrega detalles a la lista
}

function mostrarConfirmacionProducto(callbackAceptar) {
    const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
    const btnAceptar = document.getElementById('btnAceptar');

    // Configura el botón Aceptar para ejecutar la acción especificada en el callback
    btnAceptar.onclick = () => {
        cerrarConfirmacion();
        callbackAceptar();
    };

    mensajeConfirmacion.style.display = 'block';
}

function cerrarConfirmacion() {
    const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
    mensajeConfirmacion.style.display = 'none';
}

function agregarProducto() {
    const nombreProducto = document.getElementById('nombreProductoManual').value.trim();
    const descripcion = document.getElementById('descripcionFactura').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadProductoManual').value);
    const cantidadMaxima = parseInt(document.getElementById('cantidadProductoManual').max);
    const precioUnitario = parseFloat(document.getElementById('precioUnitarioManual').value.replace(/\./g, ''));
    const pc = parseFloat(document.getElementById('PCProducto').value.replace(/\./g, ''));
    const garantia = parseInt(document.getElementById('garantiaProducto').value.trim());

    if (cantidad > cantidadMaxima) {
        mostrarMensajeError(`La cantidad seleccionada (${cantidad}) supera la cantidad máxima disponible (${cantidadMaxima}).`);
        return;
    }

    if (nombreProducto && !isNaN(cantidad) && !isNaN(precioUnitario) && !isNaN(garantia) && !isNaN(pc)) {
        const productoId = productoSeleccionadoId || null;
        const totalProducto = cantidad * precioUnitario;

        const tbody = document.getElementById('productosTabla').getElementsByTagName('tbody')[0];
        const newRow = tbody.insertRow();

        const cellId = newRow.insertCell(0);
        cellId.textContent = productoId || 'N/A';
        cellId.style.display = 'none';

        const cellNombre = newRow.insertCell(1);
        const cellCantidad = newRow.insertCell(2);
        const cellPrecioUnitario = newRow.insertCell(3);
        const cellGarantia = newRow.insertCell(4);
        const cellDescripcion = newRow.insertCell(5);
        const cellTotal = newRow.insertCell(6);
        const cellAcciones = newRow.insertCell(7);
        const cellPc = newRow.insertCell(8);
        cellPc.style.display = 'none';

        cellNombre.textContent = nombreProducto;
        cellCantidad.textContent = cantidad;
        cellPrecioUnitario.textContent = precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0 });
        cellGarantia.textContent = garantia;
        cellDescripcion.textContent = descripcion;
        cellTotal.textContent = totalProducto.toLocaleString('es-CO', { minimumFractionDigits: 0 });
        cellPc.textContent = pc;

        // Si estamos editando un producto existente, eliminamos el anterior
        if (productoSeleccionadoId && productosEnFactura.some(p => p.id === productoSeleccionadoId)) {
            const index = productosEnFactura.findIndex(p => p.id === productoSeleccionadoId);
            if (index !== -1) {
                totalFacturaGlobal -= productosEnFactura[index].total;
                productosEnFactura.splice(index, 1);
            }
        }

        productosEnFactura.push({
            id: productoId,
            nombre: nombreProducto,
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            garantia: garantia,
            descripcion: descripcion || "",
            total: totalProducto,
            pc: pc
        });

        localStorage.setItem('productosEnFactura', JSON.stringify(productosEnFactura));

        // Actualizar el total de la factura
        totalFacturaGlobal += totalProducto;
        actualizarTotalFactura();

        // Botón Eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.addEventListener('click', () => {
            const row = deleteBtn.closest('tr');
            const index = row.rowIndex - 1;
            tbody.deleteRow(index);

            totalFacturaGlobal -= productosEnFactura[index].total;
            productosEnFactura.splice(index, 1);
            actualizarTotalFactura();
        });

        // Botón Editar
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.className = 'btn btn-warning btn-sm';
        editBtn.style.marginLeft = '5px';
        editBtn.addEventListener('click', () => {
            const row = editBtn.closest('tr');
            const index = row.rowIndex - 1;
            const producto = productosEnFactura[index];

            // Llenar el formulario con los datos del producto a editar
            document.getElementById('nombreProductoManual').value = producto.nombre;
            document.getElementById('descripcionFactura').value = producto.descripcion;
            document.getElementById('cantidadProductoManual').value = producto.cantidad;
            document.getElementById('precioUnitarioManual').value = producto.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0 });
            document.getElementById('garantiaProducto').value = producto.garantia;
            document.getElementById('PCProducto').value = producto.pc;
            
            // Establecer el ID del producto seleccionado para edición
            productoSeleccionadoId = producto.id;

            // Eliminar la fila de la tabla y del array
            tbody.deleteRow(index);
            totalFacturaGlobal -= productosEnFactura[index].total;
            productosEnFactura.splice(index, 1);
            actualizarTotalFactura();
        });

        cellAcciones.appendChild(deleteBtn);
        cellAcciones.appendChild(editBtn);
        
        productoSeleccionadoId = null;
        limpiarFormularioProducto();
    } else {
        mostrarMensajeError('Por favor, completa todos los campos requeridos de la factura.');
    }
}


function obtenerProductosSeleccionados() {
    return productosEnFactura.map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario,
        garantia: producto.garantia,
        descripcion: producto.descripcion || null,
        total: producto.total,
        pc: producto.pc
    }));
}

function obtenerDatosFactura() {
    const nombreCliente = document.getElementById('nombreCliente').value.trim().toUpperCase();
    const cedulaNit = document.getElementById('cedulaNit').value.trim();
    const telefonoCliente = document.getElementById('telefonoCliente').value.trim();
    const correoCliente = document.getElementById('correoCliente').value.trim();
    const direccionCliente = document.getElementById('direccionCliente').value.trim();
    const productos = obtenerProductosSeleccionados();
    const nombreProducto = document.getElementById('nombreProductoManual').value.trim();

    return {
        nombreCliente,
        cedulaNit,
        telefonoCliente,
        correoCliente,
        direccionCliente,
        productos,
        nombreProducto
    };
}

function guardarFactura(omitVerification = false) {
    const { nombreCliente, cedulaNit, telefonoCliente, correoCliente, direccionCliente, productos, nombreProducto } = obtenerDatosFactura();
    totalFacturaGlobal = 0;

    if (!omitVerification && nombreProducto.length > 0) {
        mostrarConfirmacionProducto(() => guardarFactura(true)); // Pasa guardarFactura como callback
        return;
    }

    if (nombreCliente && cedulaNit && productos.length > 0) {
        // Calcular el total de la factura
        let totalFactura = 0;
        actualizarTotalFactura();
        const productosHTML = productos.map(producto => {
            totalFactura += producto.total;
            return `
                <tr>
                    <td>${producto.nombre.toUpperCase()}</td>
                    <td>${producto.cantidad}</td>
                    <td>${producto.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                    <td>${producto.garantia} Mes</td>
                    <td>${producto.descripcion || "Excelente calidad"}</td>
                    <td>${producto.total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                </tr>
            `;
        }).join('');

        const fechaActual = new Date().toLocaleDateString('es-CO');

        // Crear el objeto de factura para enviar al backend, incluyendo los campos opcionales
        const factura = {
            clienteNombre: nombreCliente,
            clienteCedula: cedulaNit,
            telefono: telefonoCliente || null,
            correo: correoCliente || null,
            direccion: direccionCliente || null,
            fechaCreacion: fechaActual,
            detalles: productos.map(producto => ({
                productoId: producto.id || "",
                nombreProducto: producto.nombre,
                cantidad: producto.cantidad,
                precioUnitario: producto.precioUnitario,
                garantia: producto.garantia || "1",
                descripcion: producto.descripcion || "",
                pc: producto.pc || null,
            })),
        };

        // Guardar la factura en la base de datos mediante API
        fetch('http://localhost:8082/api/facturas/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(factura),
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        mostrarMensajeError(`Error: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (!data) return;
                console.log('Factura guardada exitosamente:', data);

                // Crear el HTML de la factura para visualización
                const facturaHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="../css/pc.png" alt="" style="width: 100px; height: auto;">
                    <h2>CompuServices Soft</h2>
                    <p>Servicio técnico de computadores y celulares,<br> venta de computadores y periféricos</p>
                    <div> 
                        <p style="margin: 0 0 4px 0;"><b>NIT:</b> 1193030552-4</p>
                        <p style="margin: 0 0 4px 0;"><b>Celular:</b> 3242264795</p>
                        <p style="margin: 0;"><b>Ubicación:</b> Pasto, Centro comercial la 16, local 138</p>
                    </div>
                </div>


                    <p><strong>Cliente:</strong> ${nombreCliente}</p>
                    <p><strong>Cédula o NIT:</strong> ${cedulaNit}</p>
                    ${telefonoCliente ? `<p><strong>Teléfono:</strong> ${telefonoCliente}</p>` : ''}
                    ${correoCliente ? `<p><strong>Correo:</strong> ${correoCliente}</p>` : ''}
                    ${direccionCliente ? `<p><strong>Dirección:</strong> ${direccionCliente}</p>` : ''}
                    <p><strong>Fecha de Creación:</strong> ${fechaActual}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Nombre</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Precio Unitario</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Garantía</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Descripción</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosHTML}
                        <tr style="background-color: #f2f2f2;">
                            <td colspan="5" style="text-align: right; padding: 8px;"><strong>Total Factura:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${totalFactura.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                        </tr>
                    </tbody>
                </table>

                <p style="margin-top: 20px; font-size: 14px; color: #555;">
                    <b>Nota:</b> La garantía cubre únicamente defectos de fabricación y no aplica en caso de insatisfacción personal, errores en la selección del producto, o daños causados por un mal uso. Para validar la garantía, es indispensable conservar todos los accesorios, empaques originales y documentación proporcionada en el momento de la compra.
                </p>
            `;

                limpiarFormulario();

                // Abrir la ventana de previsualización de factura
                const ventanaImpresion = window.open('', '', 'height=1200,width=1600');
                ventanaImpresion.document.write(`
                <html>
                    <head>
                        <title>Factura</title>
                        <style>
                            body { font-family: Arial, sans-serif; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; }
                            th { background-color: #f2f2f2; }
                            h1, h2, h3 { text-align: center; }
                        </style>
                    </head>
                    <body>
                        ${facturaHTML}
                    </body>
                </html>
            `);
                ventanaImpresion.document.close();

                ventanaImpresion.onload = function () {
                    localStorage.removeItem('nombreCliente');
                    localStorage.removeItem('cedulaNit');
                    localStorage.removeItem('correoCliente');
                    localStorage.removeItem('telefonoCliente');
                    localStorage.removeItem('direccionCliente');
                    localStorage.removeItem('productosEnFactura');
                    ventanaImpresion.focus();
                    ventanaImpresion.print();
                };
            })
            .catch(error => {
                console.error('Error al guardar la factura:', error);
            });
    } else {
        mostrarMensajeError('Por favor, completa todos los campos requeridos de la factura.');
    }
}


function imprimirPos(omitVerification = false) {
    const { nombreCliente, cedulaNit, telefonoCliente, correoCliente, direccionCliente, productos, nombreProducto } = obtenerDatosFactura();
    totalFacturaGlobal = 0;

    if (!omitVerification && nombreProducto.length > 0) {
        mostrarConfirmacionProducto(() => imprimirPos(true)); // Pasa imprimirPos como callback
        return;
    }

    if (nombreCliente && cedulaNit && productos.length > 0) {
        let totalFactura = 0;
        actualizarTotalFactura();
        const productosHTML = productos.map(producto => {
            totalFactura += producto.total;
            return `
              <tr style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; color: #000">
               <td style="padding: 1px 0; text-align: left; max-width: 20mm; word-wrap: break-word;">
                  ${producto.nombre.toUpperCase()} - ${producto.descripcion || ''}
                </td>
                <td style="padding: 1px 0; text-align: center; max-width: 10mm;">${producto.cantidad}</td>
                <td style="padding: 1px 0; text-align: center; max-width: 15mm;">${producto.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                <td style="padding: 1px 0; text-align: center; max-width: 15mm;">${producto.garantia} Mes</td>
                <td style="padding: 1px 0; text-align: center;">${producto.total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
            </tr>
            `;
        }).join('');

        const fechaActual = new Date().toLocaleString('es-CO');

        const factura = {
            clienteNombre: nombreCliente,
            clienteCedula: cedulaNit,
            telefono: telefonoCliente || null,
            correo: correoCliente || null,
            direccion: direccionCliente || null,
            fechaCreacion: fechaActual,
            detalles: productos.map(producto => ({
                productoId: producto.id || "",
                nombreProducto: producto.nombre,
                cantidad: producto.cantidad,
                precioUnitario: producto.precioUnitario,
                garantia: producto.garantia + " Mes." || "1",
                descripcion: producto.descripcion || "",
                pc: producto.pc,
            })),
        };

        fetch('http://localhost:8082/api/facturas/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(factura),
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        mostrarMensajeError(`Error: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (!data) return;
                console.log('Factura guardada exitosamente:', data);

                const facturaHTML = `
                    <div style="width: 68mm; font-size: 12px; font-family: Arial, Helvetica, sans-serif; color: #000">
                        <div style="text-align: center;">
                            <img src="../css/pc.png" alt="" style="width: 80px; height: auto; margin-top: 0">
                        </div>
                        <h2 style="text-align: center; margin-bottom: 5px">CompuServices Soft</h2>
                        <p style="text-align: center; margin: 0">
                            <div style="font-size: 11px; text-align: center">
                            <b>Servicio técnico de computadores y celulares,
                            Venta de computadores y periféricos</b><br></div>
                            <div style="text-align : left; font-size: 12px; margin-top: 10px">
                            <b>NIT:</b> 1193030552-4<br>
                            <b>Celular:</b> 3242264795<br>
                            <b>Ubicación:</b> Pasto, Centro comercial la 16, local 138
                            <br>NO RESPONSABLES DE IVA
                            </div>
                        </p>
                        <p style="margin-bottom: 0px"><strong>Fecha:</strong> ${fechaActual}</p>
                        <p style="margin-bottom: 0px"><strong>Cliente:</strong> ${nombreCliente}</p>
                        <p style="margin-bottom: 0px"><strong>Cédula/NIT:</strong> ${cedulaNit}</p>
                        ${telefonoCliente ? `<p style="margin-bottom: 0px"><strong>Teléfono:</strong> ${telefonoCliente}</p>` : ''}
                        ${correoCliente ? `<p style="margin-bottom: 0px"><strong>Correo:</strong> ${correoCliente}</p>` : ''}
                        ${direccionCliente ? `<p style="margin-bottom: 0px"><strong>Dirección:</strong> ${direccionCliente}</p>` : ''}
                        <hr style="border: 1px solid #000;">
                        <table style="width: 100%; margin-top: 2px; font-size: 12px">
                            <thead>
                                <tr>
                                    <th style="padding: 2px 0; text-align: left; max-width: 20mm; word-wrap: break-word;">Producto</th>
                                    <th style="text-align: center; max-width: 10mm;">Ct.</th>
                                    <th style="text-align: center; max-width: 15mm;">Pre.</th>
                                    <th style="text-align: center; max-width: 15mm;">Garant.</th>
                                    <th style="text-align: center;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productosHTML}
                                <tr style="font-weight: bold;">
                                    <td colspan="4" style="text-align: right; padding-top: 4px;">Total:</td>
                                    <td style="text-align: center; padding-top: 4px;">${totalFactura.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                                </tr>
                            </tbody>
                        </table>
                        <hr style="border: 1px solid #000;">
                        <p style="margin-top: 5px; font-size: 12px; text-align: center;"><b>****** Gracias por su Compra ******</b></p>
                        <p style="margin-top: 1px; font-size: 12px; text-align: justify;">
                            <b>Nota:</b> La garantía cubre únicamente defectos de fabricación y no aplica en caso de insatisfacción personal, errores en la selección del producto, o daños causados por un mal uso. Para validar la garantía, es indispensable conservar todos los accesorios, empaques originales y documentación proporcionada en el momento de la compra, como también no dañar los sellos de garantía este proceso puede demorar hasta 15 dias habiles.
                        </p>
                        <p style="margin-top: 0px; font-size: 12px; text-align: justify;">&copy;Sistema de facturación POST y PDF, gestión de clientes inventario y pedidos, realizado por estebanadso@gmail.com / 3242264795</p>
                    </div>
            `;

                limpiarFormulario();

                const ventanaImpresion = window.open('', '', 'height=900,width=300');
                ventanaImpresion.document.write(`
                    <html>
                        <head>
                            <title>Factura POS</title>
                            <style>
                                @page {
                                    margin: 0; 
                                    padding: 0
                                }
                                body { 
                                    font-family: Arial, Helvetica, sans-serif;
                                    margin: 0; 
                                    padding: 0;
                                    color: #000 !important;
                                    -webkit-print-color-adjust: exact; /* Para imprimir colores más precisos */ 
                                }
                                table { 
                                    width: 100%; 
                                    border-collapse: collapse; 
                                    color: #000 !important;
                                    -webkit-print-color-adjust: exact; /* Para imprimir colores más precisos */ 
                                }
                                th, td { 
                                    padding: 2px 0; 
                                    text-align: right; 
                                    color: #000 !important;
                                    -webkit-print-color-adjust: exact; /* Para imprimir colores más precisos */ 
                                }
                                th { 
                                    text-align: center; 
                                    color: #000 !important;
                                    -webkit-print-color-adjust: exact; /* Para imprimir colores más precisos */ 
                                }
                                h2, h3, h4 { 
                                    text-align: center; 
                                    margin: 2px 0; 
                                    color: #000 !important;
                                    -webkit-print-color-adjust: exact; /* Para imprimir colores más precisos */ 
                                }
                            </style>
                        </head>
                        <body>
                            ${facturaHTML}
                        </body>
                    </html>
                `);
                ventanaImpresion.document.close();

                ventanaImpresion.onload = function () {
                    ventanaImpresion.focus();
                    ventanaImpresion.print();
                    localStorage.removeItem('nombreCliente');
                    localStorage.removeItem('cedulaNit');
                    localStorage.removeItem('correoCliente');
                    localStorage.removeItem('telefonoCliente');
                    localStorage.removeItem('direccionCliente');
                    localStorage.removeItem('productosEnFactura');
                };
            })
            .catch(error => {
                console.error('Error al guardar la factura:', error);
            });
    } else {
        mostrarMensajeError('Por favor, completa todos los campos requeridos de la factura.');
    }
}

const nombreClienteInput = document.getElementById('nombreCliente');
// Asignar un evento de input para convertir el texto a mayúsculas
nombreClienteInput.addEventListener('input', function (e) {
    const cursorPos = nombreClienteInput.selectionStart;  // Posición actual del cursor
    const textBefore = nombreClienteInput.value.slice(0, cursorPos);  // Parte antes del cursor
    const textAfter = nombreClienteInput.value.slice(cursorPos);  // Parte después del cursor

    // Actualiza el valor del campo convirtiendo todo a mayúsculas
    this.value = textBefore.toUpperCase() + textAfter;

    // Restablecer la posición del cursor
    nombreClienteInput.selectionStart = nombreClienteInput.selectionEnd = cursorPos;
});


function mostrarMensajeError(mensaje) {
    const mensajeError = document.getElementById('mensajeError');
    const mensajeTexto = document.getElementById('mensajeTexto');

    // Asigna el mensaje recibido como parámetro
    mensajeTexto.textContent = mensaje;

    // Muestra el contenedor de error
    mensajeError.style.display = 'block';

    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        cerrarMensajeError();
    }, 5000);
}

function cerrarMensajeError() {
    const mensajeError = document.getElementById('mensajeError');
    mensajeError.style.display = 'none';
}


function actualizarTotalFactura() {
    document.getElementById('totalDeFactura').innerHTML = `TOTAL: <span style="color: red;">$${totalFacturaGlobal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>`;
}

function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}


function limpiarFormularioProducto() {
    document.getElementById('nombreProductoManual').value = '';
    document.getElementById('descripcionFactura').value = '';
    document.getElementById('cantidadProductoManual').value = '1';
    document.getElementById('precioUnitarioManual').value = '';
    document.getElementById('garantiaProducto').value = '';
    document.getElementById('PCProducto').value = '';
    document.getElementById('mensajeMaxCantidad').textContent = '';
    productoSeleccionadoId = null; // Asegurarse de limpiar el ID de edición
}

function limpiarFormulario() {
    document.getElementById('nombreCliente').value = '';
    document.getElementById('cedulaNit').value = '';
    document.getElementById('telefonoCliente').value = '';
    document.getElementById('PCProducto').value = '';
    document.getElementById('correoCliente').value = '';
    document.getElementById('direccionCliente').value = '';
    document.getElementById('nombreProductoManual').value = '';
    document.getElementById('cantidadProductoManual').value = '1';
    document.getElementById('precioUnitarioManual').value = '';
    document.getElementById('garantiaProducto').value = '';
    document.getElementById('productosTabla').getElementsByTagName('tbody')[0].innerHTML = '';
    localStorage.removeItem('nombreCliente');
    localStorage.removeItem('cedulaNit');
    localStorage.removeItem('correoCliente');
    localStorage.removeItem('telefonoCliente');
    localStorage.removeItem('direccionCliente');
    localStorage.removeItem('productosEnFactura');
    document.getElementById('mensajeMaxCantidad').textContent = '';
    document.getElementById('totalDeFactura').textContent = 'TOTAL:';
    productosEnFactura = [];
}
