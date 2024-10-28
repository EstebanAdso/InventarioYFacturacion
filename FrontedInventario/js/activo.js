document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:8082/activos';
    const activoForm = document.getElementById('activoForm');
    const activoTableBody = document.getElementById('activoTableBody');
    const nombreInput = document.getElementById('nombreactivo');
    const precioCompradoInput = document.getElementById('precioCompradoactivo');
    const cantidadInput = document.getElementById('cantidadactivo');
    const limpiarButton = document.querySelector('button[type="button"]');

    limpiarButton.addEventListener('click', limpiarFormulario);

    cargaractivos();
    cargarTotalGlobal();

    let botonModificador = document.getElementById('agregarActivo');

    botonModificador.addEventListener('click', function() {
        modificarTexto.textContent = 'Agregar Activo';
    });

    function cargaractivos() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(activos => {
                activoTableBody.innerHTML = '';

                const activosArray = Array.isArray(activos) ? activos : activos.content;

                if (Array.isArray(activosArray)) {
                    activosArray.forEach(activo => {
                        const row = `
                            <tr>
                                <td>${activo.nombre.toUpperCase()}</td>
                                <td>${formatNumber(activo.precio)}</td>
                                <td>${activo.cantidad}</td>
                                <td>${formatNumber(activo.precio * activo.cantidad)}</td>
                                <td>
                                    <div style="display: flex; gap: 5px;">
                                        <button class="btn btn-dark btn-sm eliminaractivoBtn" data-id="${activo.id}">Eliminar</button>
                                        <button class="btn btn-success btn-sm editaractivoBtn" data-id="${activo.id}">Editar</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                        activoTableBody.insertAdjacentHTML('beforeend', row);
                    });

                    document.querySelectorAll('.eliminaractivoBtn').forEach(btn => {
                        btn.addEventListener('click', eliminaractivo);
                    });

                    document.querySelectorAll('.editaractivoBtn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const id = btn.getAttribute('data-id');
                            editaractivo(id);
                        });
                    });

                } else {
                    console.error("Error: La respuesta no contiene una lista de activos.");
                }
            })
            .catch(error => console.error("Error en la solicitud fetch:", error));
    }

    function eliminaractivo(event) {
        const id = event.target.dataset.id;
        if (confirm("¿Estás seguro de que quieres eliminar este activo?")) {
            fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    cargaractivos();
                    cargarTotalGlobal();
                } else {
                    alert('Error al eliminar el activo.');
                }
            })
            .catch(error => console.error('Error al eliminar el activo:', error));
        }
    }

    function limpiarFormulario() {
        activoForm.reset();
        document.getElementById('activoId').value = '';
    }

    activoForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const activoData = {
            nombre: nombreInput.value,
            precio: parseFloat(precioCompradoInput.value.replace(/[,.]/g, '')),
            cantidad: parseInt(cantidadInput.value)
        };

        const idactivo = document.getElementById('activoId').value;
        const url = idactivo ? `${apiUrl}/${idactivo}` : apiUrl;
        const method = idactivo ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activoData)
        })
        .then(response => response.json())
        .then(() => {
            limpiarFormulario();
            cargaractivos();
            cargarTotalGlobal();
            $('#activoModal').modal('hide');
        });
    });

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

    async function editaractivo(id) {
        try {
            const response = await fetch(`${apiUrl}/${id}`);
            if (!response.ok) {
                throw new Error('Error al cargar el activo para editar.');
            }

            modificarTexto = document.getElementById('activoModalLabel');
            modificarTexto.textContent = 'Editar activo';

            const activo = await response.json();
            document.getElementById('activoId').value = activo.id;
            nombreInput.value = activo.nombre;
            precioCompradoInput.value = activo.precio; // Usar precio directo
            cantidadInput.value = activo.cantidad;

            $('#activoModal').modal('show');
        } catch (error) {
            console.error('Error:', error);
        }
    }
});
