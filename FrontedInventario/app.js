const apiUrl = 'http://localhost:8082/producto';

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarTotalGlobal();
    cargarTotalPorCategoria();

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
        cargarProductosPorCategoria();
    });

    // Nueva funcionalidad: Búsqueda en tiempo real por nombre
    document.getElementById('searchInput').addEventListener('input', async () => {
        const nombre = document.getElementById('searchInput').value;
        if (nombre === '') {
            cargarProductos(); // Si el campo de búsqueda está vacío, cargar todos los productos
        } else {
            buscarProductosPorNombre(nombre);
        }
    });
});

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
        mostrarProductosEnTabla(productos);

    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarProductosPorCategoria() {
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    cargarProductos(filtroCategoria);
}

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

async function buscarProductosPorNombre(nombre) {
    try {
        const response = await fetch(`${apiUrl}/nombre/${nombre}`);
        if (!response.ok) {
            throw new Error('Error al buscar productos por nombre.');
        }

        const productos = await response.json();
        mostrarProductosEnTabla(productos);
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

// Función para formatear números con punto como separador de miles y sin decimales
function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

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

async function eliminarProducto(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto.');
            }

            cargarProductosPorCategoria();  // Recargar productos en la categoría seleccionada
            cargarTotalGlobal();
            cargarTotalPorCategoria();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function limpiarFormulario() {
    document.getElementById('productoId').value = '';
    document.getElementById('productoForm').reset();
}

function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}


