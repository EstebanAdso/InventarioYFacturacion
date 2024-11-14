document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:8082/cliente';
    const clienteForm = document.getElementById('clienteForm');
    const clienteTableBody = document.getElementById('clienteTableBody');
    const nombreCliente = document.getElementById('nombrecliente');
    const identificacionCliente = document.getElementById('identificacionCliente');
    const telefonoCliente = document.getElementById('telefonoCliente');
    const direccionCliente = document.getElementById('direccionCliente');
    const correoCliente = document.getElementById('correoCliente');
    const buscador = document.getElementById('searchInput')
    let modificarTexto = document.getElementById('clienteModalLabel')
   

    cargarclientes();

    buscador.addEventListener('input', async () => {
        const nombre = document.getElementById('searchInput').value;
        currentPage = 0;
        if (nombre === '') {
            cargarclientes();
        } else {
            buscarProductosPorNombre(nombre)
        }
    });

    async function buscarProductosPorNombre(nombre) {
        try {
            const response = await fetch(`${apiUrl}/buscar/${nombre}`);
            if (!response.ok) {
                mostrarMensaje('error', 'Error al buscar productos por nombre.');
                return;
            }
            const clientes = await response.json();
            clienteTableBody.innerHTML = '';
            clientes.forEach(cliente => {
                const row = `
                    <tr>
                        <td>${cliente.id}</td>
                        <td>${cliente.nombre.toUpperCase()}</td>
                        <td>${cliente.identificacion}</td>
                        <td>${cliente.telefono || ""}</td>
                        <td>${cliente.direccion || ""}</td>
                        <td>${cliente.correo || ""}</td>
                        <td>
                            <div">
                                <button class="btn btn-success btn-sm editarclienteBtn" data-id="${cliente.id}">Editar</button>
                            </div>
                        </td>
                    </tr>
                `;
                clienteTableBody.insertAdjacentHTML('beforeend', row);
            });
    
            // Asigna eventos a los botones de edición
            document.querySelectorAll('.editarclienteBtn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = btn.getAttribute('data-id');
                    editarcliente(id);
                });
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    
    function cargarclientes() {

        let botonModificador = document.getElementById('agregarcliente');

        botonModificador.addEventListener('click', function() {
            modificarTexto.textContent = 'Agregar Cliente';
            limpiarFormulario()
        });
        fetch(apiUrl)
            .then(response => response.json())
            .then(clientes => {
                clienteTableBody.innerHTML = '';

                const clientesArray = Array.isArray(clientes) ? clientes : clientes.content;

                if (Array.isArray(clientesArray)) {
                    clientesArray.sort((a, b) => b.id - a.id);
                    clientesArray.forEach(cliente => {
                        const row = `
                            <tr>
                                <td>${cliente.id}</td>
                                <td>${cliente.nombre.toUpperCase()}</td>
                                <td>${cliente.identificacion}</td>
                                <td>${cliente.telefono || ""}</td>
                                <td>${cliente.direccion || ""}</td>
                                <td>${cliente.correo || ""}</td>
                                
                                <td>
                                    <div">
                                        <button class="btn btn-success btn-sm editarclienteBtn" data-id="${cliente.id}">Editar</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                        clienteTableBody.insertAdjacentHTML('beforeend', row);
                    });

                   
                    document.querySelectorAll('.editarclienteBtn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const id = btn.getAttribute('data-id');
                            editarcliente(id);
                        });
                    });

                } else {
                    console.error("Error: La respuesta no contiene una lista de clientes.");
                }
            })
            .catch(error => console.error("Error en la solicitud fetch:", error));
    }


    function limpiarFormulario() {
        clienteForm.reset()
        document.getElementById('clienteId').value = ''; // Limpia el campo de clienteId
    }

    clienteForm.addEventListener('submit', function (event) {
        event.preventDefault();
    
        const clienteData = {
            nombre: nombreCliente.value.trim() === '' ? null : nombreCliente.value,
            identificacion: identificacionCliente.value.trim() === '' ? null : identificacionCliente.value,
            telefono: telefonoCliente.value.trim() === '' ? null : telefonoCliente.value,
            direccion: direccionCliente.value.trim() === '' ? null : direccionCliente.value,
            correo: correoCliente.value.trim() === '' ? null : correoCliente.value
        };
    
        const idcliente = document.getElementById('clienteId').value;
        const url = idcliente ? `${apiUrl}/${idcliente}` : apiUrl;
        const method = idcliente ? 'PUT' : 'POST';
    
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || "Error al procesar la solicitud.");
                });
            }
            return response.json();
        })
        .then(() => {
            limpiarFormulario();
            cargarclientes();
            mostrarMensaje('success', 'Cliente agregado / editado con éxito.');
            $('#clienteModal').modal('hide');
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
            if (error.message.includes('Duplicate entry')) {
                mostrarMensaje('error', 'Error: La identificación del cliente ya existe.');
            } else {
                mostrarMensaje('error', 'Ocurrió un error al guardar el cliente es posible que algun campo este duplicado.');
            }
        });
    });
    
    
    async function editarcliente(id) {
        try {
            const response = await fetch(`${apiUrl}/${id}`);
            if (!response.ok) {
                mostrarMensaje('error', 'Error al cargar el cliente para editar.');
                return;
            }
    
            modificarTexto = document.getElementById('clienteModalLabel');
            modificarTexto.textContent = 'Editar cliente';
    
            const cliente = await response.json();
            document.getElementById('clienteId').value = cliente.id;
            nombreCliente.value = cliente.nombre || '';
            identificacionCliente.value = cliente.identificacion || '';
            telefonoCliente.value = cliente.telefono ?? null; // Si está vacío, se asigna null
            correoCliente.value = cliente.correo ?? null; // Si está vacío, se asigna null
            direccionCliente.value = cliente.direccion ?? null; // Si está vacío, se asigna null
    
            $('#clienteModal').modal('show');
        } catch (error) {
            console.error('Error:', error);
        }
    }
    


  // cliente.js

// Escuchar el evento de clic en el botón "Revisar Clientes Top"
document.getElementById('revisarClientesTop').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:8082/cliente/top'); // Cambia el puerto si es necesario
        if (!response.ok) {
            mostrarMensaje('error', 'Error al obtener clientes top.');
        }
        const clientesTop = await response.json();
        
        // Llenar la tabla en el modal
        const clientesTopTableBody = document.getElementById('clientesTopTableBody');
        clientesTopTableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla
        
        clientesTop.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.clienteId}</td>
                <td>${cliente.clienteNombre}</td>
                <td>${formatNumber(cliente.totalCompras)}</td>
            `;
            clientesTopTableBody.appendChild(row);
        });

        // Mostrar el modal
        $('#clientesTopModal').modal('show');
    } catch (error) {
        console.error(error);
        mostrarMensaje('error', 'Error al obtener clientes top.');
    }
});

function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

});


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
