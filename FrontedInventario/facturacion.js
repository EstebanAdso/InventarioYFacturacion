
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
        li.textContent = cliente.nombre;
        li.style.padding = '8px';
        li.style.cursor = 'pointer';

        // Al hacer clic en una sugerencia, llenar el campo de nombre del cliente y ocultar las sugerencias
        li.addEventListener('click', () => {
            document.getElementById('nombreCliente').value = cliente.nombre;
            document.getElementById('cedulaNit').value = cliente.identificacion;
            sugerenciasDiv.style.display = 'none';
        });

        sugerenciasDiv.appendChild(li);
    });

    sugerenciasDiv.style.display = 'block';
}


// Función para buscar productos y mostrar sugerencias

let productoSeleccionadoId = null;

function buscarProductos() {
    const nombreProducto = document.getElementById('nombreProductoManual').value;
    
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
                li.innerHTML = producto.nombre + "<i>"+ "  $" + producto.precioVendido + "</i>" + " ID: " + producto.id;
                
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
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const cedulaNit = document.getElementById('cedulaNit').value.trim();
    const productos = obtenerProductosSeleccionados(); // Aquí se obtienen los productos seleccionados

    if (nombreCliente && cedulaNit && productos.length > 0) {
        // Calcular el total de la factura
        let totalFactura = 0;
        const productosHTML = productos.map(producto => {
            totalFactura += producto.total;
            return `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>${producto.cantidad}</td>
                    <td>${producto.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                    <td>${producto.garantia || "Excelente calidad"}</td>
                    <td>${producto.descripcion || "Excelente calidad"}</td>
                    <td>${producto.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        }).join('');

        const fechaActual = new Date().toLocaleDateString('es-CO');

        // Crear el objeto de factura para enviar al backend
        const factura = {
            clienteNombre: nombreCliente,
            clienteCedula: cedulaNit,
            fechaCreacion: fechaActual,
            totalFactura: totalFactura,
            detalles: productos.map(producto => ({
                productoId: producto.id || "", // Ahora se incluye el productoId
                nombreProducto: producto.nombre,
                cantidad: producto.cantidad,
                precioUnitario: producto.precioUnitario,
                garantia: producto.garantia || "Excelente calidad",
                descripcion: producto.descripcion || "Excelente calidad",
            })),
        };

        // Mostrar los datos de la factura en consola
        console.log("Datos de la factura:", factura);

        // Guardar la factura en la base de datos mediante API
        fetch('http://localhost:8082/api/facturas/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(factura),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Factura guardada exitosamente:', data);

            // Crear el HTML de la factura para visualización
            const facturaHTML = `
                <h1 style="text-align: center;">Factura de Venta</h1>
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="pc.png" alt="" style="width: 100px; height: auto;">
                    <h2>Compu Services Soft</h2>
                    <p>Servicio técnico de computadores y celulares,<br> venta de computadores y periféricos</p>
                </div>
                <div>
                    <p><strong>Cliente:</strong> ${nombreCliente}</p>
                    <p><strong>Cédula o NIT:</strong> ${cedulaNit}</p>
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
                            <td style="border: 1px solid #ddd; padding: 8px;">${totalFactura.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>
            `;

            limpiarFormularioProducto()
            limpiarFormulario()
    
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

            ventanaImpresion.onload = function() {
                ventanaImpresion.focus();
                ventanaImpresion.print();
            };
        })
        .catch(error => {
            console.error('Error al guardar la factura:', error);
            alert('Error al guardar la factura.');
        });
    } else {
        alert('Por favor, completa todos los campos requeridos.');
    }
}


function agregarProducto() {
    const nombreProducto = document.getElementById('nombreProductoManual').value.trim();
    const descripcion = document.getElementById('descripcionFactura').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadProductoManual').value.trim());
    const precioUnitario = parseFloat(document.getElementById('precioUnitarioManual').value.trim());
    const garantia = parseInt(document.getElementById('garantiaProducto').value.trim());

    if (nombreProducto && descripcion && !isNaN(cantidad) && !isNaN(precioUnitario) && !isNaN(garantia)) {
        // Usar el ID del producto seleccionado, o null si no se seleccionó de la lista
        const productoId = productoSeleccionadoId || null;

        // Calcular el total del producto
        const totalProducto = cantidad * precioUnitario;

        const tbody = document.getElementById('productosTabla').getElementsByTagName('tbody')[0];
        const newRow = tbody.insertRow();

        // Celda para ID (puede ser visible o no, según prefieras)
        const cellId = newRow.insertCell(0);
        cellId.textContent = productoId || 'N/A';
        cellId.style.display = 'none'; // Ocultar la celda de ID si no quieres que sea visible

        const cellNombre = newRow.insertCell(1);
        const cellCantidad = newRow.insertCell(2);
        const cellPrecioUnitario = newRow.insertCell(3);
        const cellGarantia = newRow.insertCell(4);
        const cellDescripcion = newRow.insertCell(5);
        const cellTotal = newRow.insertCell(6);
        const cellAcciones = newRow.insertCell(7);

        cellNombre.textContent = nombreProducto;
        cellCantidad.textContent = cantidad;
        cellPrecioUnitario.textContent = precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 2 });
        cellGarantia.textContent = garantia;
        cellDescripcion.textContent = descripcion;
        cellTotal.textContent = totalProducto.toLocaleString('es-CO', { minimumFractionDigits: 2 });

        // Agregar el producto a un array para mantener un registro
        productosEnFactura.push({
            id: productoId,
            nombre: nombreProducto,
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            garantia: garantia,
            descripcion: descripcion,
            total: totalProducto
        });

        // Botón de eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.addEventListener('click', () => {
            const row = deleteBtn.closest('tr');
            const index = row.rowIndex - 1;
            tbody.deleteRow(index);
            productosEnFactura.splice(index, 1); // Eliminar el producto del array
        });
        cellAcciones.appendChild(deleteBtn);

        // Resetear el ID del producto seleccionado después de agregarlo
        productoSeleccionadoId = null;

        limpiarFormularioProducto();
    } else {
        alert('Por favor, complete todos los campos correctamente.');
    }
}
function limpiarFormularioProducto() {
    document.getElementById('nombreProductoManual').value = '';
    document.getElementById('descripcionFactura').value = '';
    document.getElementById('cantidadProductoManual').value = '';
    document.getElementById('precioUnitarioManual').value = '';
    document.getElementById('garantiaProducto').value = '';
}

function obtenerProductosSeleccionados() {
    return productosEnFactura.map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario,
        garantia: producto.garantia,
        descripcion: producto.descripcion,
        total: producto.total
    }));
}
function limpiarFormulario() {
    document.getElementById('nombreCliente').value = '';
    document.getElementById('cedulaNit').value = '';
    document.getElementById('nombreProductoManual').value = '';
    document.getElementById('cantidadProductoManual').value = '';
    document.getElementById('precioUnitarioManual').value = '';
    document.getElementById('garantiaProducto').value = '';
    document.getElementById('productosTabla').getElementsByTagName('tbody')[0].innerHTML = '';
    productosEnFactura = [];
}
