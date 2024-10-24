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
    private String nombre;
    private float precio;
    private LocalDate fecha; // Agregamos el campo de fecha

    @PrePersist
    protected void onCreate() {
        this.fecha = LocalDate.now(); // Al agregar el producto, se captura la fecha actual automáticamente
    }
}
