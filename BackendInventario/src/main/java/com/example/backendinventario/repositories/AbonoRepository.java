package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Abono;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbonoRepository extends JpaRepository<Abono, Long> {
    List<Abono> findByPrestamoId(Long prestamoId);
}
