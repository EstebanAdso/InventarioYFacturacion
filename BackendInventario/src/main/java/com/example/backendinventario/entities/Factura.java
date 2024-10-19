package com.example.backendinventario.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serial; //empezando desde 000001
    private Date fechaEmision;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private float total;


}
