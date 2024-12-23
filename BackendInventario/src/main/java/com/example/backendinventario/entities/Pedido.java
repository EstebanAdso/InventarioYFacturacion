package com.example.backendinventario.entities;

import jakarta.persistence.*;
import lombok.Data;
@Entity
@Data
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private float precioComprado;
    private float precioVendido;
    private Integer cantidad;
    private float total;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    private String estado; // Estado predeterminado: Pendiente

    public Pedido() {
        this.estado = "Pendiente";
    }

    // Método para calcular el total antes de guardar o actualizar
    @PrePersist
    @PreUpdate
    private void calcularTotal() {
        if (this.cantidad != null && this.precioComprado > 0) {
            this.total = this.cantidad * this.precioComprado;
        } else {
            this.total = 0;
        }
    }
}
