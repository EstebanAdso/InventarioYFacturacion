package com.example.backendinventario.services;

import com.example.backendinventario.entities.Pedido;
import com.example.backendinventario.repositories.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PedidoServices {
    @Autowired
    private PedidoRepository pedidoRepository;

    public Page<Pedido> findAll(Pageable pageable) {
        return pedidoRepository.findAllByEstado("Pendiente", pageable);
    }

    public Optional<Pedido> findById(Long id) {
        return pedidoRepository.findById(id);
    }

    public Pedido save(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    public void deleteById(Long id) {
        pedidoRepository.deleteById(id);
    }

    public double totalGlobal() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        return pedidos.stream().mapToDouble(Pedido::getTotal).sum();
    }
}
