package com.example.backendinventario.services;

import com.example.backendinventario.entities.Cliente;
import com.example.backendinventario.entities.DetalleFactura;
import com.example.backendinventario.entities.Factura;
import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.repositories.ClienteRepository;
import com.example.backendinventario.repositories.DetalleFacturaRepository;
import com.example.backendinventario.repositories.FacturaRepository;
import com.example.backendinventario.repositories.ProductoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        String serial = String.format("%06d", ultimoId);
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

            Producto producto = productoExistente.get();

            // Calcular el subtotal de este detalle (cantidad * precioUnitario)
            float subtotal = detalle.getCantidad() * detalle.getPrecioUnitario();

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
}
