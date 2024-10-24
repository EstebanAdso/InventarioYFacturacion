package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Page<Producto> findAll(Pageable pageable);
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    Page<Producto> findByEstado(String estado, Pageable pageable);
    Page<Producto> findByCategoriaNombreAndEstado(String nombreCategoria, String estado, Pageable pageable);
    Page<Producto> findByNombreContainingAndEstado(String nombre, String estado, Pageable pageable);
}
