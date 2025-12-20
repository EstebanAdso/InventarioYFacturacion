package com.example.backendinventario.services;

import com.example.backendinventario.entities.*;
import com.example.backendinventario.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PrestamoService {

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private DetallePrestamoRepository detallePrestamoRepository;

    @Autowired
    private AbonoRepository abonoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private FacturaService facturaService;

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Prestamo> findAll() {
        return prestamoRepository.findAll();
    }

    public Optional<Prestamo> findById(Long id) {
        return prestamoRepository.findById(id);
    }

    public List<Prestamo> findByEstado(Prestamo.EstadoPrestamo estado) {
        return prestamoRepository.findByEstado(estado);
    }

    public List<Prestamo> findByTipo(Prestamo.TipoPrestamo tipo) {
        return prestamoRepository.findByTipo(tipo);
    }

    public List<Prestamo> findPendientes() {
        return prestamoRepository.findByEstado(Prestamo.EstadoPrestamo.PENDIENTE);
    }

    @Transactional
    public Prestamo crearPrestamoDesdeDTO(PrestamoDTO dto) {
        // Buscar o crear cliente
        Optional<Cliente> clienteExistente = clienteRepository.findByIdentificacion(dto.getClienteCedula());

        Cliente cliente;
        if (clienteExistente.isPresent()) {
            cliente = clienteExistente.get();
            // Actualizar datos del cliente si cambiaron
            if (dto.getClienteNombre() != null && !dto.getClienteNombre().equals(cliente.getNombre())) {
                cliente.setNombre(dto.getClienteNombre());
            }
            if (dto.getCorreo() != null && !dto.getCorreo().equals(cliente.getCorreo())) {
                cliente.setCorreo(dto.getCorreo());
            }
            if (dto.getTelefono() != null && !dto.getTelefono().equals(cliente.getTelefono())) {
                cliente.setTelefono(dto.getTelefono());
            }
            if (dto.getDireccion() != null && !dto.getDireccion().equals(cliente.getDireccion())) {
                cliente.setDireccion(dto.getDireccion());
            }
            clienteRepository.save(cliente);
        } else {
            cliente = new Cliente();
            cliente.setNombre(dto.getClienteNombre());
            cliente.setIdentificacion(dto.getClienteCedula());
            cliente.setCorreo(dto.getCorreo());
            cliente.setTelefono(dto.getTelefono());
            cliente.setDireccion(dto.getDireccion());
            clienteRepository.save(cliente);
        }

        // Crear detalles del préstamo
        List<DetallePrestamo> detalles = new ArrayList<>();
        for (DetalleDTO det : dto.getDetalles()) {
            Producto producto = productoRepository.findById(det.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + det.getProductoId()));

            DetallePrestamo detallePrestamo = new DetallePrestamo();
            detallePrestamo.setProducto(producto);
            detallePrestamo.setCantidad(det.getCantidad());
            detallePrestamo.setDescripcion(det.getDescripcion());
            detallePrestamo.setPrecioVenta(det.getPrecioVenta());
            detallePrestamo.setGarantia(det.getGarantia());
            detallePrestamo.setNombreProducto(producto.getNombre());
            detallePrestamo.setPrecioCompra(det.getPrecioCompra());
            detalles.add(detallePrestamo);
        }

        // Crear el préstamo
        Prestamo prestamo = new Prestamo();
        prestamo.setCliente(cliente);
        prestamo.setClienteNombre(dto.getClienteNombre());
        prestamo.setObservaciones(dto.getObservaciones());

        // Establecer tipo de préstamo
        try {
            Prestamo.TipoPrestamo tipo = Prestamo.TipoPrestamo.valueOf(dto.getTipo().toUpperCase());
            prestamo.setTipo(tipo);
        } catch (Exception e) {
            prestamo.setTipo(Prestamo.TipoPrestamo.PRESTAMO);
        }

        return crearPrestamo(prestamo, detalles, dto.getAbonoInicial(), dto.getMetodoPagoAbono());
    }

    @Transactional
    public Prestamo crearPrestamo(Prestamo prestamo, List<DetallePrestamo> detalles, Float abonoInicial, String metodoPago) {
        // El cliente ya viene guardado desde el controlador

        // Asignar serial incremental
        Long ultimoId = prestamoRepository.count() + 1;
        String serial = "P" + String.format("%08d", ultimoId);
        prestamo.setSerial(serial);

        // Inicializar valores
        float totalPrestamo = 0.0f;
        prestamo.setFechaCreacion(new Date());
        prestamo.setEstado(Prestamo.EstadoPrestamo.PENDIENTE);
        prestamo.setTotalAbonado(0.0f);

        // Guardar préstamo
        Prestamo nuevoPrestamo = prestamoRepository.save(prestamo);

        // Validar y guardar los detalles
        for (DetallePrestamo detalle : detalles) {
            Optional<Producto> productoExistente = productoRepository.findById(detalle.getProducto().getId());

            if (!productoExistente.isPresent()) {
                throw new RuntimeException("Producto con ID " + detalle.getProducto().getId() + " no existe.");
            }

            Producto producto = productoExistente.get();

            // Verificar inventario disponible
            if (producto.getCantidad() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            // Descontar del inventario
            producto.setCantidad(producto.getCantidad() - detalle.getCantidad());
            productoRepository.save(producto);

            // Calcular subtotal
            float subtotal = detalle.getCantidad() * detalle.getPrecioVenta();
            totalPrestamo += subtotal;

            // Asignar el préstamo al detalle y guardar
            detalle.setPrestamo(nuevoPrestamo);
            detalle.setNombreProducto(producto.getNombre());
            detallePrestamoRepository.save(detalle);
        }

        // Asignar totales
        nuevoPrestamo.setTotal(totalPrestamo);
        nuevoPrestamo.setSaldoPendiente(totalPrestamo);
        nuevoPrestamo.setTotalAbonado(0.0f);
        prestamoRepository.save(nuevoPrestamo);

        // Registrar abono inicial si se proporciona
        if (abonoInicial != null && abonoInicial > 0) {
            if (abonoInicial > totalPrestamo) {
                throw new RuntimeException("El abono inicial no puede ser mayor al total del préstamo.");
            }

            Abono abono = new Abono();
            abono.setPrestamo(nuevoPrestamo);
            abono.setMonto(abonoInicial);
            abono.setFechaAbono(new Date());
            abono.setObservacion("Abono inicial");
            abono.setMetodoPago(metodoPago != null ? metodoPago : "EFECTIVO");
            abonoRepository.save(abono);

            // Actualizar totales del préstamo
            nuevoPrestamo.setTotalAbonado(abonoInicial);
            nuevoPrestamo.setSaldoPendiente(totalPrestamo - abonoInicial);

            // Si el abono cubre el total, marcar como pagado
            if (nuevoPrestamo.getSaldoPendiente() <= 0) {
                nuevoPrestamo.setEstado(Prestamo.EstadoPrestamo.PAGADO);
            }

            prestamoRepository.save(nuevoPrestamo);
        }

        return nuevoPrestamo;
    }

    @Transactional
    public Abono registrarAbono(AbonoDTO abonoDTO) {
        Optional<Prestamo> prestamoOpt = prestamoRepository.findById(abonoDTO.getPrestamoId());

        if (!prestamoOpt.isPresent()) {
            throw new RuntimeException("Préstamo no encontrado con ID: " + abonoDTO.getPrestamoId());
        }

        Prestamo prestamo = prestamoOpt.get();

        if (prestamo.getEstado() != Prestamo.EstadoPrestamo.PENDIENTE) {
            throw new RuntimeException("No se puede abonar a un préstamo que no está pendiente.");
        }

        if (abonoDTO.getMonto() <= 0) {
            throw new RuntimeException("El monto del abono debe ser mayor a cero.");
        }

        if (abonoDTO.getMonto() > prestamo.getSaldoPendiente()) {
            throw new RuntimeException("El monto del abono excede el saldo pendiente.");
        }

        // Crear y guardar el abono
        Abono abono = new Abono();
        abono.setPrestamo(prestamo);
        abono.setMonto(abonoDTO.getMonto());
        abono.setFechaAbono(new Date());
        abono.setObservacion(abonoDTO.getObservacion());
        abono.setMetodoPago(abonoDTO.getMetodoPago());
        abonoRepository.save(abono);

        // Actualizar totales del préstamo
        prestamo.setTotalAbonado(prestamo.getTotalAbonado() + abonoDTO.getMonto());
        prestamo.setSaldoPendiente(prestamo.getTotal() - prestamo.getTotalAbonado());

        // Si el saldo pendiente es 0, generar factura automáticamente
        if (prestamo.getSaldoPendiente() <= 0) {
            prestamo.setEstado(Prestamo.EstadoPrestamo.PAGADO);
            prestamoRepository.save(prestamo);
            
            // Generar factura automáticamente
            convertirAFacturaInterno(prestamo);
        } else {
            prestamoRepository.save(prestamo);
        }

        return abono;
    }
    
    // Método interno para convertir a factura sin validaciones de estado
    private Factura convertirAFacturaInterno(Prestamo prestamo) {
        // Obtener detalles del préstamo
        List<DetallePrestamo> detallesPrestamo = detallePrestamoRepository.findByPrestamoId(prestamo.getId());

        // Crear factura
        Factura factura = new Factura();
        factura.setCliente(prestamo.getCliente());
        factura.setFechaEmision(new Date());
        factura.setClienteNombre(prestamo.getClienteNombre());

        // Convertir detalles de préstamo a detalles de factura
        List<DetalleFactura> detallesFactura = new ArrayList<>();
        for (DetallePrestamo dp : detallesPrestamo) {
            DetalleFactura df = new DetalleFactura();
            df.setProducto(dp.getProducto());
            df.setCantidad(dp.getCantidad());
            df.setDescripcion(dp.getDescripcion());
            df.setPrecioVenta(dp.getPrecioVenta());
            df.setPrecioCompra(dp.getPrecioCompra());
            df.setGarantia(dp.getGarantia());
            df.setNombreProducto(dp.getNombreProducto());
            detallesFactura.add(df);
        }

        // Crear la factura (sin descontar inventario porque ya se descontó en el préstamo)
        Factura nuevaFactura = facturaService.crearFacturaSinDescontarInventario(factura, detallesFactura);

        // Actualizar estado del préstamo
        prestamo.setEstado(Prestamo.EstadoPrestamo.CANCELADO);
        prestamo.setFacturaGenerada(nuevaFactura);
        prestamoRepository.save(prestamo);

        return nuevaFactura;
    }

    @Transactional
    public Factura convertirAFactura(Long prestamoId) {
        Optional<Prestamo> prestamoOpt = prestamoRepository.findById(prestamoId);

        if (!prestamoOpt.isPresent()) {
            throw new RuntimeException("Préstamo no encontrado con ID: " + prestamoId);
        }

        Prestamo prestamo = prestamoOpt.get();

        if (prestamo.getEstado() == Prestamo.EstadoPrestamo.CANCELADO) {
            throw new RuntimeException("Este préstamo ya fue convertido a factura.");
        }

        if (prestamo.getEstado() == Prestamo.EstadoPrestamo.ANULADO) {
            throw new RuntimeException("No se puede convertir un préstamo anulado a factura.");
        }

        // Obtener detalles del préstamo
        List<DetallePrestamo> detallesPrestamo = detallePrestamoRepository.findByPrestamoId(prestamoId);

        // Crear factura
        Factura factura = new Factura();
        factura.setCliente(prestamo.getCliente());
        factura.setFechaEmision(new Date());
        factura.setClienteNombre(prestamo.getClienteNombre());

        // Convertir detalles de préstamo a detalles de factura
        List<DetalleFactura> detallesFactura = new ArrayList<>();
        for (DetallePrestamo dp : detallesPrestamo) {
            DetalleFactura df = new DetalleFactura();
            df.setProducto(dp.getProducto());
            df.setCantidad(dp.getCantidad());
            df.setDescripcion(dp.getDescripcion());
            df.setPrecioVenta(dp.getPrecioVenta());
            df.setPrecioCompra(dp.getPrecioCompra());
            df.setGarantia(dp.getGarantia());
            df.setNombreProducto(dp.getNombreProducto());
            detallesFactura.add(df);
        }

        // Crear la factura (sin descontar inventario porque ya se descontó en el préstamo)
        Factura nuevaFactura = facturaService.crearFacturaSinDescontarInventario(factura, detallesFactura);

        // Actualizar estado del préstamo
        prestamo.setEstado(Prestamo.EstadoPrestamo.CANCELADO);
        prestamo.setFacturaGenerada(nuevaFactura);
        prestamoRepository.save(prestamo);

        return nuevaFactura;
    }

    @Transactional
    public Prestamo anularPrestamo(Long prestamoId) {
        Optional<Prestamo> prestamoOpt = prestamoRepository.findById(prestamoId);

        if (!prestamoOpt.isPresent()) {
            throw new RuntimeException("Préstamo no encontrado con ID: " + prestamoId);
        }

        Prestamo prestamo = prestamoOpt.get();

        if (prestamo.getEstado() != Prestamo.EstadoPrestamo.PENDIENTE) {
            throw new RuntimeException("Solo se pueden anular préstamos pendientes.");
        }

        // Devolver productos al inventario
        List<DetallePrestamo> detalles = detallePrestamoRepository.findByPrestamoId(prestamoId);
        for (DetallePrestamo detalle : detalles) {
            Producto producto = detalle.getProducto();
            producto.setCantidad(producto.getCantidad() + detalle.getCantidad());
            productoRepository.save(producto);
        }

        // Marcar como anulado
        prestamo.setEstado(Prestamo.EstadoPrestamo.ANULADO);
        prestamoRepository.save(prestamo);

        return prestamo;
    }

    public List<DetalleDTO> getDetallesPrestamo(Long prestamoId) {
        return detallePrestamoRepository.findByPrestamoId(prestamoId)
                .stream()
                .map(detalle -> {
                    DetalleDTO dto = new DetalleDTO();
                    dto.setProductoId(detalle.getProducto().getId());
                    dto.setDescripcion(detalle.getDescripcion());
                    dto.setCantidad(detalle.getCantidad());
                    dto.setPrecioVenta(detalle.getPrecioVenta());
                    dto.setGarantia(detalle.getGarantia());
                    dto.setNombreProducto(detalle.getNombreProducto());
                    dto.setPrecioCompra(detalle.getPrecioCompra());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<Abono> getAbonosPrestamo(Long prestamoId) {
        return abonoRepository.findByPrestamoId(prestamoId);
    }

    public boolean existsById(Long id) {
        return prestamoRepository.existsById(id);
    }
}
