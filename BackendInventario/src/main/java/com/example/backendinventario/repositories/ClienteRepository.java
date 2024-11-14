package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Cliente;
import com.example.backendinventario.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByIdentificacion(String identificacion);
    List<Cliente> findByNombreContainingIgnoreCase(String nombre);
}
