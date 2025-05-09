function generarFacturaHTMLPDF({ nombreCliente, cedulaNit, telefonoCliente, correoCliente, direccionCliente, productosHTML, totalFactura, fechaActual }) {
    return `
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="../css/pc.png" alt="" style="width: 100px; height: auto;">
                    <h2>CompuServices Soft</h2>
                    <p>Servicio técnico de computadores y celulares,<br> venta de computadores y periféricos</p>
                    <div> 
                        <p style="margin: 0 0 4px 0;"><b>NIT:</b> 1193030552-4</p>
                        <p style="margin: 0 0 4px 0;"><b>Celular:</b> 3242264795</p>
                        <p style="margin: 0;"><b>Ubicación:</b> Pasto, Centro comercial la 16, local 138</p>
                    </div>
                </div>


                    <p><strong>Cliente:</strong> ${nombreCliente}</p>
                    <p><strong>Cédula o NIT:</strong> ${cedulaNit}</p>
                    ${telefonoCliente ? `<p><strong>Teléfono:</strong> ${telefonoCliente}</p>` : ''}
                    ${correoCliente ? `<p><strong>Correo:</strong> ${correoCliente}</p>` : ''}
                    ${direccionCliente ? `<p><strong>Dirección:</strong> ${direccionCliente}</p>` : ''}
                    <p><strong>Fecha de Creación:</strong> ${fechaActual}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Nombre</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Precio Unitario</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Garantía</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Descripción</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosHTML}
                        <tr style="background-color: #f2f2f2;">
                            <td colspan="5" style="text-align: right; padding: 8px;"><strong>Total Factura:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${totalFactura.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                        </tr>
                    </tbody>
                </table>

                <p style="margin-top: 20px; font-size: 14px; color: #555;">
                    <b>Nota:</b> La garantía cubre únicamente defectos de fabricación y no aplica en caso de insatisfacción personal, errores en la selección del producto, o daños causados por un mal uso. Para validar la garantía, es indispensable conservar todos los accesorios, empaques originales y documentación proporcionada en el momento de la compra.
                </p>
            `;
}

function generarFacturaHTMLPOS({ nombreCliente, cedulaNit, telefonoCliente, correoCliente, direccionCliente, productosHTML, totalFactura, fechaActual }) {
    return `
                    <div style="width: 68mm; font-size: 12px; font-family: Arial, Helvetica, sans-serif; color: #000">
                        <div style="text-align: center;">
                            <img src="../css/pc.png" alt="" style="width: 80px; height: auto; margin-top: 0">
                        </div>
                        <h2 style="text-align: center; margin-bottom: 5px">CompuServices Soft</h2>
                        <p style="text-align: center; margin: 0">
                            <div style="font-size: 11px; text-align: center">
                            <b>Servicio técnico de computadores y celulares,
                            Venta de computadores y periféricos</b><br></div>
                            <div style="text-align : left; font-size: 12px; margin-top: 10px">
                            <b>NIT:</b> 1193030552-4<br>
                            <b>Celular:</b> 3242264795<br>
                            <b>Ubicación:</b> Pasto, Centro comercial la 16, local 138
                            <br>NO RESPONSABLES DE IVA
                            </div>
                        </p>
                        <p style="margin-bottom: 0px"><strong>Fecha:</strong> ${fechaActual}</p>
                        <p style="margin-bottom: 0px"><strong>Cliente:</strong> ${nombreCliente}</p>
                        <p style="margin-bottom: 0px"><strong>Cédula/NIT:</strong> ${cedulaNit}</p>
                        ${telefonoCliente ? `<p style="margin-bottom: 0px"><strong>Teléfono:</strong> ${telefonoCliente}</p>` : ''}
                        ${correoCliente ? `<p style="margin-bottom: 0px"><strong>Correo:</strong> ${correoCliente}</p>` : ''}
                        ${direccionCliente ? `<p style="margin-bottom: 0px"><strong>Dirección:</strong> ${direccionCliente}</p>` : ''}
                        <hr style="border: 1px solid #000;">
                        <table style="width: 100%; margin-top: 2px; font-size: 12px">
                            <thead>
                                <tr>
                                    <th style="padding: 2px 0; text-align: left; max-width: 20mm; word-wrap: break-word;">Producto</th>
                                    <th style="text-align: center; max-width: 10mm;">Ct.</th>
                                    <th style="text-align: center; max-width: 15mm;">Pre.</th>
                                    <th style="text-align: center; max-width: 15mm;">Garant.</th>
                                    <th style="text-align: center;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productosHTML}
                                <tr style="font-weight: bold;">
                                    <td colspan="4" style="text-align: right; padding-top: 4px;">Total:</td>
                                    <td style="text-align: center; padding-top: 4px;">${totalFactura.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</td>
                                </tr>
                            </tbody>
                        </table>
                        <hr style="border: 1px solid #000;">
                        <p style="margin-top: 5px; font-size: 12px; text-align: center;"><b>****** Gracias por su Compra ******</b></p>
                        <p style="margin-top: 1px; font-size: 12px; text-align: justify;">
                            <b>Nota:</b> La garantía cubre únicamente defectos de fabricación y no aplica en caso de insatisfacción personal, errores en la selección del producto, o daños causados por un mal uso. Para validar la garantía, es indispensable conservar todos los accesorios, empaques originales y documentación proporcionada en el momento de la compra, como también no dañar los sellos de garantía este proceso puede demorar hasta 15 dias habiles.
                        </p>
                        <p style="margin-top: 0px; font-size: 12px; text-align: justify;">&copy;Sistema de facturación POST y PDF, gestión de clientes inventario y pedidos, realizado por estebanadso@gmail.com / 3242264795</p>
                    </div>
            `;
}

function generarHTMLParaCodigos(cantidad, codigo) {
    const codigosHtml = Array.from({ length: cantidad }, (_, i) => `
        <div class="etiqueta">
            <svg class="barcode" id="barcode-${i}"></svg>
            <p>${codigo}</p>
        </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Imprimir Códigos de Barras</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <style>
            @page {
                size: 90mm 29mm; /* horizontal */
                margin: 0;
            }

            body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
            }

            .etiqueta {
                width: 80mm;
                height: 29mm;
                display: flex;
                flex-direction: column;
                justify-content: center; /* Centra verticalmente el contenido */
                align-items: center;
                margin: auto;
                page-break-after: always;
                box-sizing: border-box;
                position: relative;
            }

            svg.barcode {
                width: auto;
                height: auto;
                max-width: 80mm;
                max-height: 18mm;
                margin-top: -3mm; /* Sube un poco el código de barras para centrarlo mejor */
            }

            p {
                margin: 0;
                font-size: 12pt;
                text-align: center;
                position: absolute;
                top: 23mm; /* Posiciona el texto más abajo */
                width: 100%;
            }
        </style>
    </head>
    <body>
        ${codigosHtml}
        <script>
            const cantidad = ${cantidad};
            const codigo = "${codigo}";

            for (let i = 0; i < cantidad; i++) {
                JsBarcode("#barcode-" + i, codigo, {
                    format: "CODE128",
                    lineColor: "#000",
                    width: 2,
                    height: 85,
                    displayValue: false,
                    margin: 0
                });
            }
        </script>
    </body>
    </html>
    `;
}


