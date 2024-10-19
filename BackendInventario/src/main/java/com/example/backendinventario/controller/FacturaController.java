package com.example.backendinventario.controller;

import com.example.backendinventario.entities.*;
import com.example.backendinventario.services.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    @PostMapping("/crear")
    public ResponseEntity<Factura> crearFactura(@RequestBody FacturaDTO facturaDTO) {
        // Crear la factura a partir del DTO
        Factura factura = new Factura();
        Cliente cliente = new Cliente();
        cliente.setNombre(facturaDTO.getClienteNombre());
        cliente.setIdentificacion(facturaDTO.getClienteCedula());
        factura.setCliente(cliente);
        factura.setFechaEmision(new Date());

        List<DetalleFactura> detalles = facturaDTO.getDetalles().stream().map(det -> {
            DetalleFactura detalleFactura = new DetalleFactura();
            Producto producto = new Producto();
            producto.setId(det.getProductoId());
            detalleFactura.setProducto(producto);
            detalleFactura.setCantidad(det.getCantidad());
            detalleFactura.setDescripcion(det.getDescripcion());
            detalleFactura.setPrecioUnitario(det.getPrecioUnitario());
            detalleFactura.setGarantia(det.getGarantia());
            return detalleFactura;
        }).collect(Collectors.toList());

        Factura nuevaFactura = facturaService.crearFactura(factura, detalles);

        return ResponseEntity.ok(nuevaFactura);
    }
}

