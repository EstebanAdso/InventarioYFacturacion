package com.example.backendinventario.services;

import com.example.backendinventario.entities.Cliente;
import com.example.backendinventario.entities.ClienteTopDto;
import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.repositories.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClienteServices {
    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<ClienteTopDto> obtenerClientesTop() {
        String sql = "SELECT c.id AS cliente_id, c.nombre AS cliente_nombre, c.identificacion, c.telefono, c.direccion, c.correo, SUM(f.total) AS total_compras " +
                "FROM Cliente c " +
                "JOIN Factura f ON c.id = f.cliente_id " +
                "GROUP BY c.id, c.nombre " +
                "ORDER BY total_compras DESC " +
                "LIMIT 30";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            ClienteTopDto cliente = new ClienteTopDto();
            cliente.setClienteId(rs.getLong("cliente_id"));
            cliente.setClienteNombre(rs.getString("cliente_nombre"));
            cliente.setTotalCompras(rs.getDouble("total_compras")); // Asignar total_compras
            return cliente;
        });

    }

    public List<Cliente> findAll() {
        return clienteRepository.findAll();
    }
    public Optional<Cliente> findById(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente save(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public void delete(Long id) {
        clienteRepository.deleteById(id);
    }

    public Optional<Cliente> findByIdentificacion(String identificacion) {
        return clienteRepository.findByIdentificacion(identificacion);
    }

    public List<Cliente> buscarPorNombre(String nombre) {
        // Obtén todos los productos que contienen el nombre especificado
        List<Cliente> clientes = clienteRepository.findByNombreContainingIgnoreCase(nombre);
        return clientes;
    }

}
