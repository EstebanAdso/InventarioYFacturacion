package com.example.backendinventario.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Integer precioComprado;
    private Integer precioVendido;
    private Integer cantidad;
    private Integer total;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;


    @PrePersist
    @PreUpdate
    private void calcularTotal() {
        this.total = this.cantidad * this.precioComprado;
    }
}
