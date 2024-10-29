const apiClient = 'http://localhost:8082/cliente';
const apiProducto = 'http://localhost:8082/producto'

let productosFiltrados = [];
let productosEnFactura = [];

document.addEventListener('DOMContentLoaded', () => {


    const agregarProductoBtn = document.getElementById('agregarProductoBtn');
    if (agregarProductoBtn) {
        agregarProductoBtn.addEventListener('click', () => {
            agregarProducto();
        });
    }

    const guardarFacturaBtn = document.getElementById('guardarFacturaBtn');
    if (guardarFacturaBtn) {
        guardarFacturaBtn.addEventListener('click', () => {
            guardarFactura();
        });
    }

    const limpiarFormularioBtn = document.getElementById('limpiarFormularioBtn');
    if (limpiarFormularioBtn) {
        limpiarFormularioBtn.addEventListener('click', () => {
            limpiarFormulario();
        });
    }

});

document.getElementById('nombreCliente').addEventListener('input', () => {
    const query = document.getElementById('nombreCliente').value.trim();
    if (query.length > 1) {
        obtenerSugerencias(query);
    } else {
        document.getElementById('sugerenciasClientes').style.display = 'none';
    }
});



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

        // Al hacer clic en una sugerencia, llenar el campo de nombre del cliente y ocultar las sugerencias
        li.addEventListener('click', () => {
            document.getElementById('nombreCliente').value = cliente.nombre.toUpperCase();
            document.getElementById('cedulaNit').value = cliente.identificacion;
            document.getElementById('correoCliente').value = cliente.correo;
            document.getElementById('telefonoCliente').value = cliente.telefono;
            document.getElementById('direccionCliente').value = cliente.direccion;
            sugerenciasDiv.style.display = 'none';
        });

        sugerenciasDiv.appendChild(li);
    });

    sugerenciasDiv.style.display = 'block';
}

document.getElementById('cedulaNit').addEventListener('input', () => {
    const query = document.getElementById('cedulaNit').value.trim();
    if (query.length > 1) {
        obtenerSugerencias(query);
    } else {
        document.getElementById('sugerenciasClientes').style.display = 'none';
    }
});



// Función para buscar productos y mostrar sugerencias

let productoSeleccionadoId = null;

function buscarProductos() {
    const nombreProducto = document.getElementById('nombreProductoManual').value.toUpperCase();

    if (nombreProducto.length < 2) {
        // Oculta la lista si el texto es menor a 2 caracteres
        document.getElementById('sugerenciasProductos').style.display = 'none';
        return;
    }

    // Actualiza la URL utilizando la variable apiProducto
    fetch(`${apiProducto}/buscar/${nombreProducto}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la red');
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos:', data); // Agrega este log para ver la respuesta
            const sugerencias = document.getElementById('sugerenciasProductos');
            sugerencias.innerHTML = ''; // Limpiar sugerencias anteriores

            // Asegúrate de que 'data' sea un array antes de usar forEach
            if (Array.isArray(data)) {
                data.forEach(producto => {
                    const li = document.createElement('li');
                    li.innerHTML = producto.nombre.toUpperCase() + "<i>" + " ||  $" + producto.precioVendido + "</i>" + " || Stock disponible : " + producto.cantidad;
                    li.style.cursor = 'pointer';
                    li.classList.add('hover-effect');
                    // Mensaje para depurar el click en cada producto
                    li.onclick = () => {
                        console.log('Producto clickeado:', producto); // Para verificar qué producto se ha clickeado
                        productoSeleccionadoId = producto.id
                        console.log("id del producto seleccionado:" + productoSeleccionadoId)
                        seleccionarProducto(producto); // Llama a la función para mostrar los detalles
                    };

                    sugerencias.appendChild(li);
                });
                sugerencias.style.display = data.length ? 'block' : 'none';
            } else {
                console.error('La respuesta no es un array:', data);
                sugerencias.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

function seleccionarProducto(producto) {
    // Mostrar los detalles en la consola
    console.log('Producto seleccionado:', producto.nombre);
    console.log('Precio:', producto.precioVendido);
    console.log('ID del producto:', producto.id);
    productoSeleccionadoId = producto.id
    console.log(productoSeleccionadoId)
}


// Agregar evento para el campo de producto
document.getElementById('nombreProductoManual').addEventListener('input', buscarProductos);

// Función para seleccionar un producto de la lista de sugerencias
function seleccionarProducto(producto) {
    document.getElementById('nombreProductoManual').value = producto.nombre;
    document.getElementById('precioUnitarioManual').value = producto.precioVendido;
    document.getElementById('PCProducto').value = producto.precioComprado;
    document.getElementById('sugerenciasProductos').style.display = 'none';
}

// Agregar evento para el campo de producto
document.getElementById('nombreProductoManual').addEventListener('input', buscarProductos);

let detalles = []; // Inicializar la variable como un arreglo vacío

// Función para agregar detalles
function agregarDetalle(detalle) {
    detalles.push(detalle); // Agrega detalles a la lista
}


function guardarFactura() {
    const nombreCliente = document.getElementById('nombreCliente').value.trim().toUpperCase();
    const cedulaNit = document.getElementById('cedulaNit').value.trim();
    const telefonoCliente = document.getElementById('telefonoCliente').value.trim();
    const correoCliente = document.getElementById('correoCliente').value.trim();
    const direccionCliente = document.getElementById('direccionCliente').value.trim();
    const productos = obtenerProductosSeleccionados();
    totalFacturaGlobal = 0;

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
                        alert(`Error: ${text}`);
                        throw new Error(text);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Factura guardada exitosamente:', data);

                // Crear el HTML de la factura para visualización
                const facturaHTML = `
                <h1 style="text-align: center;">Factura de Venta</h1>
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

                limpiarFormularioProducto();
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
                    ventanaImpresion.focus();
                    ventanaImpresion.print();
                };
            })
            .catch(error => {
                console.error('Error al guardar la factura:', error);
            });
    } else {
        alert('Por favor, completa todos los campos requeridos.');
    }
}


