package com.example.backendinventario.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate fecha;
    private String nombreCliente;
    private String nitCedula;
    private Integer garantia;
    private String descripcion;
    private Double total;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FacturaItem> items;

}
