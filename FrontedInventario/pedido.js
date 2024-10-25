const apiUrl = 'http://localhost:8082/pedido'

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
        fetch('http://localhost:8082/pedido')
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
                                    <button class="btn btn-danger btn-sm eliminarPedidoBtn" data-id="${pedido.id}">Eliminar</button>
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

    // Función para eliminar un pedido
    function eliminarPedido(event) {
        const id = event.target.dataset.id; // Obtener el ID del pedido desde el botón
        if (confirm("¿Estás seguro de que quieres eliminar este pedido?")) {
            fetch(`http://localhost:8082/pedido/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    alert('Pedido eliminado correctamente.');
                    cargarPedidos(); // Refrescar lista de pedidos
                    cargarTotalGlobal()
                    cargarCategorias()
                } else {
                    alert('Error al eliminar el pedido.');
                }
            })
            .catch(error => console.error('Error al eliminar el pedido:', error));
        }
    }

    // Función para recibir un pedido (mover a inventario y eliminar el pedido)
    function recibirPedido(event) {
        const id = event.target.dataset.id;

        fetch(`http://localhost:8082/pedido/${id}/recibir`, { method: 'PUT' })
            .then(response => response.json())
            .then(() => {
                alert('Producto recibido y movido a inventario.');
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
        const url = idPedido ? `http://localhost:8082/pedido/${idPedido}` : 'http://localhost:8082/pedido';
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
            $('#pedidoModal').modal('hide'); // Ocultar el modal al guardar o actualizar
        });
    });

    // Función para formatear los números como moneda colombiana
    function formatNumber(number) {
        return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
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

    // Cargar categorías disponibles al cargar la página
    function cargarCategorias() {
        fetch('http://localhost:8082/categoria')
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
