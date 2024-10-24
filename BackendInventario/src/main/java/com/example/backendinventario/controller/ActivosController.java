package com.example.backendinventario.controller;

import com.example.backendinventario.entities.Activos;
import com.example.backendinventario.services.ActivosServices;
import org.springframework.beans.factory.annotation.Autowired;
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

    @DeleteMapping("{id}")
    public void eliminarActivos(@PathVariable long id) {
        activosServices.deleteById(id);
    }
}
