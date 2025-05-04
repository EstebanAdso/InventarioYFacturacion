package com.example.backendinventario.entities;
import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Data
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private float precioComprado;
    private float precioVendido;
    private Integer cantidad;
    private float total;
    @Column(length = 6000)
    private String descripcion;
    @Column(unique = true)
    private String codigo;
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;
    private String estado;

    public Producto() {
        this.estado = "activo"; // Por defecto, el producto se considera activo al crearse
        this.descripcion = null;
    }

    @PrePersist
    private void prePersist() {
        calcularTotal();

        // Generar código si no fue definido
        if (this.codigo == null || this.codigo.trim().isEmpty()) {
            this.codigo = generarCodigo();
        }
    }

    @PreUpdate
    private void preUpdate() {
        calcularTotal();
    }

    private void calcularTotal() {
        if (this.cantidad != null && this.precioComprado != 0) {
            this.total = this.cantidad * this.precioComprado;
        } else {
            this.total = 0;
        }
    }

    private String generarCodigo() {
        // Código tipo PRD-20240503-<ID aleatorio corto>
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "PRD-" + java.time.LocalDate.now() + "-" + uuid;
    }

}
