package com.tfg.sportshop.services;
import java.util.List;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.model.ProductoTalla;
import org.springframework.beans.factory.annotation.Autowired;
import com.tfg.sportshop.repository.ProductoTallaRepository;
@Service
public class ProductoTallaService {
    @Autowired
    private ProductoTallaRepository productoTallaRepository;
    public List<ProductoTalla> buscarTallasPorProducto(Integer idProducto) {
        return productoTallaRepository.findByProductoIdProducto(idProducto);
    }
    public List<ProductoTalla> buscarProductosPorTalla(Integer idTalla) {
        return productoTallaRepository.findByTallaIdTalla(idTalla);
    }
    public ProductoTalla buscarStockPorProductoYTalla(Integer idProducto, Integer idTalla) {
        return productoTallaRepository.findByProductoIdProductoAndTallaIdTalla(idProducto, idTalla);
    }
}