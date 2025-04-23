const apiUrl = 'http://localhost:8082/pedido'
const categoriaUrl = 'http://localhost:8082/categoria'

document.addEventListener('DOMContentLoaded', function () {
    const pedidoForm = document.getElementById('pedidoForm');
    const pedidoTableBody = document.getElementById('pedidoTableBody');
    const nombreInput = document.getElementById('nombrePedido');
    const precioCompradoInput = document.getElementById('precioCompradoPedido');
    const precioVendidoInput = document.getElementById('precioVendidoPedido');
    const cantidadInput = document.getElementById('cantidadPedido');
    const categoriaInput = document.getElementById('categoriaPedido');
    const limpiarButton = document.querySelector('button[type="button"]');

    // Asignar evento de limpiar al botón
    limpiarButton.addEventListener('click', limpiarFormulario);

    // Cargar pedidos pendientes al cargar la página
    cargarPedidos()
    cargarTotalGlobal()
    // Función para cargar pedidos
    function cargarPedidos() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(pedidos => {
                pedidoTableBody.innerHTML = '';
                pedidos.content.forEach(pedido => {
                    const row = `
                        <tr>
                            <td>${pedido.nombre.toUpperCase()}</td>
                            <td>${formatNumber(pedido.precioComprado)}</td>
                            <td>${formatNumber(pedido.precioVendido)}</td>
                            <td>${pedido.cantidad}</td>
                            <td>${pedido.categoria.nombre}</td>
                            <td>${formatNumber(pedido.precioComprado * pedido.cantidad)}</td>
                             <td>
                                <div style="display: flex; gap: 5px;">
                                    <button class="btn btn-danger btn-sm eliminarPedidoBtn" data-id="${pedido.id}" onclick="eliminarPedido(event)">Eliminar</button>
                                    <button class="btn btn-success btn-sm recibirPedidoBtn" data-id="${pedido.id}">Recibido</button>
                                </div>
                            </td>
                        </tr>
                    `;
                    pedidoTableBody.insertAdjacentHTML('beforeend', row);
                });

                // Agregar eventos a botones de "Eliminar" y "Recibir"
                document.querySelectorAll('.eliminarPedidoBtn').forEach(btn => {
                    btn.addEventListener('click', eliminarPedido);
                });

                document.querySelectorAll('.recibirPedidoBtn').forEach(btn => {
                    btn.addEventListener('click', recibirPedido);
                });
            });
    }
    let pedidoIdToDelete = null;

    function eliminarPedido(event) {
        // Obtener el ID del pedido desde el botón
        pedidoIdToDelete = event.target.dataset.id; // Almacenar el ID en una variable global
        $('#confirmModal-eliminar-pedido').modal('show'); // Mostrar el modal
    }

    // Evento de clic para el botón de confirmación
    $('#confirmBtn-eliminar-pedido').on('click', function () {
        // Cerrar el modal
        $('#confirmModal-eliminar-pedido').modal('hide');

        // Realizar la solicitud DELETE usando el ID almacenado
        fetch(`${apiUrl}/${pedidoIdToDelete}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    cargarPedidos(); // Refrescar lista de pedidos
                    cargarTotalGlobal(); // Actualizar el total global
                    cargarCategorias(); // Cargar categorías, si es necesario
                    mostrarMensaje('success', 'Pedido eliminado.');
                } else {
                    mostrarMensaje('error', 'Error al eliminar el pedido.');
                }
            })
            .catch(error => console.error('Error al eliminar el pedido:', error));
    });

    // Función para recibir un pedido (mover a inventario y eliminar el pedido)
    function recibirPedido(event) {
        const id = event.target.dataset.id;

        fetch(`${apiUrl}/${id}/recibir`, { method: 'PUT' })
            .then(response => response.json())
            .then(() => {
                mostrarMensaje('success', 'Producto recibido y movido a inventario.');
                cargarPedidos(); // Refrescar la lista de pedidos
                cargarTotalGlobal()
            });
    }

    // Función para limpiar el formulario
    function limpiarFormulario() {
        pedidoForm.reset();  // Reinicia el formulario
        document.getElementById('pedidoId').value = '';  // Limpia el campo oculto del ID
    }

    // Función para agregar o actualizar un pedido
    pedidoForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const pedidoData = {
            nombre: nombreInput.value,
            precioComprado: parseFloat(precioCompradoInput.value.replace(/[,.]/g, '')),
            precioVendido: parseFloat(precioVendidoInput.value.replace(/[,.]/g, '')),
            cantidad: parseInt(cantidadInput.value),
            categoria: { id: parseInt(categoriaInput.value) }
        };

        const idPedido = document.getElementById('pedidoId').value;
        const url = idPedido ? `${apiUrl}/${idPedido}` : apiUrl;
        const method = idPedido ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoData)
        })
            .then(response => response.json())
            .then(() => {
                limpiarFormulario();
                cargarPedidos(); // Refrescar lista de pedidos
                cargarTotalGlobal();
                mostrarMensaje('success', 'pedido agregado');
                $('#pedidoModal').modal('hide'); // Ocultar el modal al guardar o actualizar

            }).catch(error => {
                console.error('Error:', error);
                mostrarMensaje('error', 'Error al guardar el pedido.'); // Mensaje de error
            });
    });

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

    // Cargar categorías disponibles al cargar la página
    function cargarCategorias() {
        fetch(categoriaUrl)
            .then(response => response.json())
            .then(categorias => {
                categoriaInput.innerHTML = '<option value="">Selecciona una categoría</option>';
                categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.id; // Asegúrate de que 'id' sea el identificador de la categoría
                    option.textContent = categoria.nombre; // Asegúrate de que 'nombre' sea el campo que deseas mostrar
                    categoriaInput.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar las categorías:', error);
            });
    }

    cargarCategorias();
});





