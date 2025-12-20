package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.DetallePrestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePrestamoRepository extends JpaRepository<DetallePrestamo, Long> {
    List<DetallePrestamo> findByPrestamoId(Long prestamoId);
    void deleteByPrestamoId(Long prestamoId);
}
