
const facturaData = {
    cliente: {
        nombre: nombreCliente, // Asegúrate de que este campo no esté vacío
        identificacion: cedulaNit // Asegúrate de que este campo no esté vacío
    },
    fechaEmision: new Date().toISOString().split('T')[0], // Obtener la fecha actual en formato YYYY-MM-DD
    metodoPago: 'Efectivo', // Cambia esto si tienes otro método de pago
    total: totalFactura,
    detalles: productos.map(producto => ({
        producto: 39, // Asegúrate de que aquí estás pasando el id del producto
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario,
        descripcion: producto.descripcion,
        garantia: producto.garantia
    }))
};

function guardarFactura() {
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const cedulaNit = document.getElementById('cedulaNit').value.trim();
    const productos = obtenerProductosSeleccionados();

    if (nombreCliente && cedulaNit && productos.length > 0) {
        // Aquí deberías asegurarte de que estás seleccionando un cliente existente
        // Verificar si el cliente ya existe (por el campo de autocompletar que implementaste)
        const clienteExiste = verificarClienteExistente(cedulaNit); // Supongo que ya tienes esta función

        if (!clienteExiste) {
            alert('El cliente no existe en la base de datos. Por favor, selecciona un cliente válido.');
            return;
        }

        // Calcular el total de la factura
        let totalFactura = 0;
        const productosHTML = productos.map(producto => {
            totalFactura += producto.total;
            return `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>${producto.cantidad}</td>
                    <td>${producto.precioUnitario.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                    <td>${producto.garantia}</td>
                    <td>${producto.descripcion}</td>
                    <td>${producto.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        }).join('');

        const fechaActual = new Date().toLocaleDateString('es-CO');

        // Crear la factura en el frontend
        const facturaHTML = `
            <h1 style="text-align: center;">Factura de Venta</h1>
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="pc.png" alt="" style="width: 100px; height: auto;">
                <h2>Compu Services Soft</h2>
                <p>Servicio técnico de computadores y celulares,<br> venta de computadores y periféricos</p>
            </div>
            <div>
                <p><strong>Cliente:</strong> ${nombreCliente}</p>
                <p><strong>Cédula o NIT:</strong> ${cedulaNit}</p>
                <p><strong>Fecha de Creación:</strong> ${fechaActual}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ddd; padding: 8px;">Nombre</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Precio Unitario</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Garantía (meses)</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Descripción</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                    <tr style="background-color: #f2f2f2;">
                        <td colspan="5" style="text-align: right; padding: 8px;"><strong>Total Factura:</strong></td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${totalFactura.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </table>
        `;

        // Abrir ventana de impresión
        const ventanaImpresion = window.open('', '', 'height=600,width=800');
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Factura</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; }
                        th { background-color: #f2f2f2; }
                        h1, h2, h3 { text-align: center; }
                    </style>
                </head>
                <body>
                    ${facturaHTML}
                </body>
            </html>
        `);
        ventanaImpresion.document.close();

        ventanaImpresion.onload = function() {
            ventanaImpresion.focus();
            ventanaImpresion.print();
            ventanaImpresion.close();
        };

        // Definir los datos de la factura a enviar al backend
        const facturaData = {
            cliente: {
                identificacion: cedulaNit // Usar la identificación del cliente existente
            },
            fechaEmision: new Date().toISOString().split('T')[0],
            metodoPago: 'Efectivo',
            total: totalFactura,
            detalles: productos.map(producto => ({
                producto: { id: producto.id },
                cantidad: producto.cantidad,
                precioUnitario: producto.precioUnitario,
                descripcion: producto.descripcion,
                garantia: producto.garantia
            }))
        };
        
        // Enviar los datos al backend
        fetch('http://localhost:8082/factura/guardar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(facturaData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar la factura en la base de datos');
            }
            return response.json();
        })
        .then(data => {
            alert('Factura guardada correctamente en la base de datos.');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al guardar la factura en la base de datos.');
        });

        limpiarFormulario(); 
    } else {
        alert('Por favor, complete todos los campos obligatorios y seleccione al menos un producto.');
    }
}