package com.example.backendinventario.services;

import com.example.backendinventario.entities.CodigoBarra;
import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
@Service
public class ProductoServices {

    @Autowired
    private ProductoRepository productoRepository;

    public Optional<Producto> findById(Long id) {
        return productoRepository.findById(id);
    }

    public Producto save(Producto producto) {
        // Validar SKU si ya fue asignado
        if (producto.getSku() != null && !producto.getSku().trim().isEmpty()) {
            Producto productoConMismoSku = productoRepository.findBySkuOrCodigoBarra(producto.getSku());
            if (productoConMismoSku != null) {
                // Si el SKU ya existe pero pertenece a otro producto, generar nuevo
                if (producto.getId() == null || !productoConMismoSku.getId().equals(producto.getId())) {
                    producto.setSku(generarCodigoNuevo());
                }
                // Si el SKU es del mismo producto, se conserva
            }
        } else {
            // SKU es nulo o vacío: generar uno nuevo
            String nuevoCodigo;
            do {
                nuevoCodigo = generarCodigoNuevo();
            } while (productoRepository.existsBySku(nuevoCodigo));
            producto.setSku(nuevoCodigo);
        }

        // 🔁 Enlazar códigos de barra al producto antes de guardar
        if (producto.getCodigosDeBarra() != null) {
            for (CodigoBarra cb : producto.getCodigosDeBarra()) {
                cb.setProducto(producto);
            }
        }

        // Calcular el total
        if (producto.getCantidad() != null && producto.getPrecioComprado() != 0) {
            producto.setTotal(producto.getCantidad() * producto.getPrecioComprado());
        } else {
            producto.setTotal(0);
        }

        return productoRepository.save(producto);
    }

    // Calcular el total global de todos los productos
    public double totalGlobal() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream().mapToDouble(Producto::getTotal).sum();
    }

    // Calcular el total por categoría
    public Map<String, Double> totalPorCategoria() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream()
                .collect(Collectors.groupingBy(p -> p.getCategoria().getNombre(),
                        Collectors.summingDouble(Producto::getTotal)));
    }

    // Todos los productos Activos
    public Page<Producto> findAll(Pageable pageable) {
        return productoRepository.findByEstado("activo", pageable);
    }

    // Filtrar productos por categoría y estado activo
    public Page<Producto> findByCategoriaNombre(String nombreCategoria, Pageable pageable) {
        return productoRepository.findByCategoriaNombreAndEstado(nombreCategoria, "activo", pageable);
    }

    public Page<Producto> findByNombre(String nombre, Pageable pageable) {
        // Dividir el nombre en palabras individuales
        String[] palabras = nombre.toLowerCase().split("\\s+");

        // Crear una especificación para cada palabra
        Specification<Producto> spec = Specification.where(null);

        for (String palabra : palabras) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("nombre")), "%" + palabra + "%"));
        }

        // Agregar condición de estado activo
        spec = spec.and((root, query, cb) ->
                cb.equal(root.get("estado"), "activo"));

        return productoRepository.findAll(spec, pageable);
    }

    public Page<Producto> findByNombreInactivo(String nombre, Pageable pageable) {
        // Dividir el nombre en palabras individuales
        String[] palabras = nombre.toLowerCase().split("\\s+");

        // Crear una especificación para cada palabra
        Specification<Producto> spec = Specification.where(null);

        for (String palabra : palabras) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("nombre")), "%" + palabra + "%"));
        }

        // Agregar condición de estado activo
        spec = spec.and((root, query, cb) ->
                cb.equal(root.get("estado"), "inactivo"));

        return productoRepository.findAll(spec, pageable);
    }

    public List<Producto> buscarPorNombre(String query) {
        // Divide la query en palabras clave
        String[] keywords = query.split("\\s+");

        // Obtén todos los productos que coincidan con al menos una palabra clave
        List<Producto> productos = productoRepository.findAll(); // Obtén todos los productos

        // Filtra los productos que contienen todas las palabras clave y están activos
        return productos.stream()
                .filter(producto -> {
                    String nombreProducto = producto.getNombre().toLowerCase();
                    return Arrays.stream(keywords)
                            .allMatch(keyword -> nombreProducto.contains(keyword.toLowerCase()));
                })
                .filter(producto -> !producto.getEstado().equalsIgnoreCase("inactivo"))
                .collect(Collectors.toList());
    }

    // Método para actualizar inventario al comprar productos
    public Producto actualizarInventario(Long idProducto, int cantidadComprada) throws Exception {
        // Buscar el producto
        Optional<Producto> productoOptional = productoRepository.findById(idProducto);
        if (!productoOptional.isPresent()) {
            throw new Exception("Producto no encontrado");
        }

        Producto producto = productoOptional.get();

        // Verificar si hay suficiente cantidad
        if (producto.getCantidad() < cantidadComprada) {
            throw new Exception("No hay suficiente stock del producto " + producto.getNombre() +
                    " La cantidad del producto es de: " + producto.getCantidad());
        }

        // Actualizar la cantidad del inventario
        producto.setCantidad(producto.getCantidad() - cantidadComprada);

        // Si la cantidad llega a 0, eliminar el producto
        if (producto.getCantidad() == 0) {
            producto.setEstado("inactivo");
        }
        if(producto.getCantidad()>0){
            producto.setEstado("activo");
        }
            // Si no llega a 0, guardar los cambios
        productoRepository.save(producto);


        return producto;
    }

    public Page<Producto> findInactivos(Pageable pageable) {
        return productoRepository.findByEstado("inactivo", pageable);
    }

    // Genera un código nuevo, utilizando un nombre opcional (por defecto "PRD")
    public String generarCodigoNuevo(String nombreOpcional) {
        // Generar un prefijo de 3 letras aleatorias
        String letrasAleatorias = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder prefijoBuilder = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            int index = (int) (Math.random() * letrasAleatorias.length());
            prefijoBuilder.append(letrasAleatorias.charAt(index));
        }
        String prefijo = prefijoBuilder.toString();

        // Fecha en formato 'yyyyMMdd'
        String fecha = java.time.LocalDate.now().toString().replaceAll("-", "");

        // Generación de valor aleatorio
        String aleatorio;
        if (Math.random() < 0.5) {
            aleatorio = String.format("%06d", (int) (Math.random() * 1000000));
        } else {
            aleatorio = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        return prefijo + aleatorio + fecha;
    }

    // Genera un código y lo asigna al producto existente
    public Producto generarCodigoActualizado(Long idProducto) {
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con el ID: " + idProducto));

        String nuevoCodigo = generarCodigoNuevo(producto.getNombre());
        producto.setSku(nuevoCodigo);

        return productoRepository.save(producto);
    }

    // Genera un código sin producto asociado
    public String generarCodigoNuevo() {
        return generarCodigoNuevo(null);  // Usa el valor por defecto "PRD"
    }

    public Producto buscarPorSkuOCodigo(String codigo) {
        if (codigo == null || codigo.trim().isEmpty()) {
            throw new IllegalArgumentException("El código no puede estar vacío");
        }

        Producto producto = productoRepository.findBySkuOrCodigoBarra(codigo);
        if (producto == null) {
            throw new RuntimeException("No se encontró producto con el código: " + codigo);
        }

        return producto;
    }

}