package com.example.backendinventario.controller;

import com.example.backendinventario.entities.CodigoBarra;
import com.example.backendinventario.entities.CodigoBarraDTO;
import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.services.CodigoBarraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("codigoBarra")
public class CodigoBarraController {

    @Autowired
    private CodigoBarraService codigoBarraService;

    @PostMapping
    public CodigoBarra guardarCodigoBarra(@RequestBody CodigoBarraDTO dto) throws Exception {
        return codigoBarraService.guardarCodigoBarra(dto);
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<CodigoBarra>> obtenerCodigosPorProducto(@PathVariable Long productoId) {
        List<CodigoBarra> codigos = codigoBarraService.obtenerPorProductoId(productoId);
        return ResponseEntity.ok(codigos);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        codigoBarraService.deleteById(id);
    }
}
