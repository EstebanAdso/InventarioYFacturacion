const apiUrl = 'http://localhost:8082/producto';
const apiCategoria = 'http://localhost:8082/categoria'

let currentPage = 0;
let pageSize = 14;
let totalPages = 0;
let filtroCategoriaSeleccionada = null;
let mostrandoInactivos = false; 
let modificarTexto = document.getElementById('productoModalLabel')
const botonAgregarProducto = document.getElementById('agregarProducto')
const botonAgregarCategoria = document.getElementById('agregarCategoria')
const botonVerTotal = document.getElementById('verTotal')
const buscador = document.getElementById('searchInput')
const titulo = document.getElementById('titulo')

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarTotalPorCategoria();
    cargarTotalGlobal()
    cargarCategorias();

    let botonModificador = document.getElementById('agregarProducto');

    botonModificador.addEventListener('click', function() {
        modificarTexto.textContent = 'Agregar Producto';
    });

    document.getElementById('productoForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('productoId').value;
        const nombre = document.getElementById('nombre').value.toUpperCase().trim();
        const precioComprado = parseInt(document.getElementById('precioComprado').value.replace(/\./g, ''));
        const precioVendido = parseInt(document.getElementById('precioVendido').value.replace(/\./g, ''));
        const cantidad = document.getElementById('cantidad').value;
        const categoriaId = document.getElementById('categoria').value;
        const descripcion = document.getElementById('descripcion').value.trim();

        const producto = { nombre, precioComprado, precioVendido, cantidad, categoria: { id: categoriaId }, total: precioComprado * cantidad, descripcion };

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
                    body: JSON.stringify(producto, id)
                });
            }

            if (!response.ok) {
                mostrarMensaje('error', 'Error al guardar el producto.');
            }

            mostrarMensaje('success', id ? 'Producto actualizado satisfactoriamente.' : 'Producto agregado satisfactoriamente.');
            $('#productoModal').modal('hide');
            limpiarFormulario();
            cargarProductosPorCategoria();  // Recargar productos en la categoría seleccionada
            cargarTotalPorCategoria();
            cargarTotalGlobal();
        } catch (error) {
            console.error('Error:', error);
        }

        
    });

    document.getElementById('categoriaForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('productoId').value;
        const nombre = document.getElementById('nombreCategoria').value.toUpperCase();
        const descripcion = document.getElementById('descripcionCategoria').value.toUpperCase();
        const descripcionGarantia = document.getElementById('descripcionGarantia').value.toUpperCase();

        const categoria = { nombre, descripcion, descripcionGarantia};

        try {
            let response;
            if (id) {
                response = await fetch(`${apiCategoria}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                });
            } else {
                response = await fetch(apiCategoria, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(categoria)
                });
            }

            if (!response.ok) {
                mostrarMensaje('error', 'Error al agregar la categoría.');
            }
            mostrarMensaje('success', id ? 'Categoría actualizada satisfactoriamente.' : 'Categoría agregada satisfactoriamente.');

            $('#categoriaModal').modal('hide');
            limpiarFormulario();
            cargarProductosPorCategoria();  
            cargarTotalPorCategoria();
            cargarTotalGlobal();
            cargarCategorias();
        } catch (error) {
            mostrarMensaje('error', 'Error al intentar conectar con el servidor.'); // Mensaje de error genérico
        }
    });

    document.getElementById('filtroCategoria').addEventListener('change', async () => {
        currentPage = 0;
        filtroCategoriaSeleccionada = document.getElementById('filtroCategoria').value;  // Guardar categoría seleccionada
        cargarProductosPorCategoria();
    });

    buscador.addEventListener('input', async () => {
        const nombre = document.getElementById('searchInput').value;
        currentPage = 0;
        if (nombre === '') {
            cargarProductos();
        } else {
            buscarProductosPorNombre(nombre);
        }
    });

    document.getElementById('filtroCategoria').addEventListener('change', async () => {
        currentPage = 0;  // Reiniciar paginación
        filtroCategoriaSeleccionada = document.getElementById('filtroCategoria').value;
        if (mostrandoInactivos) {
            cargarProductosInactivos();
        } else {
            cargarProductos();
        }
    });


    document.getElementById('pageSize').addEventListener('change', (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 0;
        cargarProductos();
    });

    document.getElementById('toggleProductosBtn').addEventListener('click', toggleProductos);


    function toggleProductos() {
        const toggleBtn = document.getElementById('toggleProductosBtn');
    
        currentPage = 0; // Reiniciar la paginación cuando cambies entre activos/inactivos
    
        if (mostrandoInactivos) {
            cargarProductos(); // Cargar productos activos
            toggleBtn.textContent = 'Productos Inactivos';
            toggleBtn.classList.remove('btn-success');
            toggleBtn.classList.add('btn-warning');
    
            // Habilitar los botones y el buscador
            botonAgregarCategoria.removeAttribute('disabled');
            botonAgregarProducto.removeAttribute('disabled');
            botonVerTotal.removeAttribute('disabled');
            buscador.removeAttribute('disabled');
            filtroCategoria.removeAttribute('disabled')
    
            // Quitar clase de estilo desactivado
            botonAgregarCategoria.classList.remove('disabled-style');
            botonAgregarProducto.classList.remove('disabled-style');
            botonVerTotal.classList.remove('disabled-style');
            buscador.classList.remove('disabled-style');
            filtroCategoria.classList.remove('disabled-style')
            titulo.textContent = 'Inventario de Productos'
            mostrandoInactivos = false;
        } else {
            cargarProductosInactivos(); // Cargar productos inactivos
            toggleBtn.textContent = 'Productos Activos';
            toggleBtn.classList.remove('btn-warning');
            toggleBtn.classList.add('btn-success');
    
            // Deshabilitar los botones y el buscador
            botonAgregarCategoria.setAttribute('disabled', 'disabled');
            botonAgregarProducto.setAttribute('disabled', 'disabled');
            botonVerTotal.setAttribute('disabled', 'disabled');
            buscador.setAttribute('disabled', 'disabled');
            filtroCategoria.setAttribute('disabled', 'disabled');
    
            // Agregar clase de estilo desactivado
            botonAgregarCategoria.classList.add('disabled-style');
            botonAgregarProducto.classList.add('disabled-style');
            botonVerTotal.classList.add('disabled-style');
            buscador.classList.add('disabled-style');
            filtroCategoria.classList.add('disabled-style');
            titulo.textContent = 'Inventario de Productos Inactivos'
            mostrandoInactivos = true;
        }
    }

    

    
    async function cargarCategorias() {
        try {
            const response = await fetch(apiCategoria); // Ajusta la URL si es necesario
            const categorias = await response.json();

            const filtroCategoriaSelect = document.getElementById('filtroCategoria');
            const categoriaSelect = document.getElementById('categoria');
            
            filtroCategoriaSelect.innerHTML = '<option value="">Todos</option>';
            categoriaSelect.innerHTML = '';

            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.nombre;  // Ajusta según el campo de tu entidad
                option.textContent = categoria.nombre;
                option.classList.add('option')
                filtroCategoriaSelect.appendChild(option);
            });

            categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';

            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;  // Ajusta según el campo de tu entidad
                option.textContent = categoria.nombre;
                categoriaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar las categorías:', error);
        }
    }

});

async function editarProducto(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) {
            mostrarMensaje('error', 'Error al cargar el producto para editar.');
            return;
        }

        modificarTexto = document.getElementById('productoModalLabel');
        modificarTexto.textContent = 'Editar Producto';
        const producto = await response.json();
        document.getElementById('productoId').value = producto.id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('precioComprado').value = formatNumber(producto.precioComprado);
        document.getElementById('precioVendido').value = formatNumber(producto.precioVendido);
        document.getElementById('cantidad').value = producto.cantidad;
        document.getElementById('categoria').value = producto.categoria.id;
        document.getElementById('descripcion').value = producto.descripcion;

        // Mostrar el modal para editar el producto
        $('#productoModal').modal('show');

        // Recargar la lista correcta solo si se cierra el modal
        $('#productoModal').on('hidden.bs.modal', async () => {
            if (mostrandoInactivos) {
                await cargarProductosInactivos(); // Cargar inactivos
            } else {
                await cargarProductos(); // Cargar activos
            }
        });
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
            mostrarMensaje('error', 'Error al cargar los productos.');
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
            <td>${producto.nombre.toUpperCase()}</td>
            <td>${producto.precioComprado}</td>
            <td>${formatNumber(producto.precioVendido)}</td>
            <td>${producto.cantidad}</td>
            <td>${producto.categoria.nombre}</td>
            <td>${formatNumber(producto.total)}</td>
            <td class="text-center">
                <button class="btn btn-info btn-sm" id="botonInformacion" onclick="verInformacion(${producto.id})"><img src="../css/logos/info-circle-regular-24.png" alt="Informacion"></button>
                <button class="btn btn-dark btn-sm" id="botonEditar" onclick="editarProducto(${producto.id})"><img src="../css/logos/edit-alt-solid-24.png" alt="Editar"></button>
                ${producto.estado === 'activo' 
                    ? `<button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})"><img src="../css/logos/eliminar-papelera.png" width="24px" class="invert-img" alt="Agotar"></button>` 
                    : ''} <!-- Ocultar botón Agotar si está inactivo -->
            </td>

        `;
        tbody.appendChild(tr);
    });
}

async function verInformacion(productoId) {
    try {
        // Realizamos una solicitud para obtener el producto por su ID
        const response = await fetch(`${apiUrl}/${productoId}`);
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del producto.');
        }

        const producto = await response.json();

        // Construimos la información a mostrar en el modal
        const modalInfo = `
            <strong>Nombre:</strong> ${producto.nombre.toUpperCase()}<br>
            <strong>Descripción:</strong> ${producto.descripcion ? producto.descripcion : 'No hay descripcion para este producto.'}
        `;

        // Mostramos la información en el modal
        const modalContent = document.getElementById('verInformacionModal');
        modalContent.innerHTML = modalInfo;

        // Abrimos el modal
        $('#verInfoModal').modal('show');
    } catch (error) {
        console.error('Error al mostrar la información del producto:', error);
        mostrarMensaje('error', 'No se pudo cargar la información del producto.');
    }
}



function actualizarPaginacion() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    const prevButton = document.createElement('li');
    prevButton.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<a class="page-link" href="#">Anterior</a>';
    prevButton.onclick = () => {
        if (currentPage > 0) {
            currentPage--;
            if (mostrandoInactivos) {
                cargarProductosInactivos();
            } else {
                cargarProductos();
            }
        }
    };
    pagination.appendChild(prevButton);

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('li');
        pageButton.className = `page-item ${currentPage === i ? 'active' : ''}`;
        pageButton.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
        pageButton.onclick = () => {
            currentPage = i;
            if (mostrandoInactivos) {
                cargarProductosInactivos();
            } else {
                cargarProductos();
            }
        };
        pagination.appendChild(pageButton);
    }

    const nextButton = document.createElement('li');
    nextButton.className = `page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextButton.innerHTML = '<a class="page-link" href="#">Siguiente</a>';
    nextButton.onclick = () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            if (mostrandoInactivos) {
                cargarProductosInactivos();
            } else {
                cargarProductos();
            }
        }
    };
    pagination.appendChild(nextButton);
}

