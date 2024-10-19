
const apiClient = 'http://localhost:8082/cliente';
const apiProducto = 'http://localhost:8082/producto'

let productosFiltrados = [];

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

function guardarCliente() {
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const cedulaNit = document.getElementById('cedulaNit').value.trim();

    if (!nombreCliente || !cedulaNit) {
        alert('Por favor, complete los datos del cliente.');
        return;
    }

    const clienteData = {
        nombre: nombreCliente,
        identificacion: cedulaNit,
        correo: "" // Puedes agregar un campo para el correo si lo necesitas
    };

    // Verificar si el cliente ya existe en la base de datos
    fetch(`${apiClient}/buscar-por-identificacion?identificacion=${cedulaNit}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Devuelve los datos del cliente si existe
            return response.json(); 
        } else if (response.status === 404) {
            // Si el cliente no existe, simplemente retornar null sin lanzar un error
            return null;
        } else {
            // Para otros errores, imprimir un mensaje en consola sin lanzar excepciones
            console.error('Error al verificar la existencia del cliente:', response.statusText);
            return null; // Continuar con el flujo sin detenerlo
        }
    })
    .then(clienteExistente => {
        if (clienteExistente) {
            // Si el cliente ya existe
            alert('El cliente ya existe en la base de datos.');
        } else {
            // Si el cliente no existe, hacer el POST para guardarlo
            return fetch(apiClient, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clienteData)
            });
        }
    })
    .then(response => {
        if (response) {
            if (!response.ok) {
                console.error('No se pudo guardar el cliente en la base de datos:', response.statusText);
                alert('Hubo un problema al guardar el cliente.');
                return;
            }
            return response.json();
        }
    })
    .then(data => {
        if (data) {
            console.log('Cliente guardado:', data);
            alert('Cliente guardado exitosamente.');
        }
    })
    .catch(error => {
        console.error('Error inesperado:', error);
        alert('Hubo un problema al procesar la solicitud.');
    });
}




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
function buscarProductos() {
    const nombreProducto = document.getElementById('nombreProductoManual').value;
    if (nombreProducto.length < 3) {
        // Oculta la lista si el texto es menor a 3 caracteres
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
                li.textContent = producto.nombre;
                li.onclick = () => seleccionarProducto(producto); 
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
    const productos = obtenerProductosSeleccionados();

    if (nombreCliente && cedulaNit && productos.length > 0) {
        // Verificar si el cliente ya existe y obtener su ID
        const clienteId = verificarClienteExistente(cedulaNit); // Método que devuelve el ID del cliente o null si no existe

        
        if (!clienteId) {
            alert('El cliente no existe en la base de datos. Por favor, selecciona un cliente válido.');
            return;
        }

        // Calcular el total de la factura
        let totalFactura = 0;
        const productosHTML = productos.map(producto => {
            totalFactura += producto.total;
            return `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>${producto.cantidad}</td>
                    <td>${producto.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                    <td>${producto.garantia || "Excelente calidad"}</td>  // Descripción por defecto
                    <td>${producto.descripcion || "Excelente calidad"}</td>
                    <td>${producto.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        }).join('');

        const fechaActual = new Date().toLocaleDateString('es-CO');

        // Crear el objeto de factura para mostrar en consola
        const factura = {
            clienteNombre: nombreCliente, // ID del cliente
            clienteCedula: cedulaNit,
            fechaCreacion: fechaActual,
            totalFactura: totalFactura,
            detalles: productos.map(producto => ({
                productoId: producto.nombre, // ID del producto
                cantidad: producto.cantidad,
                precioUnitario: producto.precioUnitario,
                garantia: producto.garantia || "Excelente calidad",
                descripcion: producto.descripcion || "Excelente calidad",
            })),
        };

        console.log("Datos de la factura:", factura); // Mostrar los datos de la factura en la consola

        // Crear la factura en el frontend
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
                        <th style="border: 1px solid #ddd; padding: 8px;">Garantía (meses)</th>
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

        // Abrir ventana de impresión
        const ventanaImpresion = window.open('', '', 'height=600,width=800');
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
            ventanaImpresion.close();
        };

    } else {
        alert('Por favor, completa todos los campos requeridos.');
    }
}


function verificarClienteExistente(cedulaNit) {
    // Simulación: Puedes hacer una petición GET al servidor para verificar si el cliente ya existe
    return true; // Cambia esto según la lógica que utilices para verificar clientes
}


function agregarProducto(id) { // Asegúrate de pasar el id del producto como argumento
    const nombreProducto = document.getElementById('nombreProductoManual').value.trim();
    const descripcion = document.getElementById('descripcionFactura').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadProductoManual').value.trim());
    const precioUnitario = parseFloat(document.getElementById('precioUnitarioManual').value.trim());
    const garantia = parseInt(document.getElementById('garantiaProducto').value.trim());

    if (nombreProducto && descripcion && !isNaN(cantidad) && !isNaN(precioUnitario) && !isNaN(garantia)) {
        const tbody = document.getElementById('productosTabla').getElementsByTagName('tbody')[0];
        const newRow = tbody.insertRow();

        // Celda oculta para ID
        const cellId = newRow.insertCell(0);
        cellId.style.display = 'none'; // Ocultando la celda de ID
        cellId.textContent = id; // Asigna el ID del producto

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

        const totalProducto = cantidad * precioUnitario;
        cellTotal.textContent = totalProducto.toLocaleString('es-CO', { minimumFractionDigits: 2 });

        limpiarFormularioProducto();

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.addEventListener('click', () => {
            const row = deleteBtn.closest('tr');
            tbody.deleteRow(row.rowIndex - 1);
        });
        cellAcciones.appendChild(deleteBtn);
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
    const productos = [];
    const tbody = document.getElementById('productosTabla').getElementsByTagName('tbody')[0];

    for (let i = 0; i < tbody.rows.length; i++) {
        const row = tbody.rows[i];
        const producto = {
            id: row.cells[0].textContent, // Extrae el ID del producto (columna oculta)
            nombre: row.cells[1].textContent,
            cantidad: parseInt(row.cells[2].textContent),
            precioUnitario: parseFloat(row.cells[3].textContent.replace(/\./g, '').replace(',', '.')),
            garantia: parseInt(row.cells[4].textContent),
            descripcion: row.cells[5].textContent,
            total: parseFloat(row.cells[6].textContent.replace(/\./g, '').replace(',', '.'))
        };
        productos.push(producto);
    }

    return productos;
}


function limpiarFormulario() {
    document.getElementById('nombreCliente').value = '';
    document.getElementById('cedulaNit').value = '';
    document.getElementById('nombreProductoManual').value = '';
    document.getElementById('cantidadProductoManual').value = '';
    document.getElementById('precioUnitarioManual').value = '';
    document.getElementById('garantiaProducto').value = '';
    document.getElementById('productosTabla').getElementsByTagName('tbody')[0].innerHTML = '';
}
