package com.example.backendinventario.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private float precioComprado;
    private float precioVendido;
    private float precioMayorista;
    private Integer cantidad;
    private float total;
    private int garantia;
    @Column(length = 6000)
    private String descripcion;

    @Column(unique = true)
    private String sku;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CodigoBarra> codigosDeBarra = new ArrayList<>();


    private String estado;
    private Integer alertaStock;

    public Producto() {
        this.estado = "activo"; // Estado por defecto
        this.descripcion = null;
        this.alertaStock = 0;
        this.garantia = 1;
    }

    // Calcular el total al persistir o actualizar
    @PrePersist
    @PreUpdate
    private void calcularTotal() {
        if (this.cantidad != null && this.precioComprado != 0) {
            this.total = this.cantidad * this.precioComprado;
        } else {
            this.total = 0;
        }
    }
}
