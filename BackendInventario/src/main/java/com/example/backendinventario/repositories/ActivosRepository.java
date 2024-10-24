package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Activos;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivosRepository extends JpaRepository<Activos, Long> {
}
