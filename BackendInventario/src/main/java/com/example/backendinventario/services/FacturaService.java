package com.example.backendinventario.services;

import com.example.backendinventario.entities.*;
import com.example.backendinventario.repositories.ClienteRepository;
import com.example.backendinventario.repositories.DetalleFacturaRepository;
import com.example.backendinventario.repositories.FacturaRepository;
import com.example.backendinventario.repositories.ProductoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacturaService {
    @Autowired
    private FacturaRepository facturaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private DetalleFacturaRepository detalleFacturaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public List<Factura> findAll() {
        return facturaRepository.findAll();
    }

    @Transactional
    public Factura crearFactura(Factura factura, List<DetalleFactura> detalles) {
        // Verificar si el cliente ya existe
        Cliente cliente = factura.getCliente();
        Optional<Cliente> clienteExistente = clienteRepository.findByIdentificacion(cliente.getIdentificacion());

        if (clienteExistente.isPresent()) {
            factura.setCliente(clienteExistente.get());
        } else {
            clienteRepository.save(cliente);
        }

        // Asignar serial incremental
        Long ultimoId = facturaRepository.count() + 1;
        String serial = String.format("%08d", ultimoId);
        factura.setSerial(serial);

        // Inicializar el total de la factura en cero
        float totalFactura = 0.0f;

        // Guardar factura
        Factura nuevaFactura = facturaRepository.save(factura);

        // Validar y guardar los detalles de la factura
        for (DetalleFactura detalle : detalles) {
            Optional<Producto> productoExistente = productoRepository.findById(detalle.getProducto().getId());

            if (!productoExistente.isPresent()) {
                throw new RuntimeException("Producto con ID " + detalle.getProducto().getId() + " no existe.");
            }

            // Calcular el subtotal de este detalle (cantidad * precioUnitario)
            float subtotal = detalle.getCantidad() * detalle.getPrecioVenta();

            // Sumar este subtotal al total de la factura
            totalFactura += subtotal;

            // Asignar la factura a cada detalle y guardar
            detalle.setFactura(nuevaFactura);
            detalleFacturaRepository.save(detalle);
        }

        // Asignar el total calculado a la factura y guardar
        nuevaFactura.setTotal(totalFactura);
        facturaRepository.save(nuevaFactura);

        return nuevaFactura;
    }

    // Método para obtener los detalles de una factura
    public List<DetalleDTO> getDetallesFactura(Long facturaId) {
        return detalleFacturaRepository.findByFacturaId(facturaId)
                .stream()
                .map(detalle -> {
                    DetalleDTO dto = new DetalleDTO();
                    dto.setProductoId(detalle.getProducto().getId());
                    dto.setDescripcion(detalle.getDescripcion());
                    dto.setCantidad(detalle.getCantidad());
                    dto.setPrecioVenta(detalle.getPrecioVenta());
                    dto.setGarantia(detalle.getGarantia());
                    dto.setNombreProducto(detalle.getNombreProducto());
                    dto.setPrecioCompra(detalle.getPrecioCompra());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public boolean existsById(Long id) {
        return facturaRepository.existsById(id);
    }

    // Método para crear factura sin descontar inventario (usado al convertir préstamos)
    @Transactional
    public Factura crearFacturaSinDescontarInventario(Factura factura, List<DetalleFactura> detalles) {
        // Verificar si el cliente ya existe
        Cliente cliente = factura.getCliente();
        Optional<Cliente> clienteExistente = clienteRepository.findByIdentificacion(cliente.getIdentificacion());

        if (clienteExistente.isPresent()) {
            factura.setCliente(clienteExistente.get());
        } else {
            clienteRepository.save(cliente);
        }

        // Asignar serial incremental
        Long ultimoId = facturaRepository.count() + 1;
        String serial = String.format("%08d", ultimoId);
        factura.setSerial(serial);

        // Inicializar el total de la factura en cero
        float totalFactura = 0.0f;

        // Guardar factura
        Factura nuevaFactura = facturaRepository.save(factura);

        // Guardar los detalles sin modificar inventario
        for (DetalleFactura detalle : detalles) {
            // Calcular el subtotal de este detalle
            float subtotal = detalle.getCantidad() * detalle.getPrecioVenta();
            totalFactura += subtotal;

            // Asignar la factura a cada detalle y guardar
            detalle.setFactura(nuevaFactura);
            detalleFacturaRepository.save(detalle);
        }

        // Asignar el total calculado a la factura y guardar
        nuevaFactura.setTotal(totalFactura);
        facturaRepository.save(nuevaFactura);

        return nuevaFactura;
    }

}
