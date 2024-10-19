package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    List<Cliente> findByNombreContaining(String nombre);
    Optional<Cliente> findByIdentificacion(String identificacion);
}
