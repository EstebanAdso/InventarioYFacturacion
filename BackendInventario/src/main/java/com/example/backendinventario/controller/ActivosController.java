package com.example.backendinventario.controller;

import com.example.backendinventario.entities.Activos;
import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.services.ActivosServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("activos")
public class ActivosController {

    @Autowired
    private ActivosServices activosServices;

    @GetMapping
    public List<Activos> listarActivos() {
        return activosServices.getAllActivos();
    }

    @GetMapping("{id}")
    public Optional<Activos> buscarActivosPorId(@PathVariable long id) {
        return activosServices.getActivosById(id);
    }

    @PostMapping
    public Activos guardarActivos(@RequestBody Activos activos) {
        return activosServices.save(activos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarActivo(@PathVariable Long id) {
        activosServices.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/totalGlobal")
    public ResponseEntity<Double> totalGlobal() {
        Double total = activosServices.totalGlobal();
        return ResponseEntity.ok(total); // Devuelve el total en la respuesta
    }

    @PutMapping("{id}")
    public Activos actualizar(@PathVariable Long id, @RequestBody Activos activoActualizado) {
        Activos activoExistente = activosServices.getActivosById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        activoExistente.setNombre(activoActualizado.getNombre());
        activoExistente.setPrecio(activoActualizado.getPrecio());
        activoExistente.setCantidad(activoActualizado.getCantidad());
        return activosServices.save(activoExistente);
    }
}
