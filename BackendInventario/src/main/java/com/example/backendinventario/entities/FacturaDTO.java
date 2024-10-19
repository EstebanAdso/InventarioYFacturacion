package com.example.backendinventario.entities;

import lombok.Data;

import java.util.List;

@Data
public class FacturaDTO {
    private String clienteNombre;
    private String clienteCedula;
    private List<DetalleDTO> detalles;
}
