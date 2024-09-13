const apiUrl = 'http://localhost:8082/producto';

let currentPage = 0;
let pageSize = 13;
let totalPages = 0;
let filtroCategoriaSeleccionada = null;


document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarTotalPorCategoria();
    cargarTotalGlobal()

    document.getElementById('productoForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('productoId').value;
        const nombre = document.getElementById('nombre').value;
        const precioComprado = parseInt(document.getElementById('precioComprado').value.replace(/\./g, ''));
        const precioVendido = parseInt(document.getElementById('precioVendido').value.replace(/\./g, ''));
        const cantidad = document.getElementById('cantidad').value;
        const categoriaId = document.getElementById('categoria').value;

        const producto = { nombre, precioComprado, precioVendido, cantidad, categoria: { id: categoriaId }, total: precioComprado * cantidad };

        try {
            let response;
            if (id) {
                response = await fetch(`${apiUrl}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                });
            } else {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                });
            }

            if (!response.ok) {
                throw new Error('Error al guardar el producto.');
            }

            $('#productoModal').modal('hide');
            limpiarFormulario();
            cargarProductosPorCategoria();  // Recargar productos en la categoría seleccionada
            cargarTotalPorCategoria();
            cargarTotalGlobal();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    document.getElementById('filtroCategoria').addEventListener('change', async () => {
        currentPage = 0;
        filtroCategoriaSeleccionada = document.getElementById('filtroCategoria').value;  // Guardar categoría seleccionada
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

async function editarProducto(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) {
            throw new Error('Error al cargar el producto para editar.');
        }

        const producto = await response.json();
        document.getElementById('productoId').value = producto.id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('precioComprado').value = formatNumber(producto.precioComprado);
        document.getElementById('precioVendido').value = formatNumber(producto.precioVendido);
        document.getElementById('cantidad').value = producto.cantidad;
        document.getElementById('categoria').value = producto.categoria.id;

        $('#productoModal').modal('show');
    } catch (error) {
        console.error('Error:', error);
    }
}


async function cargarProductos(categoriaId = filtroCategoriaSeleccionada) {
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
    pagination.innerHTML = '';
    
    // Determinar el rango de páginas visibles
    const startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Botón "Anterior"
    const prevButton = document.createElement('li');
    prevButton.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<a class="page-link" href="#">Anterior</a>';
    prevButton.onclick = () => {
        if (currentPage > 0) {
            currentPage--;
            cargarProductos();  // Mantener la categoría seleccionada
        }
    };
    pagination.appendChild(prevButton);
    
    // Números de página
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('li');
        pageButton.className = `page-item ${currentPage === i ? 'active' : ''}`;
        pageButton.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
        pageButton.onclick = () => {
            currentPage = i;
            cargarProductos();  // Mantener la categoría seleccionada
        };
        pagination.appendChild(pageButton);
    }
    
    // Botón "Siguiente"
    const nextButton = document.createElement('li');
    nextButton.className = `page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextButton.innerHTML = '<a class="page-link" href="#">Siguiente</a>';
    nextButton.onclick = () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            cargarProductos();  // Mantener la categoría seleccionada
        }
    };
    pagination.appendChild(nextButton);
}


const maxVisiblePages = 3;  // Número de botones de páginas visibles
// Llamar a la función de actualización inicial
actualizarPaginacion();

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
async function cargarTotalGlobal() {
    try {
        const response = await fetch(`${apiUrl}/totalGlobal`);
        if (!response.ok) {
            throw new Error('Error al cargar el total global.');
        }

        const totalGlobal = await response.json();
        document.getElementById('totalGlobal').textContent = formatNumber(totalGlobal);
    } catch (error) {
        console.error('Error:', error);
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