async function cargarProductosInactivos() {
    try {
        const url = `${apiUrl}/inactivos?page=${currentPage}&size=${pageSize}`;
        const response = await fetch(url);
        if (!response.ok) {
            mostrarMensaje('error', 'Error al cargar los productos inactivos.');
        }

        const data = await response.json();
        const productos = data.content;
        totalPages = data.totalPages;

        mostrarProductosEnTabla(productos); // Mostramos los productos inactivos
        actualizarPaginacion();  // Actualizamos la paginación si es necesario

    } catch (error) {
        console.error('Error:', error);
    }
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
            mostrarMensaje('error', 'Error al buscar productos por nombre.');
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
    // Mostrar el modal de Bootstrap
    $('#confirmModal-eliminar').modal('show');

    // Esperar a que el usuario haga clic en el botón "Sí"
    $('#confirmBtn-eliminar').off('click').on('click', async function() {
        $('#confirmModal-eliminar').modal('hide'); // Cerrar el modal
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                mostrarMensaje('error', 'Error al desactivar el producto.');
            } else {
                mostrarMensaje('success', 'Producto desactivado satisfactoriamente.');
                cargarProductos(); // Función para recargar la lista de productos
                cargarTotalPorCategoria(); // Función para recargar el total por categoría
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}


async function cargarTotalGlobal() {
    try {
        const response = await fetch(`${apiUrl}/totalGlobal`);
        if (!response.ok) {
            mostrarMensaje('error', 'Error al cargar el total global.');
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
            mostrarMensaje('error', 'Error al cargar el total de la categoria.');
        }

        const totales = await response.json();
        const totalCategoriasList = document.getElementById('totalCategorias');
        totalCategoriasList.innerHTML = '';

        for (const [categoria, total] of Object.entries(totales)) {
            const li = document.createElement('li');
            li.textContent = `${categoria}:  $${formatNumber(total)}`;
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
    document.getElementById('categoriaForm').reset();
}


function mostrarMensaje(tipo, texto) {
    const mensajeNotificacion = document.getElementById('mensajeNotificacion');
    const mensajeTexto = document.getElementById('mensajeTexto');

    mensajeTexto.innerText = texto;

    if (tipo === 'error') {
        mensajeNotificacion.className = 'alert alert-danger alert-dismissible fade show';
    } else if (tipo === 'success') {
        mensajeNotificacion.className = 'alert alert-success alert-dismissible fade show';
    }

    mensajeNotificacion.style.display = 'block';

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        mensajeNotificacion.style.display = 'none';
    }, 5000);
}

function cerrarMensaje() {
    const mensajeNotificacion = document.getElementById('mensajeNotificacion');
    mensajeNotificacion.style.display = 'none';
}
