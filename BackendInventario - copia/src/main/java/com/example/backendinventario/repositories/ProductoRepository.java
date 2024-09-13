package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoriaNombre(String nombreCategoria);
    //Busqueda por nombre
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}
