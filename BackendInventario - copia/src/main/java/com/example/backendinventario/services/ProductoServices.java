package com.example.backendinventario.services;

import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductoServices {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    public Optional<Producto> findById(Long id) {
        return productoRepository.findById(id);
    }

    public Producto save(Producto producto) {
        return productoRepository.save(producto);
    }

    public void delete(Long id) {
        productoRepository.deleteById(id);
    }

   
    // Buscar productos por nombre de categoría
    public List<Producto> findByCategoriaNombre(String nombreCategoria) {
        return productoRepository.findByCategoriaNombre(nombreCategoria);
    }

    // Calcular el total global de todos los productos
    public double totalGlobal() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream().mapToDouble(p -> p.getTotal()).sum();
    }

    // Calcular el total por categoría
    public Map<String, Double> totalPorCategoria() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream()
                .collect(Collectors.groupingBy(p -> p.getCategoria().getNombre(),
                        Collectors.summingDouble(Producto::getTotal)));
    }

    // Nuevo método para buscar productos por nombre
    public List<Producto> findByNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }
}