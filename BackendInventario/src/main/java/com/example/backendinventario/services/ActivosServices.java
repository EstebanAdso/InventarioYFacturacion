package com.example.backendinventario.services;

import com.example.backendinventario.entities.Activos;
import com.example.backendinventario.repositories.ActivosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActivosServices {
    @Autowired
    private ActivosRepository activosRepository;

    public List<Activos> getAllActivos() {
        return activosRepository.findAll();
    }

    public Optional<Activos> getActivosById(long id) {
        return activosRepository.findById(id);
    }

    public Activos save(Activos activos) {
        return activosRepository.save(activos);
    }

    public void deleteById(Long id) {
        activosRepository.deleteById(id);
    }
}
