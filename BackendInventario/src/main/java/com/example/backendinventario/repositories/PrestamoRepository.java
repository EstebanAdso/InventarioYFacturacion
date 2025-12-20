package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
    List<Prestamo> findByEstado(Prestamo.EstadoPrestamo estado);
    List<Prestamo> findByTipo(Prestamo.TipoPrestamo tipo);
    List<Prestamo> findByClienteId(Long clienteId);
    List<Prestamo> findByEstadoAndTipo(Prestamo.EstadoPrestamo estado, Prestamo.TipoPrestamo tipo);
}
