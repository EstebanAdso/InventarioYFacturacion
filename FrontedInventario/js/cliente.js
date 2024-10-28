document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:8082/cliente';
    const clienteForm = document.getElementById('clienteForm');
    const clienteTableBody = document.getElementById('clienteTableBody');
    const nombreCliente = document.getElementById('nombrecliente');
    const identificacionCliente = document.getElementById('identificacionCliente');
    const telefonoCliente = document.getElementById('telefonoCliente');
    const direccionCliente = document.getElementById('direccionCliente');
    const correoCliente = document.getElementById('correoCliente');
    let modificarTexto = document.getElementById('clienteModalLabel')
   

    cargarclientes();

    
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
    }

    clienteForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const clienteData = {
            nombre: nombreCliente.value,
            identificacion : identificacionCliente.value,
            telefono : telefonoCliente.value,
            direccion : direccionCliente.value,
            correo : correoCliente.value
        };

        const idcliente = document.getElementById('clienteId').value;
        const url = idcliente ? `${apiUrl}/${idcliente}` : apiUrl;
        const method = idcliente ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        })
        .then(response => response.json())
        .then(() => {
            limpiarFormulario();
            cargarclientes();
            $('#clienteModal').modal('hide');
        });
    });

    
    async function editarcliente(id) {
        try {
            const response = await fetch(`${apiUrl}/${id}`);
            if (!response.ok) {
                throw new Error('Error al cargar el cliente para editar.');
            }
            modificarTexto = document.getElementById('clienteModalLabel');
            modificarTexto.textContent = 'Editar cliente';

            const cliente = await response.json();
            document.getElementById('clienteId').value = cliente.id;
            nombreCliente.value = cliente.nombre;
            identificacionCliente.value = cliente.identificacion; // Usar precio directo
            telefonoCliente.value = cliente.telefono;
            correoCliente.value = cliente.correo;
            direccionCliente.value = cliente.direccion;

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
            throw new Error('Error al obtener los clientes top');
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
        alert('Error al obtener los clientes top');
    }
});

function formatNumber(number) {
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}


});
