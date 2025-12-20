package com.example.backendinventario.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
public class Abono {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prestamo_id")
    private Prestamo prestamo;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaAbono;

    private float monto;

    private String observacion;

    // Método de pago: EFECTIVO, TRANSFERENCIA, TARJETA, etc.
    private String metodoPago;
}
