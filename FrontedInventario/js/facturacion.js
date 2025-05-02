// Constantes de API
const apiClient = 'http://localhost:8082/cliente';
const apiProducto = 'http://localhost:8082/producto';

// Variables globales
let productosFiltrados = [];
let productosEnFactura = [];
let totalFacturaGlobal = 0;
let productoSeleccionadoId = null;
let detalles = [];

// Inicialización de eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const agregarProductoBtn = document.getElementById('agregarProductoBtn');
    const guardarFacturaBtn = document.getElementById('guardarFacturaBtn');
    const limpiarFormularioBtn = document.getElementById('limpiarFormularioBtn');
    
    if (agregarProductoBtn) agregarProductoBtn.addEventListener('click', agregarProducto);
    if (guardarFacturaBtn) guardarFacturaBtn.addEventListener('click', guardarFactura);
    if (limpiarFormularioBtn) limpiarFormularioBtn.addEventListener('click', limpiarFormulario);
});


// Carga los datos de cliente desde localStorage al cargar la página y configura su eliminación después de 20 minutos
window.addEventListener('load', () => {
    // Campos de cliente a cargar
    const clienteFields = [
        'nombreCliente',
        'cedulaNit',
        'correoCliente',
        'telefonoCliente',
        'direccionCliente'
    ];
    
    // Cargar cada campo si existe en localStorage
    clienteFields.forEach(field => {
        const value = localStorage.getItem(field);
        if (value && value !== 'null') {
            document.getElementById(field).value = value;
        }
    });

    // Limpiar datos de cliente en localStorage después de 20 minutos
    setTimeout(() => {
        clienteFields.forEach(field => localStorage.removeItem(field));
        console.log('Datos de cliente eliminados de localStorage después de 20 minutos.');
    }, 20 * 60 * 1000);
});

// Carga los productos guardados en localStorage y los muestra en la tabla
window.addEventListener('load', () => {
    const storedProducts = localStorage.getItem('productosEnFactura');
    if (!storedProducts) return;
    
    // Cargar productos guardados
    productosEnFactura = JSON.parse(storedProducts);
    const tbody = document.getElementById('productosTabla').getElementsByTagName('tbody')[0];
    
    // Agregar cada producto a la tabla
    productosEnFactura.forEach(producto => {
        const newRow = tbody.insertRow();
        
        // Crear celdas para cada propiedad del producto
        const cellId = newRow.insertCell(0);
        cellId.textContent = producto.id || 'N/A';
        cellId.style.display = 'none';
        
        // Crear y llenar el resto de celdas
        const cellNombre = newRow.insertCell(1);
        const cellCantidad = newRow.insertCell(2);
        const cellPrecioUnitario = newRow.insertCell(3);
        const cellGarantia = newRow.insertCell(4);
        const cellDescripcion = newRow.insertCell(5);
        const cellTotal = newRow.insertCell(6);
        const cellAcciones = newRow.insertCell(7);
        
        // Asignar valores a las celdas
        cellNombre.textContent = producto.nombre;
        cellCantidad.textContent = producto.cantidad;
        cellPrecioUnitario.textContent = producto.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0 });
        cellGarantia.textContent = producto.garantia;
        cellDescripcion.textContent = producto.descripcion;
        cellTotal.textContent = producto.total.toLocaleString('es-CO', { minimumFractionDigits: 0 });
        
        // Crear botón de eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.addEventListener('click', () => {
            const row = deleteBtn.closest('tr');
            const index = Array.from(tbody.rows).indexOf(row);
            tbody.deleteRow(index);
            
            // Actualizar total y localStorage
            totalFacturaGlobal -= productosEnFactura[index].total;
            productosEnFactura.splice(index, 1);
            localStorage.setItem('productosEnFactura', JSON.stringify(productosEnFactura));
            actualizarTotalFactura();
        });
        cellAcciones.appendChild(deleteBtn);
        
        // Sumar al total global
        totalFacturaGlobal += producto.total;
    });
    
    // Actualizar total en el DOM
    actualizarTotalFactura();
    
    // Programar limpieza después de 20 minutos
    setTimeout(() => {
        localStorage.removeItem('productosEnFactura');
        console.log('Productos en factura eliminados de localStorage después de 20 minutos.');
    }, 20 * 60 * 1000);
});

// Configura los eventos de input para los campos del cliente
// Guarda los valores en localStorage y muestra sugerencias cuando corresponde
const setupClienteInputEvents = () => {
    // Campos que necesitan sugerencias
    const fieldsWithSuggestions = ['nombreCliente', 'cedulaNit'];
    
    // Campos que solo necesitan guardarse en localStorage
    const simpleFields = ['correoCliente', 'telefonoCliente', 'direccionCliente'];
    
    // Configurar campos con sugerencias
    fieldsWithSuggestions.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', (e) => {
            const query = e.target.value.trim();
            localStorage.setItem(fieldId, query || "");
            
            // Mostrar u ocultar sugerencias según la longitud de la consulta
            if (query.length > 1) {
                obtenerSugerencias(query);
            } else {
                document.getElementById('sugerenciasClientes').style.display = 'none';
            }
        });
    });
    
    // Configurar campos simples
    simpleFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', (e) => {
            localStorage.setItem(fieldId, e.target.value.trim() || "");
        });
    });
};

// Inicializar eventos de input
setupClienteInputEvents();

document.getElementById('nombreProductoManual').addEventListener('input', buscarProductos);

const nombreClienteInput = document.getElementById('nombreCliente');
nombreClienteInput.addEventListener('input', function(e) {
    const cursorPos = this.selectionStart;
    const textBefore = this.value.slice(0, cursorPos);
    const textAfter = this.value.slice(cursorPos);
    
    // Convertir a mayúsculas y mantener la posición del cursor
    this.value = textBefore.toUpperCase() + textAfter;
    this.selectionStart = this.selectionEnd = cursorPos;
});


document.getElementById('verCostoAdquisicion').addEventListener('change', (e) => {
    const PCProductoInput = document.getElementById('PCProducto');
    PCProductoInput.style.webkitTextSecurity = e.target.checked ? 'none' : 'disc';
});