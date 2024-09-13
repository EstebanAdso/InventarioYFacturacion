const apiUrl = 'http://localhost:8082/producto';

let currentPage = 0;
let pageSize = 10;
let totalPages = 0;

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarTotalPorCategoria();
    cargarTotalGloab

    document.getElementById('productoForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        // ... (el resto del código del evento submit)
    });

    document.getElementById('filtroCategoria').addEventListener('change', async () => {
        currentPage = 0;
        cargarProductosPorCategoria();
    });

    document.getElementById('searchInput').addEventListener('input', async () => {
        const nombre = document.getElementById('searchInput').value;
        currentPage = 0;
        if (nombre === '') {
            cargarProductos();
        } else {
            buscarProductosPorNombre(nombre);
        }
    });

    document.getElementById('pageSize').addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 0;
        cargarProductos();
    });
});

async function cargarProductos(categoriaId = null) {
    try {
        let url = `${apiUrl}?page=${currentPage}&size=${pageSize}`;
        if (categoriaId) {
            url = `${apiUrl}/categoria/${categoriaId}?page=${currentPage}&size=${pageSize}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al cargar los productos.');
        }

        const data = await response.json();
        const productos = data.content;
        totalPages = data.totalPages;

        mostrarProductosEnTabla(productos);
        actualizarPaginacion();

    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarProductosEnTabla(productos) {
    const tbody = document.getElementById('productoTableBody');
    tbody.innerHTML = '';

    productos.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${formatNumber(producto.precioComprado)}</td>
            <td>${formatNumber(producto.precioVendido)}</td>
            <td>${producto.cantidad}</td>
            <td>${producto.categoria.nombre}</td>
            <td>${formatNumber(producto.total)}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarPaginacion() {
    const pagination = document.getElementById('pagination');
    if (!pagination) {
        console.error('Elemento de paginación no encontrado');
        return;
    }
    pagination.innerHTML = '';
    
    // ... (el resto del código de actualizarPaginacion permanece igual)
}

async function cargarProductosPorCategoria() {
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    cargarProductos(filtroCategoria);
}

async function buscarProductosPorNombre(nombre) {
    try {
        const response = await fetch(`${apiUrl}/nombre/${nombre}?page=${currentPage}&size=${pageSize}`);
        if (!response.ok) {
            throw new Error('Error al buscar productos por nombre.');
        }

        const data = await response.json();
        const productos = data.content;
        totalPages = data.totalPages;

        mostrarProductosEnTabla(productos);
        actualizarPaginacion();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarProducto(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto.');
            }

            cargarProductos();
            cargarTotalPorCategoria();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Asegúrate de que esta función esté implementada
async function cargarTotalPorCategoria() {
    try {
        const response = await fetch(`${apiUrl}/totalPorCategoria`);
        if (!response.ok) {
            throw new Error('Error al cargar los totales por categoría.');
        }

        const totales = await response.json();
        const totalCategoriasList = document.getElementById('totalCategorias');
        totalCategoriasList.innerHTML = '';

        for (const [categoria, total] of Object.entries(totales)) {
            const li = document.createElement('li');
            li.textContent = `${categoria}: ${formatNumber(total)}`;
            totalCategoriasList.appendChild(li);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ... (otras funciones como editarProducto, limpiarFormulario, etc.)
function limpiarFormulario() {
    document.getElementById('productoId').value = '';
    document.getElementById('productoForm').reset();
}

function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

