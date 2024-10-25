package com.example.backendinventario.controller;

import com.example.backendinventario.entities.Pedido;
import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.services.PedidoServices;
import com.example.backendinventario.services.ProductoServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("pedido")
public class PedidoController {

    @Autowired
    private PedidoServices pedidoService;

    @Autowired
    private ProductoServices productoService;

    @GetMapping
    public Page<Pedido> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pedidoService.findAll(pageable); // Solo pedidos pendientes
    }

    @PostMapping
    public Pedido insertar(@RequestBody Pedido pedido) {
        return pedidoService.save(pedido);
    }

    @PutMapping("/{id}")
    public Pedido editarPedido(@PathVariable Long id, @RequestBody Pedido pedidoActualizado) {
        Pedido pedidoExistente = pedidoService.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        pedidoExistente.setNombre(pedidoActualizado.getNombre());
        pedidoExistente.setPrecioComprado(pedidoActualizado.getPrecioComprado());
        pedidoExistente.setPrecioVendido(pedidoActualizado.getPrecioVendido());
        pedidoExistente.setCantidad(pedidoActualizado.getCantidad());
        pedidoExistente.setCategoria(pedidoActualizado.getCategoria());
        return pedidoService.save(pedidoExistente);
    }

    @PutMapping("{id}/recibir")
    public Producto recibirPedido(@PathVariable Long id) {
        Pedido pedido = pedidoService.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        Producto producto = new Producto();
        producto.setNombre(pedido.getNombre());
        producto.setPrecioComprado(pedido.getPrecioComprado());
        producto.setPrecioVendido(pedido.getPrecioVendido());
        producto.setCantidad(pedido.getCantidad());
        producto.setCategoria(pedido.getCategoria());

        productoService.save(producto);
        pedidoService.deleteById(id);
        return producto;
    }

    @GetMapping("/totalGlobal")
    public ResponseEntity<Double> totalGlobal() {
        Double total = pedidoService.totalGlobal();
        return ResponseEntity.ok(total); // Devuelve el total en la respuesta
    }

    // Aquí agregamos el método para eliminar pedidos
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        pedidoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

