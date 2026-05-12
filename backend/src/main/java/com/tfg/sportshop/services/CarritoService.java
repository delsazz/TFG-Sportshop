package com.tfg.sportshop.services;

import com.tfg.sportshop.dto.carrito.CarritoItemRequest;
import com.tfg.sportshop.dto.carrito.CarritoItemResponse;
import com.tfg.sportshop.dto.carrito.CarritoResponse;
import com.tfg.sportshop.model.CarritoItem;
import com.tfg.sportshop.model.ProductoImagen;
import com.tfg.sportshop.model.Producto;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.repository.CarritoItemRepository;
import com.tfg.sportshop.repository.ProductoImagenRepository;
import com.tfg.sportshop.repository.ProductoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CarritoService {
    private final CarritoItemRepository carritoItemRepository;
    private final ProductoRepository productoRepository;
    private final ProductoImagenRepository productoImagenRepository;
    private final ProductoTallaService productoTallaService;

    public CarritoService(
            CarritoItemRepository carritoItemRepository,
            ProductoRepository productoRepository,
            ProductoImagenRepository productoImagenRepository,
            ProductoTallaService productoTallaService
    ) {
        this.carritoItemRepository = carritoItemRepository;
        this.productoRepository = productoRepository;
        this.productoImagenRepository = productoImagenRepository;
        this.productoTallaService = productoTallaService;
    }

    public CarritoResponse obtenerCarrito(Usuario usuario) {
        List<CarritoItem> items = carritoItemRepository.findByUsuarioIdUsuarioOrderByIdCarritoItemAsc(
                usuario.getIdUsuario()
        );

        List<CarritoItemResponse> responseItems = items.stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal total = responseItems.stream()
                .map(item -> item.precioUnitario().multiply(BigDecimal.valueOf(item.cantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CarritoResponse(responseItems, total, "eur");
    }

    @Transactional
    public CarritoResponse guardarCarrito(Usuario usuario, List<CarritoItemRequest> requestItems) {
        List<CarritoItemRequest> normalizedItems = requestItems == null
                ? List.of()
                : requestItems.stream()
                .filter(item -> item != null && item.productoId() != null && item.cantidad() != null && item.cantidad() > 0)
                .toList();

        carritoItemRepository.deleteByUsuarioIdUsuario(usuario.getIdUsuario());

        if (normalizedItems.isEmpty()) {
            return new CarritoResponse(List.of(), BigDecimal.ZERO, "eur");
        }

        Map<Integer, Producto> productos = productoRepository.findAllById(
                normalizedItems.stream().map(CarritoItemRequest::productoId).distinct().toList()
        ).stream().collect(Collectors.toMap(Producto::getIdProducto, Function.identity()));

        List<CarritoItem> carritoItems = normalizedItems.stream()
                .map(item -> buildCarritoItem(usuario, item, productos))
                .toList();

        carritoItemRepository.saveAll(carritoItems);
        return obtenerCarrito(usuario);
    }

    @Transactional
    public void limpiarCarrito(Usuario usuario) {
        carritoItemRepository.deleteByUsuarioIdUsuario(usuario.getIdUsuario());
    }

    private CarritoItem buildCarritoItem(
            Usuario usuario,
            CarritoItemRequest item,
            Map<Integer, Producto> productos
    ) {
        Producto producto = productos.get(item.productoId());
        if (producto == null) {
            throw new ResponseStatusException(NOT_FOUND, "Producto no encontrado: " + item.productoId());
        }

        if (item.talla() == null || item.talla().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "La talla es obligatoria");
        }

        BigDecimal precioUnitario = item.precioUnitario() != null ? item.precioUnitario() : producto.getPrecio();

        CarritoItem carritoItem = new CarritoItem();
        carritoItem.setUsuario(usuario);
        carritoItem.setProducto(producto);
        carritoItem.setTalla(item.talla().trim());
        carritoItem.setCantidad(item.cantidad());
        carritoItem.setPrecioUnitario(precioUnitario);
        return carritoItem;
    }

    private CarritoItemResponse toItemResponse(CarritoItem item) {
        List<String> tallasDisponibles = productoTallaService.buscarTallasPorProducto(item.getProducto().getIdProducto())
                .stream()
                .map(productoTalla -> productoTalla.getTalla().getNombre())
                .toList();

        return new CarritoItemResponse(
                item.getProducto().getIdProducto(),
                item.getProducto().getNombre(),
                item.getTalla(),
                tallasDisponibles.isEmpty() ? Collections.singletonList(item.getTalla()) : tallasDisponibles,
                item.getCantidad(),
                item.getPrecioUnitario(),
                resolveProductImage(item.getProducto())
        );
    }

    private String resolveProductImage(Producto producto) {
        if (producto.getImagen() != null && !producto.getImagen().isBlank()) {
            return producto.getImagen();
        }

        ProductoImagen principal = productoImagenRepository.findByProductoIdProductoAndEsPrincipal(
                producto.getIdProducto(),
                true
        );
        if (principal != null) {
            return principal.getUrlImagen();
        }

        return productoImagenRepository.findByProductoIdProductoOrderByOrden(producto.getIdProducto())
                .stream()
                .findFirst()
                .map(ProductoImagen::getUrlImagen)
                .orElse(null);
    }
}
