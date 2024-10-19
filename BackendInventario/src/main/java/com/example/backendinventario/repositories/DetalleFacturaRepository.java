package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.DetalleFactura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleFacturaRepository extends JpaRepository<DetalleFactura, Long> {
}