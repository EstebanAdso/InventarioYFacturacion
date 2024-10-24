package com.example.backendinventario.controller;

import com.example.backendinventario.entities.Pedido;
import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.services.PedidoServices;
import com.example.backendinventario.services.ProductoServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    @PutMapping("{id}/recibir")
    public Producto recibirPedido(@PathVariable Long id) {
        Pedido pedido = pedidoService.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Crear un producto en inventario a partir del pedido
        Producto producto = new Producto();
        producto.setNombre(pedido.getNombre());
        producto.setPrecioComprado(pedido.getPrecioComprado());
        producto.setPrecioVendido(pedido.getPrecioVendido());
        producto.setCantidad(pedido.getCantidad());
        producto.setCategoria(pedido.getCategoria());

        // Guardar el producto en el inventario
        productoService.save(producto);

        // Eliminar el pedido usando su ID
        pedidoService.deleteById(id);

        return producto;
    }


}