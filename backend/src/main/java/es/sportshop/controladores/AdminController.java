package es.sportshop.controladores;
import es.sportshop.model.Pedido;
import es.sportshop.model.Producto;
import es.sportshop.model.Usuario;
import es.sportshop.servicios.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import java.util.List;
import java.util.Optional;

// Anotación de Spring para indicar que es un controlador
@Controller
public class AdminController {

    // Atrubutos para la clase AdminController
    private final ServicioProductos servicioProductos;
    private final ServicioPedidos servicioPedidos;
    private final ServicioDetalle servicioDetalle;
    private final ServicioFotos servicioFotos;
    private final ServicioUsuarios servicioUsuarios;

    // Constructor con parámetros para la clase AdminController
    public AdminController(ServicioProductos servicioProductos, ServicioPedidos servicioPedidos, ServicioDetalle servicioDetalle, ServicioFotos servicioFotos, ServicioUsuarios servicioUsuarios) {
        this.servicioProductos = servicioProductos;
        this.servicioPedidos = servicioPedidos;
        this.servicioDetalle = servicioDetalle;
        this.servicioFotos = servicioFotos;
        this.servicioUsuarios = servicioUsuarios;
    }

    // Anotación de Spring para mostrar la página principal del administrador
    @GetMapping("/zonaAdmin")

    // Función para mostrar la página principal del administrador
    public ModelAndView zonaAdmin(Authentication aut) {
        ModelAndView mv = new ModelAndView("admin/zona_admin");

        // Mostrar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para mostrar la página para ver los productos
    @GetMapping("zonaAdmin/productos")

    // Función para mostrar la página de los productos
    public ModelAndView productos(Authentication aut) {
        ModelAndView mv = new ModelAndView("admin/productos");

        // Mostrar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Mostrar los productos
        List<Producto> productos = servicioProductos.verProductos();
        mv.addObject("listaProductos", productos);

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para mostrar la página para añadir productos
    @PostMapping("zonaAdmin/anadirProducto")

    // Función para mostrar la página para añadir productos
    public ModelAndView anadirProducto(Authentication aut, @RequestParam String nombre, @RequestParam String descripcion, @RequestParam int precio, @RequestParam int stock) {

        // Comprobar que el producto no exista
        if(servicioProductos.buscarProductoPorNombre(nombre) == null) {

            // Si no existe ningún producto con ese nombre crear y guardar un nuevo producto
            Producto producto = new Producto();
            producto.setNombre(nombre);
            producto.setDescripcion(descripcion);
            producto.setPrecio(precio);
            producto.setStock(stock);
            servicioProductos.guardarProducto(producto);
            System.out.println("Se ha añadido el producto");
        }
        ModelAndView mv = new ModelAndView("redirect:admin/zonaAdmin/productos");

        // Comprobar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para mostrar la página para ver los pedidos
    @GetMapping("/zonaAdmin/pedidos")

    // Función para mostrar la página de los pedidos
    public ModelAndView pedidos(Authentication aut) {
        ModelAndView mv = new ModelAndView("admin/pedidos");

        // Mostrar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Mostrar todos los pedidos
        List<Pedido> pedidos = servicioPedidos.verPedidos();
        mv.addObject("listaPedidos", pedidos);

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para mostrar la página para ver los pedidos de un usuario
    @GetMapping("/zonaAdmin/pedidos/{correo}")

// Función para mostrar la página de los pedidos de un usuario
    public ModelAndView verPedidosUsuario(Authentication aut, @PathVariable String correo) {
        ModelAndView mv = new ModelAndView("admin/pedidos_usuario");

        // Mostrar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuarioAdmin", aut.getName());
        }

        // Buscar al usuario por su correo
        Optional<Usuario> usuario = servicioUsuarios.buscarUsuarioPorEmail(correo);

        // Comprobar que existe el usuario
        if(usuario.isPresent()) {

            // Ver los pedidos del usuario
            List<Pedido> pedidosUsuario = servicioPedidos.verPedidosUsuario(usuario.get().getCorreoElectronico());
            mv.addObject("listaPedidosUsuario", pedidosUsuario);
            mv.addObject("usuario", usuario.get());
        } else {

            // Si no existe el usuario mostrar mensaje de error
            mv.addObject("error", "No existe el usuario");
        }

        // Devolver la vista
        return mv;
    }
}