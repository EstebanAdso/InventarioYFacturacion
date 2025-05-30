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
                if (producto.getId() == null || !productoConMismoSku.getId().equals(producto.getId())) {
                    producto.setSku(generarCodigoNuevo());
                }
            }
        } else {
            String nuevoCodigo;
            do {
                nuevoCodigo = generarCodigoNuevo();
            } while (productoRepository.existsBySku(nuevoCodigo));
            producto.setSku(nuevoCodigo);
        }

        // ✅ Validar que los códigos de barra no estén usados por otro producto
        if (producto.getCodigosDeBarra() != null) {
            for (CodigoBarra cb : producto.getCodigosDeBarra()) {
                Producto existente = productoRepository.findByCodigoBarra(cb.getCodigoBarra());
                if (existente != null && (producto.getId() == null || !existente.getId().equals(producto.getId()))) {
                    throw new RuntimeException("El código de barras '" + cb.getCodigoBarra() + "' ya está asignado a otro producto.");
                }
            }
            // Enlazar códigos de barra
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
        String letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String numeros = "0123456789";

        StringBuilder codigo = new StringBuilder();

        // 1. Agregar 3 letras aleatorias
        for (int i = 0; i < 3; i++) {
            int index = (int) (Math.random() * letras.length());
            codigo.append(letras.charAt(index));
        }

        // 2. Agregar 3 números aleatorios
        for (int i = 0; i < 3; i++) {
            int index = (int) (Math.random() * numeros.length());
            codigo.append(numeros.charAt(index));
        }

        // 3. Agregar 2 letras aleatorias finales
        for (int i = 0; i < 2; i++) {
            int index = (int) (Math.random() * letras.length());
            codigo.append(letras.charAt(index));
        }

        return codigo.toString(); // Total: 3 + 3 + 2 = 8 caracteres
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