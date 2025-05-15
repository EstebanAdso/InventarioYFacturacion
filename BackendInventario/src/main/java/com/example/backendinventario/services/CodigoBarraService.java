package com.example.backendinventario.services;

import com.example.backendinventario.entities.CodigoBarra;
import com.example.backendinventario.entities.CodigoBarraDTO;
import com.example.backendinventario.entities.Producto;
import com.example.backendinventario.repositories.CodigoRepository;
import com.example.backendinventario.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CodigoBarraService {
    @Autowired
    private CodigoRepository codigoRepository;
    @Autowired
    private ProductoRepository productoRepository;

    public CodigoBarra guardarCodigoBarra(CodigoBarraDTO dto) throws Exception{
        Optional<Producto> productoOpt = productoRepository.findById(dto.getProductoId());
        if(productoOpt.isEmpty()){
            throw new Exception("Producto no encontrado" + dto.getProductoId());
        }

        Producto producto = productoOpt.get();

        CodigoBarra codigoBarra = new CodigoBarra();
        codigoBarra.setCodigoBarra(dto.getCodigoBarra());
        codigoBarra.setProducto(producto);

        return codigoRepository.save(codigoBarra);
    }

    public List<CodigoBarra> obtenerPorProductoId(Long productoId) {
        return codigoRepository.findByProductoId(productoId);
    }

    public void deleteById(Long id) {
        codigoRepository.deleteById(id);
    }
}
