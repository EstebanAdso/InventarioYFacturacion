package com.example.backendinventario.controller;

import com.example.backendinventario.entities.*;
import com.example.backendinventario.services.PrestamoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {

    @Autowired
    private PrestamoService prestamoService;

    @GetMapping
    public List<Prestamo> getAllPrestamos() {
        return prestamoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPrestamoById(@PathVariable Long id) {
        Optional<Prestamo> prestamo = prestamoService.findById(id);
        if (prestamo.isPresent()) {
            return ResponseEntity.ok(prestamo.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Préstamo no encontrado");
    }

    @GetMapping("/pendientes")
    public List<Prestamo> getPendientes() {
        return prestamoService.findPendientes();
    }

    @GetMapping("/tipo/{tipo}")
    public List<Prestamo> getByTipo(@PathVariable String tipo) {
        try {
            Prestamo.TipoPrestamo tipoPrestamo = Prestamo.TipoPrestamo.valueOf(tipo.toUpperCase());
            return prestamoService.findByTipo(tipoPrestamo);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de préstamo inválido");
        }
    }

    @GetMapping("/estado/{estado}")
    public List<Prestamo> getByEstado(@PathVariable String estado) {
        try {
            Prestamo.EstadoPrestamo estadoPrestamo = Prestamo.EstadoPrestamo.valueOf(estado.toUpperCase());
            return prestamoService.findByEstado(estadoPrestamo);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado de préstamo inválido");
        }
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearPrestamo(@RequestBody PrestamoDTO prestamoDTO) {
        try {
            Prestamo nuevoPrestamo = prestamoService.crearPrestamoDesdeDTO(prestamoDTO);
            return ResponseEntity.ok(nuevoPrestamo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/abono")
    public ResponseEntity<?> registrarAbono(@RequestBody AbonoDTO abonoDTO) {
        try {
            Abono abono = prestamoService.registrarAbono(abonoDTO);
            return ResponseEntity.ok(abono);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/convertir-factura")
    public ResponseEntity<?> convertirAFactura(@PathVariable Long id) {
        try {
            Factura factura = prestamoService.convertirAFactura(id);
            return ResponseEntity.ok(factura);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/anular")
    public ResponseEntity<?> anularPrestamo(@PathVariable Long id) {
        try {
            Prestamo prestamo = prestamoService.anularPrestamo(id);
            return ResponseEntity.ok(prestamo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/detalles")
    public ResponseEntity<?> getDetallesPrestamo(@PathVariable Long id) {
        if (!prestamoService.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Préstamo no encontrado");
        }
        return ResponseEntity.ok(prestamoService.getDetallesPrestamo(id));
    }

    @GetMapping("/{id}/abonos")
    public ResponseEntity<?> getAbonosPrestamo(@PathVariable Long id) {
        if (!prestamoService.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Préstamo no encontrado");
        }
        return ResponseEntity.ok(prestamoService.getAbonosPrestamo(id));
    }
}
