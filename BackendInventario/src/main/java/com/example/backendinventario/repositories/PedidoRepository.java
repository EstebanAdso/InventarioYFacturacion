package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    Page<Pedido> findAllByEstado(String estado, Pageable pageable);
}
