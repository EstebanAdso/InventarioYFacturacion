package com.example.backendinventario.entities;

import lombok.Data;

@Data
public class DetalleDTO {
    private Long productoId;
    private String descripcion;
    private Integer cantidad;
    private float precioUnitario;
    private String garantia;
    private String nombreProducto;
    private float pc;
}
