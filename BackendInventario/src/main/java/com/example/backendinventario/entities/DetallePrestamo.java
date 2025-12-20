package com.example.backendinventario.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class DetallePrestamo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prestamo_id")
    private Prestamo prestamo;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private String nombreProducto;
    private String descripcion;
    private Integer cantidad;
    private float precioVenta;
    private float precioCompra;
    private String garantia;
}
