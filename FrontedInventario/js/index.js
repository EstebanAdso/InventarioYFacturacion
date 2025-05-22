const apiUrl = 'http://localhost:8082/producto';
const apiCategoria = 'http://localhost:8082/categoria'
const productosInactivos = 'http://localhost:8082/producto/buscarInactivo'
const apiCodigosBarras = 'http://localhost:8082/codigoBarra'

let currentPage = 0;
let pageSize = 14;
let totalPages = 0;
const maxVisiblePages = 6;
let filtroCategoriaSeleccionada = null;
let mostrandoInactivos = false;
let modificarTexto = document.getElementById('tab-producto')
const botonAgregarProducto = document.getElementById('agregarProducto')
const botonAgregarCategoria = document.getElementById('agregarCategoria')
const botonVerTotal = document.getElementById('verTotal')
const buscador = document.getElementById('searchInput')
const titulo = document.getElementById('titulo')
const pagination = document.getElementById('pagination');

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarTotalPorCategoria();
    cargarTotalGlobal()
    cargarCategorias();

    let botonModificador = document.getElementById('agregarProducto');

    botonModificador.addEventListener('click', function () {
        modificarTexto.textContent = 'Agregar Producto';
        // Hide code input when adding new product

        // Reset tabs when adding new product
        const tabsContainer = document.getElementById('modalTabs');
        const tabContentContainer = document.getElementById('modalTabContent');

        try {
            // Reset all tabs
            if (tabsContainer) {
                const allTabLinks = tabsContainer.querySelectorAll('.nav-link');
                allTabLinks.forEach(link => link.classList.remove('active'));
            }

            // Reset all tab content
            if (tabContentContainer) {
                const allTabPanes = tabContentContainer.querySelectorAll('.tab-pane');
                allTabPanes.forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
            }

            // Activate Producto tab
            const tabProductoLink = document.querySelector('a[href="#contenido-producto"]');
            if (tabProductoLink) {
                tabProductoLink.classList.add('active');
                const productoPane = document.getElementById('contenido-producto');
                if (productoPane) {
                    productoPane.classList.add('show', 'active');
                }
            }

            // Hide Códigos tab
            // const tabCodigo = document.getElementById('tab-codigo');
            // if (tabCodigo) tabCodigo.style.display = 'none';
        } catch (error) {
            console.error('Error al configurar pestañas:', error);
        }
    });

    document.getElementById('cantidad').addEventListener('input', function () {
        document.getElementById('cantidadCodigos').value = this.value;
    });

    const guardarBtn = document.getElementById('guardarBtn');
    guardarBtn.addEventListener('click', guardarProducto);

    async function guardarProducto(event) {
        event.preventDefault();
        const id = document.getElementById('productoId').value;
        const nombre = document.getElementById('nombre').value.toUpperCase().trim();
        const precioComprado = parseInt(document.getElementById('precioComprado').value.replace(/\./g, ''));
        const precioVendido = parseInt(document.getElementById('precioVendido').value.replace(/\./g, ''));
        const cantidad = document.getElementById('cantidad').value;
        const categoriaId = document.getElementById('categoria').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const alertaStock = document.getElementById('alertaStock').value;
        const codigosBarras = document.querySelectorAll('.codigo-barras');
        const codigosDeBarra = Array.from(codigosBarras)
        .map(input => input.value.trim())
        .filter(codigo => codigo !== '')
        .map(value => ({ codigoBarra: value }));
   
        if (id && codigosDeBarra.length > 0) {
            // Puedes hacer una petición adicional si quieres validar cuáles son nuevos
            // Pero aquí asumimos que son todos nuevos a agregar (simple caso)
            for (const codigo of codigosDeBarra) {
                await fetch(apiCodigosBarras, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productoId: id,
                        codigoBarra: codigo.codigoBarra
                    })
                });
            }
        }

        const form = document.getElementById('productoForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }


        const producto = { nombre, precioComprado, precioVendido, cantidad, alertaStock, categoria: { id: categoriaId }, codigosDeBarra, total: precioComprado * cantidad, descripcion };

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
                mostrarMensaje('error', 'Error al guardar el producto.');
            }

            const data = await response.json();

            mostrarMensaje('success', id ? 'Producto actualizado satisfactoriamente.' : 'Producto agregado satisfactoriamente.');
            $('#productoModal').modal('hide');
            limpiarFormulario();
            cargarProductosPorCategoria();  // Recargar productos en la categoría seleccionada
            cargarTotalPorCategoria();
            cargarTotalGlobal();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const btnImprimirCodigosYGuardar = document.getElementById('imprimirCodigosYGuardarBtn');
    btnImprimirCodigosYGuardar.addEventListener('click', imprimirCodigosYGuardar);

    async function imprimirCodigosYGuardar(event) {
        event.preventDefault();
        const id = document.getElementById('productoId').value;
        const nombre = document.getElementById('nombre').value.toUpperCase().trim();
        const precioComprado = parseInt(document.getElementById('precioComprado').value.replace(/\./g, ''));
        const precioVendido = parseInt(document.getElementById('precioVendido').value.replace(/\./g, ''));
        const cantidad = document.getElementById('cantidad').value;
        const categoriaId = document.getElementById('categoria').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const alertaStock = document.getElementById('alertaStock').value;

        const producto = { nombre, precioComprado, precioVendido, cantidad, alertaStock, categoria: { id: categoriaId }, total: precioComprado * cantidad, descripcion };
        
        
        const form = document.getElementById('productoForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

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
                await mostrarMensaje('error', 'Error al guardar el producto.');
                throw new Error('Error al guardar el producto');
            }

            const data = await response.json();
            const codigoGenerado = `${data.sku}`;
            const cantidadCodigos = document.getElementById('cantidadCodigos').value;

            if (!codigoGenerado) {
                await mostrarMensajeParrafo('Debes agregar un código', 'red', 'mensajeCodigoAdvertencia');
                console.log('Debes agregar un código');

                setTimeout(() => {
                    document.getElementById('mensajeCodigoAdvertencia').textContent = '';
                }, 3000);
                return;
            }

            const htmlCodigos = await generarHTMLParaCodigos(cantidadCodigos, codigoGenerado);
            const ventanaImpresion = window.open('', '', 'height=1200,width=940');

            // Esperar a que la ventana esté lista
            ventanaImpresion.document.write(htmlCodigos);
            ventanaImpresion.document.close();

            // Esperar a que la ventana cargue completamente antes de imprimir
            ventanaImpresion.onload = function () {
                ventanaImpresion.print();
            };

            await mostrarMensaje('success', id ? 'Producto actualizado satisfactoriamente.' : 'Producto agregado satisfactoriamente.');
            $('#productoModal').modal('hide');
            limpiarFormulario();
            await cargarProductosPorCategoria();  // Recargar productos en la categoría seleccionada
            await cargarTotalPorCategoria();
            await cargarTotalGlobal();
        } catch (error) {
            console.error('Error:', error);
            await mostrarMensaje('error', 'Ocurrió un error al procesar la solicitud.');
        }
    }


    document.getElementById('categoriaForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('productoId').value;
        const nombre = document.getElementById('nombreCategoria').value.toUpperCase();
        const descripcion = document.getElementById('descripcionCategoria').value.toUpperCase();
        const descripcionGarantia = document.getElementById('descripcionGarantia').value.toUpperCase();

        const categoria = { nombre, descripcion, descripcionGarantia };

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
            if (mostrandoInactivos) {
                cargarProductosInactivos();
            } else {
                cargarProductos();
            }
        } else {
            if (mostrandoInactivos) {
                buscarProductosPorNombreInactivo(nombre);
            } else {
                buscarProductosPorNombre(nombre);
            }
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
        const totalColumnHeader = document.querySelector('table th:nth-child(6)');

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
            filtroCategoria.removeAttribute('disabled');
            pagination.style.display = '';

            // Quitar clase de estilo desactivado
            botonAgregarCategoria.classList.remove('disabled-style');
            botonAgregarProducto.classList.remove('disabled-style');
            botonVerTotal.classList.remove('disabled-style');
            filtroCategoria.classList.remove('disabled-style');
            titulo.textContent = 'Inventario de Productos';
            buscador.value = '';
            mostrandoInactivos = false;
            
            // Mostrar la columna de Total
            totalColumnHeader.style.display = '';
        } else {
            cargarProductosInactivos(); // Cargar productos inactivos
            toggleBtn.textContent = 'Productos Activos';
            toggleBtn.classList.remove('btn-warning');
            toggleBtn.classList.add('btn-success');
            
            // Deshabilitar los botones y el buscador
            botonAgregarCategoria.setAttribute('disabled', 'disabled');
            botonAgregarProducto.setAttribute('disabled', 'disabled');
            botonVerTotal.setAttribute('disabled', 'disabled');
            filtroCategoria.setAttribute('disabled', 'disabled');
            pagination.style.display = 'none';

            // Agregar clase de estilo desactivado
            botonAgregarCategoria.classList.add('disabled-style');
            botonAgregarProducto.classList.add('disabled-style');
            botonVerTotal.classList.add('disabled-style');
            filtroCategoria.classList.add('disabled-style');
            titulo.textContent = 'Inventario de Productos Inactivos';
            buscador.value = '';
            mostrandoInactivos = true;

            // Ocultar la columna de Total
            totalColumnHeader.style.display = 'none';
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
        console.log(response)
        if (!response.ok) {
            mostrarMensaje('error', 'Error al cargar el producto para editar.');
            return;
        }

        mostrarCodigosDeBarra(id);

        modificarTexto = document.getElementById('tab-producto');
        modificarTexto.textContent = 'Editar Producto';
        const producto = await response.json();
        document.getElementById('productoId').value = producto.id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('precioComprado').value = formatNumber(producto.precioComprado);
        document.getElementById('precioVendido').value = formatNumber(producto.precioVendido);
        document.getElementById('cantidad').value = producto.cantidad;
        document.getElementById('alertaStock').value = producto.alertaStock;
        document.getElementById('categoria').value = producto.categoria.id;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('codigoSkuInput').value = producto.sku;

        // Ensure proper tab switching when editing product
        const tabCodigoLink = document.querySelector('a[href="#contenido-codigo"]');
        const tabsContainer = document.getElementById('modalTabs');
        const tabContentContainer = document.getElementById('modalTabContent');

        try {
            // Reset all tabs
            if (tabsContainer) {
                const allTabLinks = tabsContainer.querySelectorAll('.nav-link');
                allTabLinks.forEach(link => link.classList.remove('active'));
            }

            // Reset all tab content
            if (tabContentContainer) {
                const allTabPanes = tabContentContainer.querySelectorAll('.tab-pane');
                allTabPanes.forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
            }

            // Activate Códigos tab
            if (tabCodigoLink) {
                tabCodigoLink.classList.add('active');
                const codigoPane = document.getElementById('contenido-codigo');
                if (codigoPane) {
                    codigoPane.classList.add('show', 'active');
                }
            }

            // Mostrar el modal para editar el producto
            $('#productoModal').modal('show');
        } catch (error) {
            console.error('Error al configurar pestañas:', error);
        }

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

const btnImprimirCodigos = document.getElementById('imprimirCodigosBtn');
if (btnImprimirCodigos) {
    btnImprimirCodigos.addEventListener('click', imprimirCodigos);
}

// Manejador para el botón de guardar código de barras
document.addEventListener('DOMContentLoaded', function() {
    const btnGuardarCodigo = document.getElementById('guardarCodigoBtn');
    if (btnGuardarCodigo) {
        btnGuardarCodigo.addEventListener('click', function() {
            const productoId = document.getElementById('productoId').value;
            const codigoBarrasInput = document.getElementById('codigoBarrasInput');
            const codigoBarras = codigoBarrasInput ? codigoBarrasInput.value.trim() : '';
            
            if (!productoId) {
                mostrarMensaje('error', 'No hay un producto seleccionado.');
                return;
            }
            
        
            
            // Llamar a la función asíncrona
            guardarCodigoBarras(productoId, codigoBarras, codigoBarrasInput, btnGuardarCodigo);
        });
    }
});

// Función para guardar el código de barras
async function guardarCodigoBarras(productoId, codigoBarras, inputElement, buttonElement) {
    if (!codigoBarras || codigoBarras.trim().length === 0) {
        await mostrarMensajeParrafo('Debes agregar un código', 'red', 'mensajeCodigoAdvertencia');
        console.log('Debes agregar un código');
        return;
    }
    
    try {
        const response = await fetch(apiCodigosBarras, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productoId: productoId,
                codigoBarra: codigoBarras
            })
        });
        
        if (!response.ok) {
            mostrarMensajeParrafo('El codigo ya existe', 'red', 'mensajeCodigoAdvertencia');
            return;
        }
        
        // Limpiar el campo después de guardar
        if (inputElement) {
            inputElement.value = '';
        }
        
        limpiarMensajeParrafo('mensajeCodigoAdvertencia');
        mostrarCodigosDeBarra(productoId);
        
    } catch (error) {
        console.error('Error al guardar el código de barras:', error);
    } finally {
        // Restaurar el botón
        if (buttonElement) {
            buttonElement.disabled = false;
        }
    }
}

