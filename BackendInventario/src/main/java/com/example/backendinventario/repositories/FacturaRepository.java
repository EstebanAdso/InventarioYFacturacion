package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Factura;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacturaRepository extends JpaRepository<Factura, Long> {
}
