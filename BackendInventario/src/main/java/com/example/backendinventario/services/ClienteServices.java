package com.example.backendinventario.services;

import com.example.backendinventario.entities.Cliente;
import com.example.backendinventario.repositories.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteServices {
    @Autowired
    private ClienteRepository clienteRepository;

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



}
