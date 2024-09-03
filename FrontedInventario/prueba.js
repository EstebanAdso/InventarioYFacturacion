// URL del API para productos y categorías
const apiUrl = 'http://localhost:8082/producto';
const apiCategoriaUrl = 'http://localhost:8082/categoria';

// Lista global para almacenar productos filtrados por categoría
let productosFiltrados = [];

// Evento que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias(); // Cargar categorías disponibles al iniciar
    cargarProductos(); // Cargar todos los productos al iniciar

    // Evento para agregar producto a la factura
    const agregarProductoBtn = document.getElementById('agregarProductoBtn');
    if (agregarProductoBtn) {
        agregarProductoBtn.addEventListener('click', () => {
            agregarProducto(); // Función para agregar producto a la tabla de productos seleccionados
        });
    }

    // Evento para guardar la factura
    const guardarFacturaBtn = document.getElementById('guardarFacturaBtn');
    if (guardarFacturaBtn) {
        guardarFacturaBtn.addEventListener('click', () => {
            guardarFactura(); // Función para guardar la factura
        });
    }

    // Evento para limpiar el formulario
    const limpiarFormularioBtn = document.getElementById('limpiarFormularioBtn');
    if (limpiarFormularioBtn) {
        limpiarFormularioBtn.addEventListener('click', () => {
            limpiarFormulario(); // Función para limpiar el formulario de productos
        });
    }
});

function guardarFactura() {
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const cedulaNit = document.getElementById('cedulaNit').value.trim();
    const productos = obtenerProductosSeleccionados();

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
                    <td>${producto.garantia}</td>
                    <td>${producto.descripcion}</td>
                    <td>${producto.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        }).join('');

        const fechaActual = new Date().toLocaleDateString('es-CO');

        // Preparar el contenido HTML para el PDF
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
                  <p><strong>Fecha de Creación:</strong> ${fechaActual}</p> <!-- Mostrar fecha actual -->
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
                    <tr>
                        <td colspan="5" style="text-align: left; padding: 8px;">
                            <strong>Dirección:</strong> Centro Comercial la 16 local 138 Pasto - Nariño<br>
                            <strong>NIT:</strong> 1193030552-4
                        </td>
                    </tr>
                </tbody>
            </table>

                   <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                <h3 style="color: #333; font-size: 18px;">Información de Garantía</h3>
                <p style="font-size: 14px; line-height: 1.6;">
                    Si su producto cuenta con garantía, en esta factura tendrá garantía de calidad que cubre defectos de fabricación y funcionamiento. 
                    Sin embargo, es importante tener en cuenta lo siguiente: la garantía no cubre daños causados por golpes, humedad, cortos, 
                    o cualquier otro tipo de maltrato. No se aceptarán reclamaciones por levantamiento de sellos de garantía o pérdida de la 
                    caja original del producto. La garantía no aplica en casos donde el producto haya sido manipulado por personal no autorizado. 
                    No se aceptarán devoluciones ni cambios por motivos de insatisfacción personal o si el producto no cumple con sus expectativas 
                    subjetivas. Tampoco se aceptarán sin presentar su respectiva factura. En caso de tener problemas con su producto, se realizará 
                    la garantía con un plazo máximo de 12 días hábiles y no se harán devoluciones de dinero a menos que no se le haya podido responder 
                    en el transcurso de este tiempo por la garantía.
                </p>
            </div>
        `;

        // Abrir ventana de impresión y generar PDF
        const ventanaImpresion = window.open('', '', 'height=600,width=800');
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Factura</title>
                    <style>
                        /* Estilos para la impresión */
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

        limpiarFormulario(); // Limpiar formulario después de guardar la factura
    } else {
        alert('Por favor, complete todos los campos obligatorios y seleccione al menos un producto.');
    }
}

// Función para cargar todas las categorías disponibles
async function cargarCategorias() {
    try {
        const response = await fetch(apiCategoriaUrl);
        if (!response.ok) {
            throw new Error('Error al cargar las categorías.');
        }

        const categorias = await response.json();
        const categoriaSelect = document.getElementById('categoria');
        if (categoriaSelect) {
            categoriaSelect.innerHTML = '<option value="">Seleccione una categoría</option>';

            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                categoriaSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para cargar productos disponibles inicialmente o por categoría seleccionada
async function cargarProductos(categoriaId = null) {
    try {
        let url = apiUrl;
        if (categoriaId) {
            url = `${apiUrl}/categoria/${categoriaId}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al cargar los productos.');
        }

        const productos = await response.json();
        productosFiltrados = productos; // Almacenar los productos filtrados globalmente
        mostrarProductosDisponibles(productosFiltrados);

    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para mostrar productos disponibles en el select de productos
