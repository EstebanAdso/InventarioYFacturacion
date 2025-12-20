package com.example.backendinventario.entities;

import lombok.Data;

import java.util.List;

@Data
public class PrestamoDTO {
    private String clienteNombre;
    private String clienteCedula;
    private String correo;
    private String telefono;
    private String direccion;
    private String tipo; // PRESTAMO o APARTADO
    private String observaciones;
    private List<DetalleDTO> detalles;
    private Float abonoInicial; // Monto del abono inicial (opcional, útil para APARTADO)
    private String metodoPagoAbono; // Método de pago del abono inicial
}
