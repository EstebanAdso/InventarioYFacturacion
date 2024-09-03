package com.example.backendinventario.controller;

import com.example.backendinventario.entities.Categoria;
import com.example.backendinventario.entities.Producto;
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

    @GetMapping
    public List<Categoria> listar() {
        return categoriaServices.findAll();
    }

    @GetMapping("{id}")
    public Optional<Categoria> buscar(@PathVariable Long id) {
        return categoriaServices.findById(id);
    }

    @PostMapping
    public Categoria insertar(@RequestBody Categoria categoria) {
        return categoriaServices.save(categoria);
    }

    @DeleteMapping("{id}")
    public void eliminar(@PathVariable Long id) {
        categoriaServices.delete(id);
    }
}