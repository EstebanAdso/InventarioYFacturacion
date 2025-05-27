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
        const precioMayorista = parseInt(document.getElementById('productoPrecioMayoreo').value.replace(/\./g, ''));
        const cantidad = document.getElementById('cantidad').value;
        const categoriaId = document.getElementById('categoria').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const codigosdeBarra = document.querySelectorAll('.codigo-barras')
        const garantia = document.getElementById('productoGarantia').value;
        const alertaStock = document.getElementById('productoAlertaStock').value;

        const codigosDeBarra = [];
        codigosdeBarra.forEach(codigo => {
            if (codigo.value.trim() !== '') {
                codigosDeBarra.push({ codigoBarra: codigo.value.trim() });
            }
        });

        console.log(codigosDeBarra)
        const form = document.getElementById('productoForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }


        const producto = { nombre, precioComprado, precioVendido, cantidad, alertaStock, precioMayorista, garantia, codigosDeBarra, categoria: { id: categoriaId }, codigosDeBarra, total: precioComprado * cantidad, descripcion };

        console.log(producto)
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
                const errorData = await response.json(); 
                const mensajeError = errorData.message || 'Error al guardar el producto.';
                mostrarMensajeParrafo(mensajeError, 'red', 'mensajeCodigoAdvertenciaProducto');
                return;
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
        const precioMayorista = parseInt(document.getElementById('productoPrecioMayoreo').value.replace(/\./g, ''));
        const cantidad = document.getElementById('cantidad').value;
        const categoriaId = document.getElementById('categoria').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const codigosdeBarra = document.querySelectorAll('.codigo-barras')
        const garantia = document.getElementById('productoGarantia').value;
        const alertaStock = document.getElementById('productoAlertaStock').value;

        const codigosDeBarra = [];
        codigosdeBarra.forEach(codigo => {
            if (codigo.value.trim() !== '') {
                codigosDeBarra.push({ codigoBarra: codigo.value.trim() });
            }
        });

        const producto = { nombre, precioComprado, precioVendido, precioMayorista, cantidad, codigosDeBarra, garantia, alertaStock, categoria: { id: categoriaId }, total: precioComprado * cantidad, descripcion };


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
        const tabLinks = document.querySelectorAll('a[data-toggle="tab"]');
        tabLinks.forEach(tabLink => {
            tabLink.addEventListener('shown.bs.tab', function (e) {
                const codigoBarrasInput = document.getElementById('codigoBarrasInput');
                if (codigoBarrasInput) {
                    codigoBarrasInput.value = '';
                    console.log('Campo codigoBarrasInput limpiado al cambiar de pestaña');
                }
            });
        });

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
        document.getElementById('categoria').value = producto.categoria.id;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('codigoSkuInput').value = producto.sku;
        document.getElementById('productoPrecioMayoreo').value = formatNumber(producto.precioMayorista);
        document.getElementById('productoGarantia').value = producto.garantia;
        document.getElementById('productoAlertaStock').value = producto.alertaStock;


        // Ocultar la sección de códigos de barras al editar
        const codigosBarrasContainer = document.querySelector('.codigosBarrasContainerProduct');
        if (codigosBarrasContainer) {
            codigosBarrasContainer.style.display = 'none';
        }

        // Habilitar la pestaña de códigos al editar
        const tabCodigoLink = document.querySelector('a[href="#contenido-codigo"]');
        if (tabCodigoLink) {
            tabCodigoLink.style.pointerEvents = 'auto';
            tabCodigoLink.style.opacity = '1';
            tabCodigoLink.classList.remove('disabled');
        }

        // Ensure proper tab switching when editing product
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
            // Limpiar el formulario
            limpiarFormulario();
            // Limpiar el campo de código de barras
            const codigoBarrasInput = document.getElementById('codigoBarrasInput');
            if (codigoBarrasInput) {
                codigoBarrasInput.value = '';
            }
            // Cargar productos nuevamente
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
document.addEventListener('DOMContentLoaded', function () {
    const btnGuardarCodigo = document.getElementById('guardarCodigoBtn');
    if (btnGuardarCodigo) {
        btnGuardarCodigo.addEventListener('click', function () {
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

// Configuración para el manejo del lector de códigos de barras
function configurarLectorCodigoBarras() {
    let codigoBuffer = '';
    let leyendoCodigo = false;
    let timeoutId = null;
    const TIEMPO_ESPERA = 150; // Aumentado para lecturas más estables
    const LONGITUD_MINIMA = 6; // Mínimo para códigos de barras EAN-13
    const TIEMPO_MAXIMO_ESPERA = 300; // Tiempo máximo para considerar un código completo

    // Manejador global de teclado para detectar códigos de barras
    document.addEventListener('keydown', function (event) {
        // Ignorar teclas de control
        if (event.ctrlKey || event.altKey || event.metaKey) return;
        
        // Ignorar teclas de función y teclas especiales
        if (event.key.length > 1 && event.key !== 'Enter' && event.key !== 'Tab') {
            return;
        }

        // Si el foco está en un campo de texto normal, no hacer nada
        const tagName = event.target.tagName.toLowerCase();
        const esInput = tagName === 'input' || tagName === 'textarea';
        const esCampoCodigo = event.target.classList.contains('codigo-barras') ||
            event.target.id === 'codigoBarrasInput';

        // Si es un campo de texto normal que no es de código de barras, salir
        if (esInput && !esCampoCodigo) return;

        // Bloquear comportamiento por defecto para campos de código de barras
        if (esCampoCodigo) {
            const teclasPermitidas = [
                'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft',
                'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape'
            ];

            if (!teclasPermitidas.includes(event.key)) {
                event.preventDefault();
            }
        }

        // Si es la primera tecla después de una pausa
        if (!leyendoCodigo) {
            codigoBuffer = '';
            leyendoCodigo = true;
            // Configurar un tiempo máximo para evitar lecturas incompletas
            setTimeout(() => {
                if (leyendoCodigo && codigoBuffer.length > 0) {
                    procesarCodigoCompleto(codigoBuffer);
                    codigoBuffer = '';
                    leyendoCodigo = false;
                }
            }, TIEMPO_MAXIMO_ESPERA);
        }

        // Agregar tecla al buffer solo si es un carácter imprimible
        if (event.key && event.key.length === 1) {
            codigoBuffer += event.key;
            console.log('Tecla presionada:', event.key, 'Buffer actual:', codigoBuffer);
        }

        // Reiniciar el temporizador
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            if (codigoBuffer.length >= LONGITUD_MINIMA) {
                procesarCodigoCompleto(codigoBuffer);
            }
            leyendoCodigo = false;
            codigoBuffer = '';
        }, TIEMPO_ESPERA);
        
        // Manejar Enter para confirmar el código actual
        if (event.key === 'Enter' && codigoBuffer.length >= LONGITUD_MINIMA) {
            event.preventDefault();
            procesarCodigoCompleto(codigoBuffer);
            leyendoCodigo = false;
            codigoBuffer = '';
        }
    });

    function procesarCodigoCompleto(codigo) {
        console.log('Iniciando procesamiento de código completo');
        
        // Verificar si estamos en la pestaña de códigos
        const enPestanaCodigos = document.querySelector('#contenido-codigo.tab-pane.active') !== null;
        console.log('¿En pestaña de códigos?', enPestanaCodigos);
        
        let targetElement = null;
        
        // Si estamos en la pestaña de códigos, usar codigoBarrasInput
        if (enPestanaCodigos) {
            console.log('Usando codigoBarrasInput');
            targetElement = document.getElementById('codigoBarrasInput');
        } 
        // Si no estamos en la pestaña de códigos, buscar un campo vacío
        else {
            console.log('Buscando campo vacío');
            // Buscar el primer campo de código de barras vacío
            const camposCodigo = document.querySelectorAll('.codigo-barras');
            for (let campo of camposCodigo) {
                if (!campo.value || !campo.value.trim()) {
                    targetElement = campo;
                    console.log('Campo vacío encontrado:', targetElement);
                    break;
                }
            }
            
            // Si no hay campos vacíos, agregar uno nuevo
            if (!targetElement) {
                console.log('No hay campos vacíos, agregando uno nuevo');
                agregarCampoCodigoBarras();
                const nuevosCampos = document.querySelectorAll('.codigo-barras');
                targetElement = nuevosCampos[nuevosCampos.length - 1];
            }
        }
        
        console.log('Elemento objetivo final:', targetElement);
        
        if (targetElement) {
            // Enfocar el elemento antes de procesar
            targetElement.focus();
            console.log('Elemento enfocado');
            
            // Pequeña pausa para asegurar que el enfoque se haya aplicado
            setTimeout(() => {
                procesarCodigo(codigo, targetElement);
            }, 50);
        } else {
            console.error('No se pudo encontrar un elemento de destino válido');
        }
    }

    function codigoYaExiste(codigo) {
        // Buscar en todos los campos de código de barras
        const camposCodigo = document.querySelectorAll('.codigo-barras, #codigoBarrasInput');
        for (let campo of camposCodigo) {
            if (campo.value === codigo) {
                return true; // Código duplicado encontrado
            }
        }
        return false; // No se encontró duplicado
    }

    function procesarCodigo(codigo, elemento) {
        try {
            console.log('Procesando código:', codigo, 'para elemento:', elemento);
            
            // Limpiar el buffer y el temporizador
            leyendoCodigo = false;
            codigoBuffer = '';
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            console.log('Código leído:', codigo);

            // Validar longitud mínima
            if (codigo.length < LONGITUD_MINIMA) {
                console.log('Código muy corto');
                return; // Código muy corto
            }

            // Verificar si el código ya existe
            if (codigoYaExiste(codigo)) {
                console.log('Código duplicado:', codigo);
                
                // Mostrar mensaje según el formulario activo
                const enPestanaCodigos = document.querySelector('#contenido-codigo.tab-pane.active') !== null;
                if (enPestanaCodigos) {
                    // En la pestaña de códigos
                    mostrarMensajeParrafo('Este código de barras esta en lista de espera para ser agregado', 'red', 'mensajeCodigoAdvertencia');
                    // Enfocar y seleccionar el texto para facilitar la corrección
                    if (elemento) {
                        elemento.focus();
                        elemento.select();
                    }
                } else {
                    // En el formulario de producto
                    mostrarMensajeParrafo('Este código de barras esta en lista de espera para ser agregado', 'red', 'mensajeCodigoAdvertenciaProducto');
                }
                
                // Mostrar notificación global
                mostrarMensaje('advertencia', 'Código de barras duplicado');
                return;
            }

            // Si el elemento objetivo ya tiene un valor, buscar el siguiente campo vacío
            if (elemento && elemento.value && elemento.value.trim() !== '') {
                console.log('Elemento ya tiene valor, buscando siguiente campo vacío');
                const camposCodigo = document.querySelectorAll('.codigo-barras, #codigoBarrasInput');
                for (let campo of camposCodigo) {
                    if (!campo.value || !campo.value.trim()) {
                        console.log('Encontrado campo vacío:', campo);
                        elemento = campo;
                        break;
                    }
                }

                // Si no hay campos vacíos, crear uno nuevo (excepto para codigoBarrasInput)
                if ((!elemento || elemento.value.trim() !== '') && elemento.id !== 'codigoBarrasInput') {
                    console.log('Agregando nuevo campo');
                    agregarCampoCodigoBarras();
                    const nuevosCampos = document.querySelectorAll('.codigo-barras');
                    elemento = nuevosCampos[nuevosCampos.length - 1];
                }
            }

            // Asignar el valor al campo
            if (elemento) {
                console.log('Asignando valor al elemento:', elemento);
                elemento.value = codigo;
                
                // Limpiar mensajes de error al asignar correctamente
                const enPestanaCodigos = document.querySelector('#contenido-codigo.tab-pane.active') !== null;
                if (enPestanaCodigos) {
                    limpiarMensajeParrafo('mensajeCodigoAdvertencia');
                } else {
                    limpiarMensajeParrafo('mensajeCodigoAdvertenciaProducto');
                }
                
                // Disparar eventos para notificar el cambio
                const inputEvent = new Event('input', { bubbles: true });
                const changeEvent = new Event('change', { bubbles: true });
                elemento.dispatchEvent(inputEvent);
                elemento.dispatchEvent(changeEvent);
                
                // Enfocar y seleccionar el texto
                elemento.focus();
                elemento.select();
                
                console.log('Valor asignado correctamente');
            } else {
                console.error('No se pudo encontrar un elemento de destino válido');
            }
        } catch (error) {
            console.error('Error en procesarCodigo:', error);
        }
    }
}


// Inicializar el lector cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configurarLectorCodigoBarras);
} else {
    configurarLectorCodigoBarras();
}

// Función para agregar un nuevo campo de código de barras
function agregarCampoCodigoBarras() {
    const container = document.getElementById('codigosBarrasContainer');
    const nuevoGrupo = document.createElement('div');
    nuevoGrupo.className = 'input-group mb-2';

    // Crear el input con los mismos atributos que el original
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.placeholder = 'Escanee el código de barras';
    input.autocomplete = 'off';
    input.autocorrect = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;

    // Agregar manejadores de eventos para bloquear entrada manual
    input.onkeydown = input.onpaste = input.oncut = input.oncontextmenu = input.ondrop = function (e) {
        e.preventDefault();
        return false;
    };

    // Botón para eliminar el campo
    const divBoton = document.createElement('div');
    divBoton.className = 'input-group-append';

    const boton = document.createElement('button');
    boton.className = 'btn btn-outline-danger';
    boton.type = 'button';
    boton.textContent = '-';
    boton.onclick = function () {
        this.closest('.input-group').remove();
    };

    // Construir la estructura
    divBoton.appendChild(boton);
    nuevoGrupo.appendChild(input);
    nuevoGrupo.appendChild(divBoton);
    container.appendChild(nuevoGrupo);

    // Enfocar el nuevo campo automáticamente
    input.focus();
}

// Función para eliminar un campo de código de barras
function eliminarCampoCodigoBarras(boton) {
    const container = document.getElementById('codigosBarrasContainer');
    const grupos = container.getElementsByClassName('input-group');

    // No permitir eliminar si solo queda un campo
    if (grupos.length <= 1) {
        mostrarMensaje('error', 'Debe haber al menos un código de barras.');
        return;
    }

    boton.closest('.input-group').remove();
}


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
            mostrarMensajeParrafo('El codigo ya esta asignado a otro producto', 'red', 'mensajeCodigoAdvertencia');
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
    document.getElementById('productoForm').reset();
    document.getElementById('productoId').value = '';

    // Mostrar la sección de códigos de barras al limpiar el formulario
    const codigosBarrasContainer = document.querySelector('.codigosBarrasContainerProduct');
    if (codigosBarrasContainer) {
        codigosBarrasContainer.style.display = 'block';
    }

    // Limpiar contenedor de códigos de barras y agregar un campo vacío
    const container = document.getElementById('codigosBarrasContainer');
    container.innerHTML = `
        <div class="input-group mb-2">
            <input type="text" class="form-control codigo-barras" placeholder="Escanee el código de barras">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" onclick="agregarCampoCodigoBarras()">+</button>
            </div>
        </div>
    `;

    // Desactivar la pestaña de códigos al agregar un nuevo producto
    const tabCodigoLink = document.querySelector('a[href="#contenido-codigo"]');
    if (tabCodigoLink) {
        tabCodigoLink.style.pointerEvents = 'none';
        tabCodigoLink.style.opacity = '0';
        tabCodigoLink.classList.add('disabled');
    }

    document.getElementById('categoriaForm').reset();
}
