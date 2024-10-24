document.addEventListener('DOMContentLoaded', function () {
    const facturasContainer = document.getElementById('facturasContainer');
    
    // Función para traer las facturas desde el backend
    function obtenerFacturas() {
        fetch('http://localhost:8082/api/facturas')
            .then(response => response.json())
            .then(facturas => {
                if (facturas.length > 0) {
                    // Crear el HTML de la tabla
                    facturas.sort((a, b) => b.serial - a.serial);
                    const tablaFacturas = `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Factura ID</th>
                                    <th>Cliente</th>
                                    <th>Cédula o NIT</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${facturas.map(factura => `
                                    <tr>
                                        <td>${factura.serial}</td>
                                        <td>${factura.cliente ? factura.cliente.nombre : 'Cliente no disponible'}</td>
                                        <td>${factura.cliente ? factura.cliente.identificacion : 'N/A'}</td>
                                        <td>${new Date(factura.fechaEmision).toLocaleDateString()}</td>
                                        <td>${factura.total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                                        <td>
                                            <button class="btn btn-info btn-ver-detalles" data-id="${factura.id}">
                                                Ver detalles
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
                    // Insertar la tabla en el contenedor
                    facturasContainer.innerHTML = tablaFacturas;

                    // Agregar evento click a los botones de ver detalles
                    document.querySelectorAll('.btn-ver-detalles').forEach(button => {
                        button.addEventListener('click', function() {
                            const facturaId = this.getAttribute('data-id');
                            mostrarDetallesFactura(facturaId);
                        });
                    });
                } else {
                    facturasContainer.innerHTML = '<p>No hay facturas disponibles.</p>';
                }
            })
            .catch(error => {
                console.error('Error al obtener las facturas:', error);
                facturasContainer.innerHTML = '<p>Error al cargar las facturas.</p>';
            });
    }

    // Función para mostrar los detalles de la factura
    function mostrarDetallesFactura(facturaId) {
        fetch(`http://localhost:8082/api/facturas/${facturaId}/detalles`)
            .then(response => response.json())
            .then(detalles => {
                // Limpiar el cuerpo de la tabla de detalles
                const detallesBody = document.getElementById('detallesFacturaBody');
                detallesBody.innerHTML = '';

                // Agregar los detalles al cuerpo de la tabla
                detalles.forEach(detalle => {
                    const fila = `
                        <tr>
                            <td>${detalle.nombreProducto}</td>
                            <td>${detalle.descripcion}</td>
                            <td>${detalle.cantidad}</td>
                            <td>${detalle.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                            <td>${detalle.garantia}</td>
                            <td>${(detalle.cantidad * detalle.precioUnitario).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                        </tr>
                    `;
                    detallesBody.innerHTML += fila;
                });

                // Abrir el modal
                $('#detalleFacturaModal').modal('show');
            })
            .catch(error => {
                console.error('Error al obtener los detalles de la factura:', error);
                alert('Error al cargar los detalles de la factura.');
            });
    }

    // Llamar a la función para obtener las facturas al cargar la página
    obtenerFacturas();
});
