package com.example.backendinventario.controller;

import com.example.backendinventario.entities.*;
import com.example.backendinventario.services.ClienteServices;
import com.example.backendinventario.services.FacturaService;
import com.example.backendinventario.services.ProductoServices;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping
    public List<Factura> getAllFacturas() {
        return facturaService.findAll();
    }

    @Transactional
    @PostMapping("/crear")
    public ResponseEntity<?> crearFactura(@RequestBody FacturaDTO facturaDTO) {
        // Buscar si el cliente ya existe en la base de datos por la identificación
        Optional<Cliente> clienteExistente = clienteService.findByIdentificacion(facturaDTO.getClienteCedula());

        Cliente cliente;
        if (clienteExistente.isPresent()) {
            cliente = clienteExistente.get();

            // Actualizar solo si el valor ha cambiado o si es nulo
            if (!cliente.getNombre().equals(facturaDTO.getClienteNombre())) {
                cliente.setNombre(facturaDTO.getClienteNombre());
            }
            if (facturaDTO.getCorreo() != null && !facturaDTO.getCorreo().equals(cliente.getCorreo())) {
                cliente.setCorreo(facturaDTO.getCorreo());
            }
            if (facturaDTO.getTelefono() != null && !facturaDTO.getTelefono().equals(cliente.getTelefono())) {
                cliente.setTelefono(facturaDTO.getTelefono());
            }
            if (facturaDTO.getDireccion() != null && !facturaDTO.getDireccion().equals(cliente.getDireccion())) {
                cliente.setDireccion(facturaDTO.getDireccion());
            }
            // Guardar el cliente actualizado
            clienteService.save(cliente);
        } else {
            // Si el cliente no existe, crear uno nuevo
            cliente = new Cliente();
            cliente.setNombre(facturaDTO.getClienteNombre());
            cliente.setIdentificacion(facturaDTO.getClienteCedula());

            // Guardar los datos opcionales si están presentes
            if (facturaDTO.getCorreo() != null) {
                cliente.setCorreo(facturaDTO.getCorreo());
            }
            if (facturaDTO.getTelefono() != null) {
                cliente.setTelefono(facturaDTO.getTelefono());
            }
            if (facturaDTO.getDireccion() != null) {
                cliente.setDireccion(facturaDTO.getDireccion());
            }

            clienteService.save(cliente);
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
                detalleFactura.setPrecioVenta(det.getPrecioVenta());
                detalleFactura.setGarantia(det.getGarantia());
                detalleFactura.setNombreProducto(productoActualizado.getNombre());
                detalleFactura.setPrecioCompra(det.getPrecioCompra());

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

    @GetMapping("/{id}/detalles")
    public List<DetalleDTO> getDetallesFactura(@PathVariable Long id) {
        if (!facturaService.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada");
        }
        return facturaService.getDetallesFactura(id);
    }


}