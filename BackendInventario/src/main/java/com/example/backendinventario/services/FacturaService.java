package com.example.backendinventario.services;

import com.example.backendinventario.entities.Factura;
import com.example.backendinventario.entities.FacturaItem;
import com.example.backendinventario.repositories.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacturaService {


    @Autowired
    private FacturaRepository facturaRepository;

    public List<Factura> getAllFacturas() {
        return facturaRepository.findAll();
    }

    public Factura getFacturaById(Long id) {
        return facturaRepository.findById(id).orElse(null);
    }

    public Factura createFactura(Factura factura) {
        // Calcular el total de la factura
        double total = 0;
        for (FacturaItem item : factura.getItems()) {
            item.setTotal(item.getCantidad() * item.getPrecioUnitario());
            total += item.getTotal();
        }
        factura.setTotal(total);

        return facturaRepository.save(factura);
    }

    public Factura updateFactura(Long id, Factura factura) {
        if (!facturaRepository.existsById(id)) {
            throw new RuntimeException("Factura no encontrada");
        }
        factura.setId(id);
        // Calcular el total de la factura
        double total = 0;
        for (FacturaItem item : factura.getItems()) {
            item.setTotal(item.getCantidad() * item.getPrecioUnitario());
            total += item.getTotal();
        }
        factura.setTotal(total);

        return facturaRepository.save(factura);
    }

    public void deleteFactura(Long id) {
        if (!facturaRepository.existsById(id)) {
            throw new RuntimeException("Factura no encontrada");
        }
        facturaRepository.deleteById(id);
    }

}
