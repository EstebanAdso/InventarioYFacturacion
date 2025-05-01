package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {
    Page<Producto> findAll(Pageable pageable);
    Page<Producto> findByEstado(String estado, Pageable pageable);
    Page<Producto> findByCategoriaNombreAndEstado(String nombreCategoria, String estado, Pageable pageable);
    List<Producto> findByCategoriaId(Long categoriaId);
}