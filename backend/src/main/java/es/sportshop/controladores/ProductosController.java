package es.sportshop.controladores;

import java.util.List;
import java.util.ArrayList;
import es.sportshop.model.Foto;
import es.sportshop.model.Producto;
import es.sportshop.model.Categoria;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import es.sportshop.servicios.ServicioProductos;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProductosController {

    private final ServicioProductos servicioProductos;

    public ProductosController(ServicioProductos servicioProductos) {
        this.servicioProductos = servicioProductos;
    }

    @GetMapping("/productos")
    public List<ProductoDto> productos() {
        return servicioProductos.verProductos().stream()
                .map(this::convertirProducto)
                .toList();
    }

    @GetMapping("/productos/{idProducto}")
    public ResponseEntity<ProductoDto> producto(@PathVariable int idProducto) {
        Producto producto = servicioProductos.buscarProductoPorId(idProducto);
        if(producto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertirProducto(producto));
    }

    @GetMapping("/sesion")
    public SesionDto sesion(Authentication aut, HttpSession session) {
        return new SesionDto(aut != null, aut != null ? aut.getName() : null, obtenerCarrito(session).size());
    }

    @GetMapping("/carrito/anadir")
    public ResponseEntity<CarritoDto> anadirCarrito(@RequestParam("id") int idProducto, Authentication aut, HttpSession session) {
        if(aut == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Producto> carrito = obtenerCarrito(session);
        Producto producto = servicioProductos.buscarProductoPorId(idProducto);
        if(producto == null) {
            return ResponseEntity.notFound().build();
        }
        if(contarProductoEnCarrito(carrito, idProducto) >= producto.getStock()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new CarritoDto(carrito.size(), "No hay mas stock disponible para este producto"));
        }

        carrito.add(producto);
        session.setAttribute("carrito", carrito);
        return ResponseEntity.ok(new CarritoDto(carrito.size(), "Producto anadido al carrito"));
    }

    private ProductoDto convertirProducto(Producto producto) {
        Categoria categoria = producto.getCategoria();
        Foto foto = producto.getFoto();
        return new ProductoDto(
                producto.getIdProducto(),
                producto.getNombre(),
                producto.getPrecio(),
                producto.getStock(),
                producto.getDescripcion(),
                producto.getTallas(),
                categoria != null ? new CategoriaDto(categoria.getIdCategoria(), categoria.getCategoria(), categoria.getNombreFoto()) : null,
                foto != null ? new FotoDto(foto.getIdFoto(), foto.getNombreFoto()) : null
        );
    }

    private List<Producto> obtenerCarrito(HttpSession session) {
        List<Producto> carrito = (List<Producto>) session.getAttribute("carrito");
        if(carrito == null) {
            carrito = new ArrayList<>();
            session.setAttribute("carrito", carrito);
        }
        return carrito;
    }

    private int contarProductoEnCarrito(List<Producto> carrito, int idProducto) {
        int unidades = 0;
        for(Producto producto : carrito) {
            if(producto.getIdProducto() == idProducto) {
                unidades++;
            }
        }
        return unidades;
    }

    public record ProductoDto(int idProducto, String nombre, int precio, int stock, String descripcion, String tallas, CategoriaDto categoria, FotoDto foto) {
    }

    public record CategoriaDto(int idCategoria, String categoria, String nombreFoto) {
    }

    public record FotoDto(int idFoto, String nombreFoto) {
    }

    public record SesionDto(boolean autenticado, String usuario, int productosCarrito) {
    }

    public record CarritoDto(int productosCarrito, String mensaje) {
    }
}
