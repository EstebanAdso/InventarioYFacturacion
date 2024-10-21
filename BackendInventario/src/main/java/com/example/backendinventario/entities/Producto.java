package com.example.backendinventario.entities;
import jakarta.persistence.*;
import lombok.Data;

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

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    public Producto() {}



    @PrePersist
    @PreUpdate
    private void calcularTotal() {
        if (this.cantidad != null && this.precioComprado != 0) {
            this.total = this.cantidad * this.precioComprado;
        } else {
            this.total = 0;  // Si no hay cantidad o precio, el total es 0
        }
    }

}