async function imprimirCodigos() {
    const codigo = document.getElementById('codigoSkuInput').value;
    const cantidad = document.getElementById('cantidadCodigosTab').value;
    
    if (!codigo) {
        mostrarMensajeParrafo('Debes agregar un código', 'red', 'mensajeCodigoAdvertencia');
        console.log('Debes agregar un código');

        setTimeout(() => {
            document.getElementById('mensajeCodigoAdvertencia').textContent = '';
        }, 3000);
        return;
    }
    
    const htmlCodigos = await generarHTMLParaCodigos(cantidad, codigo);
    
    const ventanaImpresion = window.open('', '_blank', 'height=1200,width=940');
    ventanaImpresion.document.write(htmlCodigos);
    
    // Esperar a que el contenido se cargue completamente
    ventanaImpresion.document.addEventListener('DOMContentLoaded', () => {
        // Esperar un breve momento para asegurar que JsBarcode esté disponible
        setTimeout(() => {
            ventanaImpresion.print();
        }, 500);
    });
    
    ventanaImpresion.document.close();
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

        // Crear el contenido HTML basado en si estamos mostrando productos inactivos o no
        let totalColumnContent = '';
        if (!mostrandoInactivos) {
            totalColumnContent = `<td class="text-right pr-2 text-success font-weight-bold" style="letter-spacing: 0.05em">$${formatNumber(producto.total)}</td>`;
        } else {
            // Para productos inactivos, crear una celda oculta
            totalColumnContent = `<td style="display: none;"></td>`;
        }

        tr.innerHTML = `
            <td>${producto.nombre.toUpperCase()}</td>
            <td class="text-right pr-1">${producto.precioComprado}</td>
            <td class="text-right pr-1">${formatNumber(producto.precioVendido)}</td>
            <td class="text-center">${producto.cantidad}</td>
            <td class="text-center">${producto.categoria.nombre}</td>
            ${totalColumnContent}
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

async function cargarProductosPorCategoria() {
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    cargarProductos(filtroCategoria);
}

async function buscarProductosPorNombre(nombre) {
    try {
        // Limpiar y preparar el nombre para búsqueda
        const terminoBusqueda = nombre.trim();

        if (!terminoBusqueda) {
            mostrarMensaje('info', 'Por favor ingrese un término de búsqueda.');
            return;
        }

        const response = await fetch(`${apiUrl}/nombre/${terminoBusqueda}?page=${currentPage}&size=${pageSize}`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();


        mostrarProductosEnTabla(data.content);
        totalPages = data.totalPages;
        actualizarPaginacion();

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', 'Error al buscar productos. Por favor intente nuevamente.');
    }
}

async function buscarProductosPorNombreInactivo(nombre) {
    try {
        // Limpiar y preparar el nombre para búsqueda
        const terminoBusqueda = nombre.trim();

        if (!terminoBusqueda) {
            mostrarMensaje('info', 'Por favor ingrese un término de búsqueda.');
            return;
        }

        const response = await fetch(`${apiUrl}/nombreInactivo/${terminoBusqueda}?page=${currentPage}&size=${pageSize}`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();


        mostrarProductosEnTabla(data.content);
        totalPages = data.totalPages;
        actualizarPaginacion();

    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', 'Error al buscar productos. Por favor intente nuevamente.');
    }
}

async function eliminarProducto(id) {
    // Mostrar el modal de Bootstrap
    $('#confirmModal-eliminar').modal('show');

    // Esperar a que el usuario haga clic en el botón "Sí"
    $('#confirmBtn-eliminar').off('click').on('click', async function () {
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

async function listarCodigosDeBarra(id) {
    const response = await fetch(`${apiCodigosBarras}/producto/${id}`);
    if (!response.ok) {
        mostrarMensaje('error', 'Error al cargar el producto para editar.');
        return;
    }

    const codigosDeBarra = await response.json();
    console.log(codigosDeBarra)
    return codigosDeBarra;
}

async function mostrarCodigosDeBarra(id) {
    const codigosDeBarra = await listarCodigosDeBarra(id);
    const codigosBarrasContainer = document.getElementById('listCodigosDeBarra');
    codigosBarrasContainer.innerHTML = '';

    codigosDeBarra.forEach(codigo => {
        const tag = document.createElement('span');
        tag.classList.add('codigo-barras-item');
        tag.textContent = codigo.codigoBarra;

        const eliminar = document.createElement('button');
        eliminar.classList.add('eliminar-codigo');
        eliminar.textContent = 'X';

        eliminar.addEventListener('click', async function (event) {
            event.preventDefault();
            try {
                const response = await fetch(`${apiCodigosBarras}/${codigo.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    mostrarMensaje('error', 'Error al eliminar el código de barra.');
                } else {
                    mostrarMensaje('success', 'Código de barra eliminado correctamente.');
                    mostrarCodigosDeBarra(id); // Actualizar la lista
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });

        tag.appendChild(eliminar);
        codigosBarrasContainer.appendChild(tag);
    });
}

function limpiarMensajeParrafo(element) {
    document.getElementById(element).innerHTML = '';
}
function limpiarFormulario() {
    document.getElementById('productoId').value = '';
    document.getElementById('productoForm').reset();
    document.getElementById('categoriaForm').reset();
}
