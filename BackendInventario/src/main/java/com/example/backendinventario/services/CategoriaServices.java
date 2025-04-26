package com.example.backendinventario.services;

import com.example.backendinventario.entities.Categoria;
import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.repositories.CategoriaRepository;
import com.example.backendinventario.repositories.DetalleFacturaRepository;
import com.example.backendinventario.repositories.ProductoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaServices {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private DetalleFacturaRepository detalleFacturaRepository;

    public List<Categoria> findAll() {
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> findById(Long id) {
        return categoriaRepository.findById(id);
    }

    public Categoria save(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @Transactional
    public void delete(Long id) {
        // Obtiene los productos asociados a la categoría
        List<Producto> productos = productoRepository.findByCategoriaId(id);

        // Elimina los registros de detalle_factura asociados a los productos
        productos.forEach(producto -> {
            detalleFacturaRepository.deleteByProductoId(producto.getId());
        });

        // Ahora elimina los productos
        productoRepository.deleteAll(productos);

        // Finalmente elimina la categoría
        categoriaRepository.deleteById(id);
    }

    @Transactional
    public Categoria update(Long id, Categoria nuevaCategoria) {
        // Busca la categoría por ID
        Categoria categoriaExistente = categoriaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada con el ID: " + id));

        // Actualiza los campos
        categoriaExistente.setNombre(nuevaCategoria.getNombre());
        categoriaExistente.setDescripcion(nuevaCategoria.getDescripcion());
        categoriaExistente.setDescripcionGarantia(nuevaCategoria.getDescripcionGarantia());

        // Retorna la categoría actualizada (el repositorio JPA gestionará la actualización en la base de datos)
        return categoriaRepository.save(categoriaExistente);
    }


}
