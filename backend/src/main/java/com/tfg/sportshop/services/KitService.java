package com.tfg.sportshop.services;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.math.BigDecimal;
import com.tfg.sportshop.model.Kit;
import com.tfg.sportshop.model.Producto;
import com.tfg.sportshop.model.Categoria;
import com.tfg.sportshop.model.KitProducto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.repository.KitRepository;
import com.tfg.sportshop.dto.admin.AdminKitRequest;
import com.tfg.sportshop.repository.KitProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KitService {
    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private KitProductoRepository kitProductoRepository;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private ProductoService productoService;

    public List<Kit> obtenerTodosLosKits() {
        return kitRepository.findAllActivos().stream().map(this::aplicarStockCalculado).toList();   
    }

    public List<Kit> obtenerKitsPorCategoria(Integer categoriaId) {
        return kitRepository.findActivosByCategoria(categoriaId).stream().map(this::aplicarStockCalculado).toList();
    }

    public List<Kit> buscarKitsPorNombre(String nombre) {
        return kitRepository.searchByNombre(nombre).stream().map(this::aplicarStockCalculado).toList();
    }

    public Kit obtenerKitPorId(Integer id) {
        Kit kit = kitRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kit no encontrado"));      
        return aplicarStockCalculado(kit);
    }

    @Transactional
    public Kit crearKit(AdminKitRequest request) {
        validarRequest(request);
        Categoria categoria = categoriaService.buscarCategoriaPorId(request.categoriaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria no encontrada"));
        Kit kit = new Kit();
        kit.setNombre(request.nombre());
        kit.setDescripcion(request.descripcion());
        kit.setPrecio(calcularPrecioDesdeRequest(request.productos()));
        kit.setCategoria(categoria);
        kit.setImagen(request.imagen());
        kit.setActivo(true); kit.setStock(request.stock());
        Kit kitGuardado = kitRepository.save(kit);
        List<KitProducto> productosKit = guardarProductosDelKit(kitGuardado, request.productos());
        kitGuardado.setProductos(productosKit);
        kitGuardado.setStock(calcularStockProductosKit(productosKit));
        return kitRepository.save(kitGuardado);
    }

    @Transactional
    public Kit actualizarKit(Integer id, AdminKitRequest request) {
        Kit kit = obtenerKitPorId(id);
        validarRequest(request);
        Categoria categoria = categoriaService.buscarCategoriaPorId(request.categoriaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria no encontrada"));
        kit.setNombre(request.nombre());
        kit.setDescripcion(request.descripcion());
        kit.setCategoria(categoria);
        kit.setImagen(request.imagen());

        // Eliminar productos existentes
        List<KitProducto> productosExistentes = kitProductoRepository.findByKitId(id);
        kitProductoRepository.deleteAll(productosExistentes);
        List<KitProducto> productosKit = guardarProductosDelKit(kit, request.productos());
        kit.setPrecio(calcularPrecioProductosKit(productosKit));
        kit.setStock(calcularStockProductosKit(productosKit));
        return kitRepository.save(kit);
    }

    @Transactional
    public void eliminarKit(Integer id) {
        Kit kit = obtenerKitPorId(id);
        kit.setActivo(false);
        kitRepository.save(kit);
    }

    @Transactional
    public void eliminarKitPermanentemente(Integer id) {
        Kit kit = obtenerKitPorId(id);
        List<KitProducto> productos = kitProductoRepository.findByKitId(id);
        kitProductoRepository.deleteAll(productos);
        kitRepository.delete(kit);
    }

    private void validarRequest(AdminKitRequest request) {
        if(request.productos() == null || request.productos().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El kit debe contener al menos un producto");
        }
    }

    private List<KitProducto> guardarProductosDelKit(Kit kit, List<AdminKitRequest.KitProductoRequest> productos) {
        List<KitProducto> productosKit = new ArrayList<>();
        for(AdminKitRequest.KitProductoRequest kp : productos) {
            Producto producto = productoService.buscarProductoPorId(kp.productoId().longValue());
            KitProducto kitProducto = new KitProducto();
            kitProducto.setKit(kit);
            kitProducto.setProducto(producto);
            kitProducto.setCantidad(kp.cantidad());
            productosKit.add(kitProductoRepository.save(kitProducto));
        }
        return productosKit;
    }

    private BigDecimal calcularPrecioDesdeRequest(List<AdminKitRequest.KitProductoRequest> productos) {
        return productos.stream()
            .map(kp -> {
                Producto producto = productoService.buscarProductoPorId(kp.productoId().longValue());
                return producto.getPrecio().multiply(BigDecimal.valueOf(kp.cantidad()));
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularPrecioProductosKit(List<KitProducto> productosKit) {
        return productosKit.stream().map(kp -> kp.getProducto().getPrecio().multiply(BigDecimal.valueOf(kp.getCantidad())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int calcularStockProductosKit(List<KitProducto> productosKit) {
        if(productosKit == null || productosKit.isEmpty()) {
            return 0;
        }

        return productosKit.stream()
            .mapToInt(kp -> {
                int stockProducto = Optional.ofNullable(kp.getProducto().getStock()).orElse(0);
                int cantidadEnKit = Optional.ofNullable(kp.getCantidad()).orElse(0);
                if(cantidadEnKit <= 0) {
                    return 0;
                }
                return stockProducto / cantidadEnKit;
            })
            .min()
            .orElse(0);
    }

    private Kit aplicarStockCalculado(Kit kit) {
        List<KitProducto> productosKit = kitProductoRepository.findByKitId(kit.getIdKit());
        kit.setStock(calcularStockProductosKit(productosKit));
        return kit;
    }
}