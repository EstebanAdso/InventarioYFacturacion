package com.example.backendinventario.controller;

import com.example.backendinventario.entities.Categoria;
import com.example.backendinventario.services.CategoriaServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("categoria")
public class CategoriaController {
    @Autowired
    private CategoriaServices categoriaServices;

    @GetMapping("/{id}")
    public Optional<Categoria> buscar(@PathVariable Long id) {
        return categoriaServices.findById(id);
    }

    @GetMapping
    public List<Categoria> listar() {
        return categoriaServices.findAll();
    }

    @PostMapping
    public Categoria insertar(@RequestBody Categoria categoria) {
        return categoriaServices.save(categoria);
    }

    @DeleteMapping("/delete/{id}")
    public void eliminar(@PathVariable Long id) {
        categoriaServices.delete(id);
    }

    @PutMapping("/update/{id}")
    public Categoria actualizar(@PathVariable Long id, @RequestBody Categoria categoria) {
        return categoriaServices.update(id, categoria);
    }

}