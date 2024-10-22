package com.example.backendinventario.controller;

import com.example.backendinventario.entities.*;
import com.example.backendinventario.services.ClienteServices;
import com.example.backendinventario.services.FacturaService;
import com.example.backendinventario.services.ProductoServices;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    @Autowired
    private ClienteServices clienteService;

    @Autowired
    private ProductoServices productoServices;

    @Transactional
    @PostMapping("/crear")
    public ResponseEntity<?> crearFactura(@RequestBody FacturaDTO facturaDTO) {
        // Buscar si el cliente ya existe en la base de datos por la cédula
        Optional<Cliente> clienteExistente = clienteService.findByIdentificacion(facturaDTO.getClienteCedula());

        Cliente cliente;
        if (clienteExistente.isPresent()) {
            cliente = clienteExistente.get();
            if (!cliente.getNombre().equals(facturaDTO.getClienteNombre())) {
                cliente.setNombre(facturaDTO.getClienteNombre());
                clienteService.save(cliente);  // Guardar el cliente actualizado
            }
        } else {
            cliente = new Cliente();
            cliente.setNombre(facturaDTO.getClienteNombre());
            cliente.setIdentificacion(facturaDTO.getClienteCedula());
            clienteService.save(cliente);  // Guardar el nuevo cliente
        }

        List<DetalleFactura> detalles = new ArrayList<>();

        // Verificar inventario y crear detalles de factura
        for (DetalleDTO det : facturaDTO.getDetalles()) {
            try {
                Producto productoActualizado = productoServices.actualizarInventario(det.getProductoId(), det.getCantidad());

                // Crear detalle de factura
                DetalleFactura detalleFactura = new DetalleFactura();
                detalleFactura.setProducto(productoActualizado);
                detalleFactura.setCantidad(det.getCantidad());
                detalleFactura.setDescripcion(det.getDescripcion());
                detalleFactura.setPrecioUnitario(det.getPrecioUnitario());
                detalleFactura.setGarantia(det.getGarantia());
                detalleFactura.setNombreProducto(productoActualizado.getNombre());

                detalles.add(detalleFactura);

            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(e.getMessage());
            }
        }

        // Crear la factura con el cliente
        Factura factura = new Factura();
        factura.setCliente(cliente);
        factura.setFechaEmision(new Date());
        factura.setClienteNombre(facturaDTO.getClienteNombre());

        // Guardar la factura y los detalles
        Factura nuevaFactura = facturaService.crearFactura(factura, detalles);

        return ResponseEntity.ok(nuevaFactura);
    }
}