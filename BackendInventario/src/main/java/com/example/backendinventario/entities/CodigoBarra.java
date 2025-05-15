package com.example.backendinventario.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class CodigoBarra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigoBarra;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    @JsonBackReference
    private Producto producto;

}
