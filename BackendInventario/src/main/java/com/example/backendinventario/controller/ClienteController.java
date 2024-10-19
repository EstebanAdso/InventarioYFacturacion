package com.example.backendinventario.controller;

import com.example.backendinventario.entities.Cliente;
import com.example.backendinventario.repositories.ClienteRepository;
import com.example.backendinventario.services.ClienteServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("cliente")
public class ClienteController {
    @Autowired
    private ClienteServices clienteServices;

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> listar() {
        return clienteServices.findAll();
    }


    @GetMapping("{id}")
    public Optional<Cliente> buscar(@PathVariable Long id) {
        return clienteServices.findById(id);
    }

    // Buscar un cliente por identificación
    @GetMapping("/buscar-por-identificacion")
    public ResponseEntity<?> buscarPorIdentificacion(@RequestParam String identificacion) {
        Optional<Cliente> existingCliente = clienteRepository.findByIdentificacion(identificacion);
        if (existingCliente.isPresent()) {
            return ResponseEntity.ok(existingCliente.get()); // Cliente encontrado
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente no encontrado.");
        }
    }

    @DeleteMapping("{id}")
    public void eliminar(@PathVariable Long id) {
        clienteServices.delete(id);
    }

    @PostMapping
    public ResponseEntity<?> saveCliente(@RequestBody Cliente cliente) {
        Optional<Cliente> existingCliente = clienteRepository.findByIdentificacion(cliente.getIdentificacion());
        if (existingCliente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("El cliente ya existe.");
        }
        Cliente savedCliente = clienteRepository.save(cliente);
        return ResponseEntity.ok(savedCliente);
    }

    @PutMapping("{identificacion}")
    public ResponseEntity<?> updateClienteByIdentificacion(@PathVariable String identificacion, @RequestBody Cliente cliente) {
        Optional<Cliente> existingCliente = clienteRepository.findByIdentificacion(identificacion);
        if (existingCliente.isPresent()) {
            Cliente updatedCliente = existingCliente.get();
            updatedCliente.setNombre(cliente.getNombre());
            // Actualiza otros campos según sea necesario

            Cliente savedCliente = clienteRepository.save(updatedCliente);
            return ResponseEntity.ok(savedCliente);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente no encontrado.");
        }
    }

    @GetMapping("/suggestions")
    public List<Cliente> getSuggestions(@RequestParam String query) {
        return clienteRepository.findAll()
                .stream()
                .filter(cliente -> cliente.getNombre().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }

}
