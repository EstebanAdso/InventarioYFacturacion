package com.example.backendinventario.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Activos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer cantidad;
    private LocalDate fecha; // Agregamos el campo de fecha
    private String nombre;
    private float precio;
    private float total;

    @PrePersist
    @PreUpdate
    private void calcularTotal() {
        this.fecha = LocalDate.now(); // actualizar fecha
        if (this.cantidad != null && this.precio != 0) {
            this.total = this.cantidad * this.precio;
        } else {
            this.total = 0;
        }
    }
}
