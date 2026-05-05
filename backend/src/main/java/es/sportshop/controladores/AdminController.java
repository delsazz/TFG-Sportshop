package es.sportshop.controladores;
import es.sportshop.model.Pedido;
import es.sportshop.model.Producto;
import es.sportshop.model.Usuario;
import es.sportshop.model.Categoria;
import es.sportshop.model.Foto;
import es.sportshop.model.ConfiguracionPago;
import es.sportshop.servicios.*;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;
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
    private final ServicioFotos servicioFotos;
    private final ServicioCategorias servicioCategorias;
    private final ServicioConfiguracionPago servicioConfiguracionPago;
    private final ServicioArchivos servicioArchivos;
    private final ServicioUsuarios servicioUsuarios;

    // Constructor con parámetros para la clase AdminController
    public AdminController(ServicioProductos servicioProductos, ServicioPedidos servicioPedidos, ServicioFotos servicioFotos, ServicioCategorias servicioCategorias, ServicioConfiguracionPago servicioConfiguracionPago, ServicioArchivos servicioArchivos, ServicioUsuarios servicioUsuarios) {
        this.servicioProductos = servicioProductos;
        this.servicioPedidos = servicioPedidos;
        this.servicioFotos = servicioFotos;
        this.servicioCategorias = servicioCategorias;
        this.servicioConfiguracionPago = servicioConfiguracionPago;
        this.servicioArchivos = servicioArchivos;
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
    @GetMapping("/zonaAdmin/productos")

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
        mv.addObject("listaCategorias", servicioCategorias.verCategorias());

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para mostrar la página para añadir productos
    @PostMapping("/zonaAdmin/anadirProducto")

    // Función para mostrar la página para añadir productos
    public ModelAndView anadirProducto(Authentication aut, @RequestParam String nombre, @RequestParam String descripcion, @RequestParam int precio, @RequestParam int stock, @RequestParam int idCategoria, @RequestParam(required = false) String tallas, @RequestParam("fotoProducto") MultipartFile fotoProducto) throws IOException {

        // Comprobar que el producto no exista
        if(servicioProductos.buscarProductoPorNombre(nombre).isEmpty()) {

            // Si no existe ningún producto con ese nombre crear y guardar un nuevo producto
            Producto producto = new Producto();
            producto.setNombre(nombre);
            producto.setDescripcion(descripcion);
            producto.setPrecio(precio);
            producto.setStock(stock);
            producto.setTallas(tallas);
            producto.setCategoria(servicioCategorias.buscarCategoriaPorId(idCategoria));
            String nombreFoto = servicioArchivos.guardarImagen(fotoProducto);
            if(nombreFoto != null) {
                Foto foto = new Foto();
                foto.setNombreFoto(nombreFoto);
                producto.setFoto(servicioFotos.anadirFoto(foto));
            }
            servicioProductos.guardarProducto(producto);
            System.out.println("Se ha añadido el producto");
        }
        ModelAndView mv = new ModelAndView("redirect:/zonaAdmin/productos");

        // Comprobar que usuario ha iniciado sesión
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para añadir categorías
    @PostMapping("/zonaAdmin/anadirCategoria")
    public ModelAndView anadirCategoria(Authentication aut, @RequestParam String nombreCategoria, @RequestParam("fotoCategoria") MultipartFile fotoCategoria) throws IOException {
        Categoria categoria = new Categoria();
        categoria.setCategoria(nombreCategoria);
        categoria.setNombreFoto(servicioArchivos.guardarImagen(fotoCategoria));
        servicioCategorias.guardarCategoria(categoria);

        ModelAndView mv = new ModelAndView("redirect:/zonaAdmin/productos?categoriaGuardada");
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }
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

    // Anotación de Spring para mostrar la página de usuarios
    @GetMapping("/zonaAdmin/usuarios")
    public ModelAndView usuarios(Authentication aut) {
        ModelAndView mv = new ModelAndView("admin/usuarios");

        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        mv.addObject("listaUsuarios", servicioUsuarios.verUsuarios());
        return mv;
    }

    // Anotación de Spring para mostrar la configuración de pagos
    @GetMapping("/zonaAdmin/pagos")
    public ModelAndView configuracionPagos(Authentication aut) {
        ModelAndView mv = new ModelAndView("admin/pagos");

        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }

        mv.addObject("configuracionPago", servicioConfiguracionPago.obtenerConfiguracion());
        return mv;
    }

    // Anotación de Spring para guardar la configuración de pagos
    @PostMapping("/zonaAdmin/pagos")
    public ModelAndView guardarConfiguracionPagos(Authentication aut,
                                                  @RequestParam String telefonoBizum,
                                                  @RequestParam String urlBancoBizum,
                                                  @RequestParam String titularTransferencia,
                                                  @RequestParam String ibanTransferencia,
                                                  @RequestParam String conceptoTransferencia,
                                                  @RequestParam(required = false) String stripePublicKey,
                                                  @RequestParam(required = false) String stripeSecretKey) {
        ConfiguracionPago configuracionPago = new ConfiguracionPago();
        configuracionPago.setTelefonoBizum(telefonoBizum);
        configuracionPago.setUrlBancoBizum(urlBancoBizum);
        configuracionPago.setTitularTransferencia(titularTransferencia);
        configuracionPago.setIbanTransferencia(ibanTransferencia);
        configuracionPago.setConceptoTransferencia(conceptoTransferencia);
        configuracionPago.setStripePublicKey(stripePublicKey);
        configuracionPago.setStripeSecretKey(stripeSecretKey);
        servicioConfiguracionPago.guardarConfiguracion(configuracionPago);

        ModelAndView mv = new ModelAndView("redirect:/zonaAdmin/pagos?guardado");
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }
        return mv;
    }
}
