package com.example.backendinventario.controller;

import com.example.backendinventario.entities.*;
import com.example.backendinventario.services.ClienteServices;
import com.example.backendinventario.services.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    @Autowired
    private ClienteServices clienteService;

    @PostMapping("/crear")
    public ResponseEntity<Factura> crearFactura(@RequestBody FacturaDTO facturaDTO) {
        // Buscar si el cliente ya existe en la base de datos por la cédula
        Optional<Cliente> clienteExistente = clienteService.findByIdentificacion(facturaDTO.getClienteCedula());

        Cliente cliente;
        if (clienteExistente.isPresent()) {
            // Si el cliente ya existe, verificar si el nombre es diferente y actualizar si es necesario
            cliente = clienteExistente.get();
            if (!cliente.getNombre().equals(facturaDTO.getClienteNombre())) {
                cliente.setNombre(facturaDTO.getClienteNombre());
                clienteService.save(cliente);  // Guardar el cliente actualizado
            }
        } else {
            // Si no existe, crear un nuevo cliente
            cliente = new Cliente();
            cliente.setNombre(facturaDTO.getClienteNombre());
            cliente.setIdentificacion(facturaDTO.getClienteCedula());
            clienteService.save(cliente);  // Guardar el nuevo cliente
        }

        // Crear la factura con el cliente (ya sea existente o actualizado)
        Factura factura = new Factura();
        factura.setCliente(cliente);
        factura.setFechaEmision(new Date());
        factura.setClienteNombre(facturaDTO.getClienteNombre());

        List<DetalleFactura> detalles = facturaDTO.getDetalles().stream().map(det -> {
            DetalleFactura detalleFactura = new DetalleFactura();
            Producto producto = new Producto();
            producto.setId(det.getProductoId());
            detalleFactura.setProducto(producto);
            detalleFactura.setCantidad(det.getCantidad());
            detalleFactura.setDescripcion(det.getDescripcion());
            detalleFactura.setPrecioUnitario(det.getPrecioUnitario());
            detalleFactura.setGarantia(det.getGarantia());
            detalleFactura.setNombreProducto(det.getNombreProducto());
            return detalleFactura;
        }).collect(Collectors.toList());

        Factura nuevaFactura = facturaService.crearFactura(factura, detalles);

        return ResponseEntity.ok(nuevaFactura);
    }
}