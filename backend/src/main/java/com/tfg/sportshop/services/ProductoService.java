package com.tfg.sportshop.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import com.tfg.sportshop.dto.admin.AdminProductoRequest;
import com.tfg.sportshop.model.Categoria;
import com.tfg.sportshop.model.Producto;
import com.tfg.sportshop.model.ProductoTalla;
import com.tfg.sportshop.model.ProductoTallaId;
import com.tfg.sportshop.model.Talla;
import com.tfg.sportshop.repository.ProductoRepository;
import com.tfg.sportshop.repository.ProductoTallaRepository;
import com.tfg.sportshop.repository.TallaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductoService {
    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private TallaRepository tallaRepository;

    @Autowired
    private ProductoTallaRepository productoTallaRepository;

    public List<Producto> verProductos() {
        return productoRepository.findAll();
    }

    public List<Producto> verProductosPorCategoria(Integer idCategoria) {
        return productoRepository.findByCategoriaIdCategoria(idCategoria);
    }

    public List<Producto> buscarProductosPorTipo(String tipoPrenda) {
        return productoRepository.findProductosByTipoPrenda(tipoPrenda);
    }

    public Producto buscarProductoPorId(Long id) {
        Optional<Producto> producto = productoRepository.findById(id.intValue());
        return producto.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    @Transactional
    public Producto crearProducto(String nombre, String tipoPrenda, String color, BigDecimal precio, Integer stock, Integer categoriaId) {
        return crearProductoConTallas(new AdminProductoRequest(nombre, tipoPrenda, color, precio, stock, categoriaId, null, null, null, null, null, null, 0));
    }

    @Transactional
    public Producto crearProductoConTallas(AdminProductoRequest request) {
        Categoria categoria = categoriaService.buscarCategoriaPorId(request.categoriaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria no encontrada"));
        
        Producto producto = new Producto();
        producto.setNombre(request.nombre());
        producto.setTipoPrenda(request.tipoPrenda());
        producto.setColor(request.color());
        producto.setPrecio(request.precio());
        producto.setCategoria(categoria);
        producto.setDescripcion(request.descripcion());
        producto.setComposicion(request.composicion());
        producto.setNormativa(request.normativa());
        producto.setInstruccionesLavado(request.instruccionesLavado());
        producto.setConsejos(request.consejos());

        int totalStock = 0;
        if (request.tallas() != null && !request.tallas().isEmpty()) {
            totalStock = request.tallas().stream().mapToInt(AdminProductoRequest.TallaStockRequest::stock).sum();
        } else {
            totalStock = request.stock();
        }
        producto.setStock(totalStock);
        producto.setStockMinimo(request.stockMinimo() != null ? request.stockMinimo() : 0);
        producto.setLoteCompra(1);
        producto.setPlazoReposicionDias(7);

        Producto guardado = productoRepository.save(producto);
        
        if (request.tallas() != null && !request.tallas().isEmpty()) {
            for (AdminProductoRequest.TallaStockRequest ts : request.tallas()) {
                Talla talla = tallaRepository.findByNombre(ts.talla())
                    .orElseGet(() -> {
                        Talla nueva = new Talla();
                        nueva.setNombre(ts.talla());
                        return tallaRepository.save(nueva);
                    });
                
                ProductoTalla pt = new ProductoTalla();
                pt.setId(new ProductoTallaId(guardado.getIdProducto(), talla.getIdTalla()));
                pt.setProducto(guardado);
                pt.setTalla(talla);
                pt.setStock(ts.stock());
                productoTallaRepository.save(pt);
            }
        }
        
        return guardado;
    }

    @Transactional
    public Producto actualizarProducto(Long id, AdminProductoRequest request) {
        Producto producto = buscarProductoPorId(id);
        Categoria categoria = categoriaService.buscarCategoriaPorId(request.categoriaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria no encontrada"));
        
        producto.setNombre(request.nombre());
        producto.setTipoPrenda(request.tipoPrenda());
        producto.setColor(request.color());
        producto.setPrecio(request.precio());
        producto.setCategoria(categoria);
        producto.setDescripcion(request.descripcion());
        producto.setComposicion(request.composicion());
        producto.setNormativa(request.normativa());
        producto.setInstruccionesLavado(request.instruccionesLavado());
        producto.setConsejos(request.consejos());
        producto.setStockMinimo(request.stockMinimo() != null ? request.stockMinimo() : 0);
        if (producto.getLoteCompra() == null) {
            producto.setLoteCompra(1);
        }
        if (producto.getPlazoReposicionDias() == null) {
            producto.setPlazoReposicionDias(7);
        }

        if (request.tallas() != null && !request.tallas().isEmpty()) {
            // Eliminar tallas antiguas
            productoTallaRepository.deleteByProductoIdProducto(producto.getIdProducto());
            
            int totalStock = 0;
            for (AdminProductoRequest.TallaStockRequest ts : request.tallas()) {
                Talla talla = tallaRepository.findByNombre(ts.talla())
                    .orElseGet(() -> {
                        Talla nueva = new Talla();
                        nueva.setNombre(ts.talla());
                        return tallaRepository.save(nueva);
                    });
                
                ProductoTalla pt = new ProductoTalla();
                pt.setId(new ProductoTallaId(producto.getIdProducto(), talla.getIdTalla()));
                pt.setProducto(producto);
                pt.setTalla(talla);
                pt.setStock(ts.stock());
                productoTallaRepository.save(pt);
                totalStock += ts.stock();
            }
            producto.setStock(totalStock);
        } else {
            producto.setStock(request.stock());
        }
        
        return productoRepository.save(producto);
    }

    @Transactional
    public void eliminarProducto(Long id) {
        Producto producto = buscarProductoPorId(id);
        productoRepository.delete(producto);
    }
}
