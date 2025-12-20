package com.example.backendinventario.entities;

import lombok.Data;

@Data
public class AbonoDTO {
    private Long prestamoId;
    private float monto;
    private String observacion;
    private String metodoPago;
}
