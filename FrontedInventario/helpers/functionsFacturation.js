// Función para obtener sugerencias de clientes
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

// Función para mostrar sugerencias de clientes
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
                mostrarMensaje('success', 'Error en la red');
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
        mostrarMensaje('error', `La cantidad seleccionada (${cantidad}) supera la cantidad máxima disponible (${cantidadMaxima}).`);
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
        mostrarMensaje('error', 'Por favor, completa todos los campos requeridos de la factura.');
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
                        mostrarMensaje('error', `Error: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (!data) return;
                console.log('Factura guardada exitosamente:', data);

                // Crear el HTML de la factura para visualización
                const htmlFacturaPDF = generarFacturaHTMLPDF({
                    nombreCliente,
                    cedulaNit,
                    telefonoCliente,
                    correoCliente,
                    direccionCliente,
                    productosHTML,
                    totalFactura,
                    fechaActual
                });

                limpiarFormulario();

                const ventanaImpresion = window.open('', '', 'height=1200,width=800');
                ventanaImpresion.document.write(htmlFacturaPDF);
                ventanaImpresion.document.close();
                ventanaImpresion.print();
                ventanaImpresion.onload = imprimirYLimpiarVentana(ventanaImpresion);
            })
            .catch(error => {
                console.error('Error al guardar la factura:', error);
            });
    } else {
        mostrarMensaje('error', 'Por favor, completa todos los campos requeridos de la factura.');
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
                        mostrarMensaje('error', `Error: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (!data) return;
                console.log('Factura guardada exitosamente:', data);

                // Crear el HTML de la factura para visualización
                const htmlFacturaPDF = generarFacturaHTMLPOS({
                    nombreCliente,
                    cedulaNit,
                    telefonoCliente,
                    correoCliente,
                    direccionCliente,
                    productosHTML,
                    totalFactura,
                    fechaActual
                });

                limpiarFormulario();

                const ventanaImpresion = window.open('', '', 'height=900,width=300');
                ventanaImpresion.document.write(htmlFacturaPDF);
                ventanaImpresion.document.close();
                ventanaImpresion.onload = imprimirYLimpiarVentana(ventanaImpresion);
            })
            .catch(error => {
                console.error('Error al guardar la factura:', error);
            });
    } else {
        mostrarMensaje('error', 'Por favor, completa todos los campos requeridos de la factura.');
    }
}

function imprimirYLimpiarVentana(ventanaImpresion) {
    ventanaImpresion.focus();
    ventanaImpresion.print();
    localStorage.removeItem('nombreCliente');
    localStorage.removeItem('cedulaNit');
    localStorage.removeItem('correoCliente');
    localStorage.removeItem('telefonoCliente');
    localStorage.removeItem('direccionCliente');
    localStorage.removeItem('productosEnFactura');
};

function actualizarTotalFactura() {
    document.getElementById('totalDeFactura').innerHTML = `TOTAL: <span style="color: red;">$${totalFacturaGlobal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>`;
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
