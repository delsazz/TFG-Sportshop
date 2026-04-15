package es.sportshop.controladores;
import java.util.List;
import java.util.ArrayList;
import es.sportshop.model.Usuario;
import es.sportshop.model.Producto;
import jakarta.servlet.http.HttpSession;
import es.sportshop.servicios.ServicioUsuarios;
import es.sportshop.servicios.ServicioProductos;
import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.crypto.password.PasswordEncoder;

// Anotación de Spring para indicar que es un controlador
@Controller
public class UsuarioController {

    // Atributos para la clase UsuarioController
    private final ServicioProductos servicioProductos;
    private final ServicioUsuarios servicioUsuarios;
    private final PasswordEncoder passwordEncoder;

    // Constructor con parámetros para la clase UsuarioController
    public UsuarioController(ServicioProductos servicioProductos, ServicioUsuarios servicioUsuarios, PasswordEncoder passwordEncoder) {
        this.servicioProductos = servicioProductos;
        this.servicioUsuarios = servicioUsuarios;
        this.passwordEncoder = passwordEncoder;
    }

    // Anotación de Spring para mostrar la página principal
    @GetMapping("/")

    // Función para mostrar el index
    public ModelAndView index(Authentication aut, HttpSession session) {
        ModelAndView mv = new ModelAndView("index");

        // Mostrar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Contar productos en el carrito
        List<Producto> carrito = (List<Producto>) session.getAttribute("carrito");
        int productosCarrito = carrito != null ? carrito.size() : 0;
        mv.addObject("productosCarrito", productosCarrito);

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para mostrar la página de inicio de sesión
    @GetMapping("/login")

    // Función para mostrar el inicio de sesión
    public ModelAndView inicioSesion() {
        // Devolver la vista
        return new ModelAndView("login");
    }

    // Anotación de Spring para mostrar la página de registro
    @GetMapping("/registro")
    // Función para mostrar la página de registro
    public ModelAndView registro() {
        // Devolver la vista
        return new ModelAndView("usuario/registro");
    }

    // Anotación de Spring para registrar a un usuario
    @PostMapping("/registro")

    // Función para registrar a un usuario
    public ModelAndView registrar(@RequestParam("nombre") String nombre, @RequestParam("apellidos") String apellidos, @RequestParam("email") String correoElectronico, @RequestParam("password") String pw, @RequestParam(value = "telefono", required = false) String telefono, @RequestParam("nif") String nif,  @RequestParam("ciudad") String ciudad, @RequestParam("pais") String pais, @RequestParam("codigoPostal") String codigoPostal, @RequestParam("direccion") String direccion) {

        // Comprobar si el usuario ya existe
        if(servicioUsuarios.buscarUsuarioPorEmail(correoElectronico).isPresent()) {
            ModelAndView mv = new ModelAndView("usuario/registro");

            // Mensaje de error si el usuario existe
            mv.addObject("error", "El email ya existe");

            // Devolver la vista
            return mv;
        } else {

            // Si no existe, registrar un nuevo usuario
            Usuario usuario = new Usuario();
            usuario.setNombre(nombre);
            usuario.setApellidos(apellidos);
            usuario.setCorreoElectronico(correoElectronico);
            usuario.setPw(passwordEncoder.encode(pw));
            usuario.setTelefono(telefono);
            usuario.setNif(nif);
            usuario.setCiudad(ciudad);
            usuario.setPais(pais);
            usuario.setCodigoPostal(codigoPostal);
            usuario.setDireccion(direccion);
            servicioUsuarios.registrarUsuario(usuario);
            System.out.println("Se ha añadido el usuario");

            // Devolver la vista
            return new ModelAndView("redirect:/login?registrado");
        }
    }

    // Anotación de Spring para mostrar la página de productos
    @GetMapping("/productos")

    // Función para mostrar la página de productos
    public ModelAndView productos(Authentication aut, HttpSession session) {
        ModelAndView mv = new ModelAndView("usuario/productos");

        // Mostrar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Mostrar los productos
        List<Producto> productos = servicioProductos.verProductos();
        mv.addObject("listaProductos", productos);

        // Contar los productos en el carrito
        List<Producto> carrito = (List<Producto>) session.getAttribute("carrito");
        int productosCarrito = carrito != null ? carrito.size() : 0;
        mv.addObject("productosCarrito", productosCarrito);

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para mostrar la página del carrito
    @GetMapping("/carrito")
    public ModelAndView carrito(Authentication aut, HttpSession session) {
        ModelAndView mv = new ModelAndView("usuario/carrito");

        // Mostrar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Obtener los productos del carrito de la sesión
        List<Producto> carrito = (List<Producto>) session.getAttribute("carrito");
        if(carrito == null) {
            carrito = new ArrayList<>();
            session.setAttribute("carrito", carrito);
        }
        mv.addObject("listaCarrito", carrito);
        mv.addObject("productosCarrito", carrito.size());

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para añadir un producto al carrito
    @GetMapping("/anadirProductoCarrito")

    // Función para añadir un producto al carrito
    public ModelAndView anadirCarrito(@RequestParam("id") int idProducto, HttpSession session, Authentication aut) {
        ModelAndView mv = new ModelAndView("redirect:/productos");

        // Mostrar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Obtener el carrito de la sesión
        List<Producto> carrito = (List<Producto>) session.getAttribute("carrito");
        if(carrito == null) {
            carrito = new ArrayList<>();
        }

        // Buscar el producto
        Producto producto = servicioProductos.verProductos().stream().filter(p -> p.getIdProducto() == idProducto).findFirst().orElse(null);

        // Si el producto existe añadirlo al carrito
        if(producto != null) {
            carrito.add(producto);
        }

        // Guardar el carrito actualizado en la sesión
        session.setAttribute("carrito", carrito);

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para eliminar un producto del carrito
    @GetMapping("/eliminarProductoCarrito")

    // Función para eliminar un producto del carrito
    public ModelAndView eliminarCarrito(@RequestParam("id") int idProducto, HttpSession session, Authentication aut) {
        ModelAndView mv = new ModelAndView("redirect:/carrito");

        // Mostrar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Obtener el carrito de la sesión
        List<Producto> carrito = (List<Producto>) session.getAttribute("carrito");

        // Si el carrito no está vacío eliminar el producto
        if(carrito != null) {
            carrito.removeIf(p -> p.getIdProducto() == idProducto);
            session.setAttribute("carrito", carrito);
        }

        // Devolver la vista
        return mv;
    }
}