function mostrarProductosDisponibles(productos) {
    const productoSelect = document.getElementById('producto');
    if (productoSelect) {
        productoSelect.innerHTML = '<option value="">Seleccione un producto</option>';

        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = producto.nombre;
            productoSelect.appendChild(option);
        });
    }
}

// Función para agregar producto seleccionado a la tabla de productos de la factura
function agregarProducto() {
    const nombreProducto = document.getElementById('nombreProductoManual').value.trim();
    const descripcion = document.getElementById('descripcionFactura').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadProductoManual').value.trim());
    const precioUnitario = parseFloat(document.getElementById('precioUnitarioManual').value.trim());
    const garantia = parseInt(document.getElementById('garantiaProducto').value.trim());

    if (nombreProducto && descripcion && !isNaN(cantidad) && !isNaN(precioUnitario) && !isNaN(garantia)) {
        const tbody = document.getElementById('productosTabla').getElementsByTagName('tbody')[0];

        const newRow = tbody.insertRow();
        const cellNombre = newRow.insertCell(0);
        const cellCantidad = newRow.insertCell(1);
        const cellPrecioUnitario = newRow.insertCell(2);
        const cellGarantia = newRow.insertCell(3);
        const cellDescripcion = newRow.insertCell(4);
        const cellTotal = newRow.insertCell(5);
        const cellAcciones = newRow.insertCell(6);

        cellNombre.textContent = nombreProducto;
        cellCantidad.textContent = cantidad;
        cellPrecioUnitario.textContent = precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 2 });
        cellGarantia.textContent = garantia;
        cellDescripcion.textContent = descripcion;
        cellTotal.textContent        // Calculate total for the product
        const totalProducto = cantidad * precioUnitario;
        cellTotal.textContent = totalProducto.toLocaleString('es-CO', { minimumFractionDigits: 2 });

        // Clear the form fields after adding the product
        limpiarFormularioProducto();

        // Add delete button for the row
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.addEventListener('click', () => {
            const row = deleteBtn.closest('tr');
            const rowIndex = row.rowIndex - 1;
            tbody.deleteRow(rowIndex);
        });
        cellAcciones.appendChild(deleteBtn);
    } else {
        alert('Por favor, complete todos los campos correctamente.');
    }
}

// Función para limpiar el formulario de productos después de agregar uno
function limpiarFormularioProducto() {
    document.getElementById('nombreProductoManual').value = '';
    document.getElementById('descripcionFactura').value = '';
    document.getElementById('cantidadProductoManual').value = '';
    document.getElementById('precioUnitarioManual').value = '';
    document.getElementById('garantiaProducto').value = '';
}

// Función para obtener los productos seleccionados desde la tabla
function obtenerProductosSeleccionados() {
    const productos = [];
    const tbody = document.getElementById('productosTabla').getElementsByTagName('tbody')[0];

    for (let i = 0; i < tbody.rows.length; i++) {
        const row = tbody.rows[i];
        const producto = {
            nombre: row.cells[0].textContent,
            cantidad: parseInt(row.cells[1].textContent),
            precioUnitario: parseFloat(row.cells[2].textContent.replace(/\./g, '').replace(',', '.')), // Fix parsing for price
            garantia: parseInt(row.cells[3].textContent),
            descripcion: row.cells[4].textContent,
            total: parseFloat(row.cells[5].textContent.replace(/\./g, '').replace(',', '.')) // Fix parsing for total
        };
        productos.push(producto);
    }

    return productos;
}

// Función para limpiar el formulario de productos
function limpiarFormulario() {
    document.getElementById('nombreCliente').value = '';
    document.getElementById('cedulaNit').value = '';
    document.getElementById('nombreProductoManual').value = '';
    document.getElementById('cantidadProductoManual').value = '';
    document.getElementById('precioUnitarioManual').value = '';
    document.getElementById('garantiaProducto').value = '';
    document.getElementById('productosTabla').getElementsByTagName('tbody')[0].innerHTML = '';
}

