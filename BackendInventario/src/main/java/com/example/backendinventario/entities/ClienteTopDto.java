package com.example.backendinventario.entities;

import lombok.Data;

@Data
public class ClienteTopDto {
    private Long clienteId;
    private String clienteNombre;
    private String identificacion;
    private String telefono;
    private String direccion;
    private String correo;
    private Double totalCompras; // Agregar esta propiedad

}
