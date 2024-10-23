package com.example.backendinventario.entities;

import lombok.Data;

import java.util.List;

@Data
public class FacturaDTO {
    private String clienteNombre;
    private String clienteCedula;
    private String correo;      // Campo opcional
    private String telefono;    // Campo opcional
    private String direccion;   // Campo opcional
    private List<DetalleDTO> detalles;
}
