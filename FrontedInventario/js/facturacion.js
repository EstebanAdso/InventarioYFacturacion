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

// Agregar evento para el campo de producto
document.getElementById('nombreProductoManual').addEventListener('input', buscarProductos);

// Agregar evento para el campo de producto
document.getElementById('nombreProductoManual').addEventListener('input', buscarProductos);

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