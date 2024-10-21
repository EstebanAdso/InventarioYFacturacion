package com.example.backendinventario.services;

import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
@Service
public class ProductoServices {

    @Autowired
    private ProductoRepository productoRepository;

    public Optional<Producto> findById(Long id) {
        return productoRepository.findById(id);
    }

    public Producto save(Producto producto) {
        return productoRepository.save(producto);
    }

    public void delete(Long id) {
        productoRepository.deleteById(id);
    }

    // Calcular el total global de todos los productos
    public double totalGlobal() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream().mapToDouble(Producto::getTotal).sum();
    }

    // Calcular el total por categoría
    public Map<String, Double> totalPorCategoria() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream()
                .collect(Collectors.groupingBy(p -> p.getCategoria().getNombre(),
                        Collectors.summingDouble(Producto::getTotal)));
    }

    public Page<Producto> findAll(Pageable pageable) {
        return productoRepository.findAll(pageable);
    }

    public Page<Producto> findByCategoriaNombre(String nombreCategoria, Pageable pageable) {
        return productoRepository.findByCategoriaNombre(nombreCategoria, pageable);
    }

    public Page<Producto> findByNombre(String nombre, Pageable pageable) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre, pageable);
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre); // Implementa el método en el repositorio
    }

    // Método para actualizar inventario al comprar productos
    public Producto actualizarInventario(Long idProducto, int cantidadComprada) throws Exception {
        // Buscar el producto
        Optional<Producto> productoOptional = productoRepository.findById(idProducto);
        if (!productoOptional.isPresent()) {
            throw new Exception("Producto no encontrado");
        }

        Producto producto = productoOptional.get();

        // Verificar si hay suficiente cantidad
        if (producto.getCantidad() < cantidadComprada) {
            throw new Exception("No hay suficiente stock del producto " + producto.getNombre());
        }

        // Actualizar la cantidad del inventario
        producto.setCantidad(producto.getCantidad() - cantidadComprada);

        // Si la cantidad llega a 0, eliminar el producto
        if (producto.getCantidad() == 0) {
            productoRepository.deleteById(producto.getId());
        } else {
            // Si no llega a 0, guardar los cambios
            productoRepository.save(producto);
        }

        return producto;
    }
}