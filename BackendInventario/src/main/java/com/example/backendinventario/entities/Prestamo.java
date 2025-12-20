package com.example.backendinventario.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
public class Prestamo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serial; // Serial único para el préstamo

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaCreacion;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private String clienteNombre;

    private float total; // Total del préstamo

    private float totalAbonado; // Suma de todos los abonos realizados

    private float saldoPendiente; // total - totalAbonado

    // PRESTAMO: Producto prestado a cliente/local (puede que no lo devuelvan o paguen)
    // APARTADO: Cliente abona para separar un producto
    @Enumerated(EnumType.STRING)
    private TipoPrestamo tipo;

    // PENDIENTE: Préstamo activo sin finalizar
    // PAGADO: Se completó el pago total
    // CANCELADO: Se convirtió en factura
    // ANULADO: Se anuló el préstamo (devuelve productos al inventario)
    @Enumerated(EnumType.STRING)
    private EstadoPrestamo estado;

    private String observaciones;

    // Referencia a la factura generada cuando se cancela/finaliza
    @OneToOne
    @JoinColumn(name = "factura_id")
    private Factura facturaGenerada;

    public enum TipoPrestamo {
        PRESTAMO,
        APARTADO
    }

    public enum EstadoPrestamo {
        PENDIENTE,
        PAGADO,
        CANCELADO,
        ANULADO
    }
}
