package com.example.backendinventario.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String nombre;
    @Column(unique = true)
    private String identificacion;
    @Column(unique = true)
    private String correo;
    @Column(unique = true)
    private String telefono;
    private String direccion;
}
