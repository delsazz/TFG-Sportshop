package com.tfg.sportshop.services;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import com.tfg.sportshop.model.Talla;
import com.tfg.sportshop.model.Producto;
import com.tfg.sportshop.model.Categoria;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.model.ProductoTalla;
import com.tfg.sportshop.model.ProductoImagen;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.model.ProductoTallaId;
import com.tfg.sportshop.repository.TallaRepository;
import com.tfg.sportshop.repository.ProductoRepository;
import com.tfg.sportshop.dto.admin.AdminProductoRequest;
import com.tfg.sportshop.repository.ProductoTallaRepository;
import com.tfg.sportshop.repository.CarritoItemRepository;
import com.tfg.sportshop.repository.DetallePedidoRepository;
import com.tfg.sportshop.repository.PedidoEntregaLineaRepository;
import com.tfg.sportshop.repository.DevolucionItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import com.tfg.sportshop.services.BackorderPedidoService;

@Service
public class ProductoService {
    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaService categoriaService;
    @Autowired
    private BackorderPedidoService backorderPedidoService;

    @Autowired
    private TallaRepository tallaRepository;

    @Autowired
    private ProductoTallaRepository productoTallaRepository;

    @Autowired
    private ProductoImagenService productoImagenService;

    @Autowired
    private CarritoItemRepository carritoItemRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private PedidoEntregaLineaRepository pedidoEntregaLineaRepository;

    @Autowired
    private DevolucionItemRepository devolucionItemRepository;

    public boolean productoTienePedidos(Integer idProducto) {
        return detallePedidoRepository.existsByProductoIdProducto(idProducto);
    }

    public List<Producto> verProductos() {
        return productoRepository.findAll();
    }

    public List<Producto> verProductosPorCategoria(Integer idCategoria) {
        return productoRepository.findByCategoriaIdCategoria(idCategoria);
    }

    public Producto buscarProductoPorId(Long id) {
        Optional<Producto> producto = productoRepository.findById(id.intValue());
        return producto.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    @Transactional
    public Producto crearProducto(String nombre, String tipoPrenda, String color, BigDecimal precio, Integer stock, Integer categoriaId) {
        return crearProductoConTallas(new AdminProductoRequest(nombre, tipoPrenda, color, precio, stock, categoriaId, null, null, 0));
    }

    @Transactional
    public Producto crearProductoConTallas(AdminProductoRequest request) {
        Categoria categoria = categoriaService.buscarCategoriaPorId(request.categoriaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria no encontrada"));
        Producto producto = new Producto();
        producto.setNombre(request.nombre());
        producto.setPrecio(request.precio());
        producto.setCategoria(categoria);
        producto.setDescripcion(request.descripcion());
        // Usar siempre el stock explícito del request como stock total del producto
        int totalStock = request.stock() != null ? request.stock() : 0;
        producto.setStock(totalStock);
        producto.setStockMinimo(request.stockMinimo() != null ? request.stockMinimo() : 0);
        producto.setLoteCompra(1);
        producto.setPlazoReposicionDias(7);
        Producto guardado = productoRepository.save(producto);
        if(request.tallas() != null && !request.tallas().isEmpty()) {
            for(AdminProductoRequest.TallaStockRequest ts : request.tallas()) {
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
        producto.setPrecio(request.precio());
        producto.setCategoria(categoria);
        producto.setDescripcion(request.descripcion());
        producto.setStockMinimo(request.stockMinimo() != null ? request.stockMinimo() : 0);
        if(producto.getLoteCompra() == null) {
            producto.setLoteCompra(1);
        }
        if(producto.getPlazoReposicionDias() == null) {
            producto.setPlazoReposicionDias(7);
        }
        // Usar siempre el stock explícito del request como stock total del producto
        producto.setStock(request.stock() != null ? request.stock() : 0);
        if(request.tallas() != null && !request.tallas().isEmpty()) {
            // Eliminar tallas antiguas y guardar las nuevas
            productoTallaRepository.deleteByProductoIdProducto(producto.getIdProducto());
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
            }
        }
        return productoRepository.save(producto);
    }

    @Transactional
    public void eliminarProducto(Long id) {
        Producto producto = buscarProductoPorId(id);
        
        // El administrador puede eliminar el producto incluso si tiene pedidos.
        // Se borrarán en cascada los detalles asociados.
        
        // Eliminar del carrito
        carritoItemRepository.deleteByProductoIdProducto(producto.getIdProducto());
        
        productoTallaRepository.deleteByProductoIdProducto(producto.getIdProducto());
        
        List<ProductoImagen> imagenes = productoImagenService.obtenerImagenesProducto(id);
        for (ProductoImagen img : imagenes) {
            productoImagenService.eliminarImagen(img.getIdImagen());
        }
        
        // Eliminar detalle records asociados al producto
        devolucionItemRepository.deleteByProductoId(producto.getIdProducto());
        pedidoEntregaLineaRepository.deleteByProductoId(producto.getIdProducto());
        detallePedidoRepository.deleteByProductoIdProducto(producto.getIdProducto());
        backorderPedidoService.eliminarPorProducto(producto.getIdProducto());

        // Eliminar el producto después de limpiar relaciones
        productoRepository.delete(producto);
    }
}
