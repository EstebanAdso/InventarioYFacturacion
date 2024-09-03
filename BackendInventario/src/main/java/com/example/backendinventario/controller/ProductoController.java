package com.example.backendinventario.controller;

import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.services.ProductoServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("producto")
public class ProductoController {

    @Autowired
    private ProductoServices productoService;

    @GetMapping
    public List<Producto> listar() {
        return productoService.findAll();
    }

    @GetMapping("{id}")
    public Optional<Producto> buscar(@PathVariable Long id) {
        return productoService.findById(id);
    }

    @GetMapping("/categoria/{nombreCategoria}")
    public List<Producto> listarPorCategoria(@PathVariable String nombreCategoria) {
        return productoService.findByCategoriaNombre(nombreCategoria);
    }

    @PostMapping
    public Producto insertar(@RequestBody Producto producto) {
        return productoService.save(producto);
    }

    @PutMapping("{id}")
    public Producto actualizar(@PathVariable Long id, @RequestBody Producto productoActualizado) {
        Producto productoExistente = productoService.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        productoExistente.setNombre(productoActualizado.getNombre());
        productoExistente.setPrecioComprado(productoActualizado.getPrecioComprado());
        productoExistente.setPrecioVendido(productoActualizado.getPrecioVendido());
        productoExistente.setCantidad(productoActualizado.getCantidad());
        productoExistente.setCategoria(productoActualizado.getCategoria());

        return productoService.save(productoExistente);
    }

    @DeleteMapping("{id}")
    public void eliminar(@PathVariable Long id) {
        productoService.delete(id);
    }


    @GetMapping("/totalGlobal")
    public Integer totalGlobal() {
        return productoService.totalGlobal();
    }

    @GetMapping("/totalPorCategoria")
    public Map<String, Integer> totalPorCategoria() {
        return productoService.totalPorCategoria();
    }

    // Nuevo endpoint para buscar productos por nombre
    @GetMapping("/nombre/{nombre}")
    public List<Producto> listarPorNombre(@PathVariable String nombre) {
        return productoService.findByNombre(nombre);
    }
}