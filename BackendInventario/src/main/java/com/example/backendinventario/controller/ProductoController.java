package com.example.backendinventario.controller;

import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.services.ProductoServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    public Page<Producto> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productoService.findAll(pageable);
    }

    @GetMapping("{id}")
    public Optional<Producto> buscar(@PathVariable Long id) {
        return productoService.findById(id);
    }

    @GetMapping("/categoria/{nombreCategoria}")
    public Page<Producto> listarPorCategoria(
            @PathVariable String nombreCategoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productoService.findByCategoriaNombre(nombreCategoria, pageable);
    }

    @GetMapping("/nombre/{nombre}")
    public Page<Producto> listarPorNombre(
            @PathVariable String nombre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productoService.findByNombre(nombre, pageable);
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
    public Double totalGlobal() {
        return productoService.totalGlobal();
    }

    @GetMapping("/totalPorCategoria")
    public Map<String, Double> totalPorCategoria() {
        return productoService.totalPorCategoria();
    }

    @GetMapping("/buscar/{nombre}")
    public List<Producto> buscarPorNombre(@PathVariable String nombre) {
        return productoService.buscarPorNombre(nombre); // Implementa este método en tu servicio
    }

}