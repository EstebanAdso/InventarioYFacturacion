package com.example.backendinventario.repositories;

import com.example.backendinventario.entities.CodigoBarra;
import com.example.backendinventario.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodigoRepository extends JpaRepository<CodigoBarra, Long> {
    List<CodigoBarra> findByProductoId(Long productoId);
}