function imprimirPos() {
    const nombreCliente = document.getElementById('nombreCliente').value.trim().toUpperCase();
    const cedulaNit = document.getElementById('cedulaNit').value.trim();
    const telefonoCliente = document.getElementById('telefonoCliente').value.trim();
    const correoCliente = document.getElementById('correoCliente').value.trim();
    const direccionCliente = document.getElementById('direccionCliente').value.trim();
    const productos = obtenerProductosSeleccionados();
    totalFacturaGlobal = 0;

    if (nombreCliente && cedulaNit && productos.length > 0) {
        let totalFactura = 0;
        actualizarTotalFactura();
        const productosHTML = productos.map(producto => {
            totalFactura += producto.total;
            return `
              <tr style=" font-size: 10px; font-family: monospace;">
               <td style="padding: 2px 0; text-align: left; max-width: 20mm; word-wrap: break-word;">
                  ${producto.nombre.toUpperCase()} - ${producto.descripcion || ''}
                </td>
                <td style="padding: 2px 0; text-align: center; max-width: 10mm;">${producto.cantidad}</td>
                <td style="padding: 2px 0; text-align: center; max-width: 15mm;">${producto.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                <td style="padding: 2px 0; text-align: center; max-width: 15mm;">${producto.garantia}Mes</td>
                <td style="padding: 2px 0; text-align: center;">${producto.total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
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
                        alert(`Error: ${text}`);
                        throw new Error(text);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Factura guardada exitosamente:', data);

                const facturaHTML = `
                 <div style="width: 65mm; font-size: 10px; font-family: monospace;">
                    <div style="text-align: center;">
                        <img src="../css/pc.png" alt="" style="width: 80px; height: auto; margin-top: 0">
                    </div>
                    <h2 style="text-align: center;">CompuServices Soft</h2>
                    <p style="text-align: center;">
                        Servicio técnico de computadores y celulares,<br>
                        Venta de computadores y periféricos<br>
                        <b>NIT:</b> 1193030552-4<br>
                        <b>Celular:</b> 3242264795<br>
                        <b>Ubicación:</b> Pasto, Centro comercial la 16, local 138
                    </p>
                    <p><strong>Fecha:</strong> ${fechaActual}</p>
                    <p><strong>Cliente:</strong> ${nombreCliente}</p>
                    <p><strong>Cédula/NIT:</strong> ${cedulaNit}</p>
                    ${telefonoCliente ? `<p><strong>Teléfono:</strong> ${telefonoCliente}</p>` : ''}
                    ${correoCliente ? `<p><strong>Correo:</strong> ${correoCliente}</p>` : ''}
                    ${direccionCliente ? `<p><strong>Dirección:</strong> ${direccionCliente}</p>` : ''}
                    <hr>
                    <table style="width: 100%; margin-top: 10px; font-size: 10px">
                        <thead>
                            <tr>
                                <th style="padding: 4px 0; text-align: left; max-width: 20mm; word-wrap: break-word;">Producto</th>
                                <th style="text-align: center; max-width: 10mm;">Ct.</th>
                                <th style="text-align: center; max-width: 15mm;">Pre.</th>
                                <th style="text-align: center; max-width: 15mm;">Garant.</th>
                                <th style="text-align: center;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosHTML}
                            <tr style="font-weight: bold;">
                                <td colspan="4" style="text-align: right; padding-top: 8px;">Total:</td>
                                <td style="text-align: center; padding-top: 8px;">${totalFactura.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                            </tr>
                        </tbody>
                   </table>
                   <hr>
                    <p style="margin-top: 10px; font-size: 11px; text-align: center;"><b>******* Gracias por su Compra *******</b></p>
                    <p style="margin-top: 2px; font-size: 10px; text-align: justify;">
                        <b>Nota:</b> La garantía cubre únicamente defectos de fabricación y no aplica en caso de insatisfacción personal, errores en la selección del producto, o daños causados por un mal uso. Para validar la garantía, es indispensable conservar todos los accesorios, empaques originales y documentación proporcionada en el momento de la compra, como también no dañar los sellos de garantia.
                    </p>
                </div>
            `;

                limpiarFormularioProducto();
                limpiarFormulario();

                const ventanaImpresion = window.open('', '', 'height=800,width=300');
                ventanaImpresion.document.write(`
                <html>
                    <head>
                        <title>Factura POS</title>
                        <style>
                            body { font-family: monospace; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { padding: 4px 0; text-align: right; }
                            th { text-align: center; }
                            h2, h3, h4 { text-align: center; margin: 4px 0; }
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
                };
            })
            .catch(error => {
                console.error('Error al guardar la factura:', error);
            });
    } else {
        alert('Por favor, completa todos los campos requeridos.');
    }
}

const inputs = document.querySelectorAll('.form-control');



function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const nombreClienteInput = document.getElementById('nombreCliente');

// Asignar un evento de input para convertir el texto a mayúsculas
nombreClienteInput.addEventListener('input', function () {
    this.value = this.value.toUpperCase(); // Convierte el valor a mayúsculas
});

let totalFacturaGlobal = 0; // Variable global para almacenar el total de la factura

function agregarProducto() {
    const nombreProducto = document.getElementById('nombreProductoManual').value.trim();
    const descripcion = document.getElementById('descripcionFactura').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadProductoManual').value.trim());
    const precioUnitario = parseFloat(document.getElementById('precioUnitarioManual').value.replace(/\./g, ''));
    const pc = parseFloat(document.getElementById('PCProducto').value.replace(/\./g, ''));
    const garantia = parseInt(document.getElementById('garantiaProducto').value.trim());

    // Asegurarse de que precioComprado también esté validado
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
        const cellPc = newRow.insertCell(8); // Celda para precio comprado

        cellNombre.textContent = nombreProducto;
        cellCantidad.textContent = cantidad;
        cellPrecioUnitario.textContent = precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0 });
        cellGarantia.textContent = garantia;
        cellDescripcion.textContent = descripcion;
        cellTotal.textContent = totalProducto.toLocaleString('es-CO', { minimumFractionDigits: 0 });
        cellPc.textContent = pc.toLocaleString('es-CO', { minimumFractionDigits: 0 }); // Formatear precio comprado

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

        // Actualizar el total de la factura
        totalFacturaGlobal += totalProducto;
        actualizarTotalFactura();

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.addEventListener('click', () => {
            const row = deleteBtn.closest('tr');
            const index = row.rowIndex - 1;
            tbody.deleteRow(index);

            // Restar el total del producto eliminado
            totalFacturaGlobal -= productosEnFactura[index].total;
            productosEnFactura.splice(index, 1); // Eliminar el producto del array

            actualizarTotalFactura();
        });
        cellAcciones.appendChild(deleteBtn);

        productoSeleccionadoId = null;
        limpiarFormularioProducto();
    } else {
        alert('Por favor, complete todos los campos correctamente.');
    }
}



// Función para actualizar el total de la factura en el DOM
function actualizarTotalFactura() {
    document.getElementById('totalDeFactura').innerHTML = `TOTAL: <span style="color: red;">$${totalFacturaGlobal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>`;
}

function limpiarFormularioProducto() {
    document.getElementById('nombreProductoManual').value = '';
    document.getElementById('descripcionFactura').value = '';
    document.getElementById('cantidadProductoManual').value = '1';
    document.getElementById('precioUnitarioManual').value = '';
    document.getElementById('garantiaProducto').value = '1';
    document.getElementById('PCProducto').value = '';
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
    document.getElementById('garantiaProducto').value = '1';
    document.getElementById('productosTabla').getElementsByTagName('tbody')[0].innerHTML = '';
    productosEnFactura = [];
}

