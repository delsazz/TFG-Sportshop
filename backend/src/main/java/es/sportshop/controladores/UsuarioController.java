package es.sportshop.controladores;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.time.LocalDate;
import es.sportshop.model.ConfiguracionPago;
import es.sportshop.model.Pedido;
import es.sportshop.model.Usuario;
import es.sportshop.model.Detalle;
import es.sportshop.model.Producto;
import jakarta.servlet.http.HttpSession;
import es.sportshop.servicios.ServicioPedidos;
import es.sportshop.servicios.ServicioDetalle;
import es.sportshop.servicios.ServicioUsuarios;
import es.sportshop.servicios.ServicioProductos;
import es.sportshop.servicios.ServicioConfiguracionPago;
import es.sportshop.servicios.ServicioStripe;
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
    private final ServicioPedidos servicioPedidos;
    private final ServicioDetalle servicioDetalle;
    private final ServicioConfiguracionPago servicioConfiguracionPago;
    private final ServicioStripe servicioStripe;
    private final PasswordEncoder passwordEncoder;

    // Constructor con parámetros para la clase UsuarioController
    public UsuarioController(ServicioProductos servicioProductos, ServicioUsuarios servicioUsuarios, ServicioPedidos servicioPedidos, ServicioDetalle servicioDetalle, ServicioConfiguracionPago servicioConfiguracionPago, ServicioStripe servicioStripe, PasswordEncoder passwordEncoder) {
        this.servicioProductos = servicioProductos;
        this.servicioUsuarios = servicioUsuarios;
        this.servicioPedidos = servicioPedidos;
        this.servicioDetalle = servicioDetalle;
        this.servicioConfiguracionPago = servicioConfiguracionPago;
        this.servicioStripe = servicioStripe;
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
            usuario.setRol("cliente");
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
        Producto producto = servicioProductos.buscarProductoPorId(idProducto);

        // Si el producto existe añadirlo al carrito
        if(producto != null && contarProductoEnCarrito(carrito, idProducto) < producto.getStock()) {
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
            for(int i = 0; i < carrito.size(); i++) {
                if(carrito.get(i).getIdProducto() == idProducto) {
                    carrito.remove(i);
                    break;
                }
            }
            session.setAttribute("carrito", carrito);
        }

        // Devolver la vista
        return mv;
    }

    // Anotación de Spring para mostrar la página de pago
    @GetMapping("/pagar_pedido")
    public ModelAndView pagarPedido(Authentication aut, HttpSession session) {
        if(aut == null) {
            return new ModelAndView("redirect:/login");
        }

        List<Producto> carrito = obtenerCarrito(session);
        if(carrito.isEmpty()) {
            return new ModelAndView("redirect:/carrito");
        }

        ModelAndView mv = new ModelAndView("usuario/pagar_pedido");
        mv.addObject("usuario", aut.getName());
        mv.addObject("productosCarrito", carrito.size());
        mv.addObject("total", calcularTotal(carrito));
        mv.addObject("configuracionPago", servicioConfiguracionPago.obtenerConfiguracion());
        return mv;
    }

    // Anotación de Spring para seleccionar el método de pago
    @PostMapping("/seleccionarMetodoPago")
    public ModelAndView seleccionarMetodoPago(@RequestParam("metodoPago") String metodoPago) {
        if("bizum".equals(metodoPago)) {
            return new ModelAndView("redirect:/pago/bizum");
        }
        if("tarjeta".equals(metodoPago)) {
            return new ModelAndView("redirect:/pago/tarjeta");
        }
        if("transferencia".equals(metodoPago)) {
            return new ModelAndView("redirect:/pago/transferencia");
        }
        return new ModelAndView("redirect:/pagar_pedido");
    }

    // Anotación de Spring para mostrar el pago por Bizum
    @GetMapping("/pago/bizum")
    public ModelAndView pagoBizum(Authentication aut, HttpSession session) {
        ModelAndView mv = prepararVistaPago("usuario/pago_bizum", aut, session);
        mv.addObject("configuracionPago", servicioConfiguracionPago.obtenerConfiguracion());
        return mv;
    }

    // Anotación de Spring para confirmar el pago por Bizum
    @PostMapping("/pago/bizum/confirmar")
    public ModelAndView confirmarBizum(Authentication aut, HttpSession session) {
        return procesarPedido(aut, session, "Bizum");
    }

    // Anotación de Spring para mostrar el pago por transferencia
    @GetMapping("/pago/transferencia")
    public ModelAndView pagoTransferencia(Authentication aut, HttpSession session) {
        ModelAndView mv = prepararVistaPago("usuario/pago_transferencia", aut, session);
        mv.addObject("configuracionPago", servicioConfiguracionPago.obtenerConfiguracion());
        return mv;
    }

    // Anotación de Spring para confirmar el pago por transferencia
    @PostMapping("/pago/transferencia/confirmar")
    public ModelAndView confirmarTransferencia(Authentication aut, HttpSession session) {
        return procesarPedido(aut, session, "Transferencia bancaria");
    }

    // Anotación de Spring para mostrar el pago con tarjeta
    @GetMapping("/pago/tarjeta")
    public ModelAndView pagoTarjeta(Authentication aut, HttpSession session) {
        ModelAndView mv = prepararVistaPago("usuario/pago_tarjeta", aut, session);
        ConfiguracionPago configuracionPago = servicioConfiguracionPago.obtenerConfiguracion();
        mv.addObject("stripeConfigurado", configuracionPago.getStripeSecretKey() != null && !configuracionPago.getStripeSecretKey().isBlank());
        return mv;
    }

    // Anotación de Spring para iniciar el pago con Stripe Checkout
    @PostMapping("/pago/tarjeta/stripe")
    public ModelAndView iniciarPagoStripe(Authentication aut, HttpSession session) {
        if(aut == null) {
            return new ModelAndView("redirect:/login");
        }

        List<Producto> carrito = obtenerCarrito(session);
        if(carrito.isEmpty()) {
            return new ModelAndView("redirect:/carrito");
        }

        try {
            int total = calcularTotal(carrito);
            Session stripeSession = servicioStripe.crearSesionPago(aut.getName(), total, "http://localhost:8095/pago/tarjeta/exito", "http://localhost:8095/pago/tarjeta");
            return new ModelAndView("redirect:" + stripeSession.getUrl());
        } catch(StripeException | IllegalStateException ex) {
            ModelAndView mv = prepararVistaPago("usuario/pago_tarjeta", aut, session);
            mv.addObject("error", ex.getMessage());
            mv.addObject("stripeConfigurado", false);
            return mv;
        }
    }

    // Anotación de Spring para finalizar después de Stripe
    @GetMapping("/pago/tarjeta/exito")
    public ModelAndView pagoTarjetaExito(Authentication aut, HttpSession session) {
        return procesarPedido(aut, session, "Tarjeta Stripe");
    }

    // Anotación de Spring para procesar tarjeta en modo demostración
    @PostMapping("/pago/tarjeta/confirmar")
    public ModelAndView confirmarTarjetaDemo(Authentication aut, HttpSession session) {
        return procesarPedido(aut, session, "Tarjeta");
    }

    // Anotación de Spring para mantener compatibilidad con la ruta antigua
    @PostMapping("/procesarPago")
    public ModelAndView procesarPago(Authentication aut, HttpSession session) {
        return procesarPedido(aut, session, "Tarjeta");
    }

    private ModelAndView prepararVistaPago(String vista, Authentication aut, HttpSession session) {
        if(aut == null) {
            return new ModelAndView("redirect:/login");
        }

        List<Producto> carrito = obtenerCarrito(session);
        if(carrito.isEmpty()) {
            return new ModelAndView("redirect:/carrito");
        }

        ModelAndView mv = new ModelAndView(vista);
        mv.addObject("usuario", aut.getName());
        mv.addObject("productosCarrito", carrito.size());
        mv.addObject("total", calcularTotal(carrito));
        return mv;
    }

    // Función para procesar el pedido después de confirmar el pago
    private ModelAndView procesarPedido(Authentication aut, HttpSession session, String metodoPago) {
        if(aut == null) {
            return new ModelAndView("redirect:/login");
        }

        List<Producto> carrito = obtenerCarrito(session);
        if(carrito.isEmpty()) {
            return new ModelAndView("redirect:/carrito");
        }

        Usuario usuario = servicioUsuarios.buscarUsuarioPorEmail(aut.getName()).orElse(null);
        if(usuario == null) {
            return new ModelAndView("redirect:/login");
        }

        Map<Integer, Detalle> detallesPedido = new LinkedHashMap<>();
        for(Producto producto : carrito) {
            Detalle detalle = detallesPedido.get(producto.getIdProducto());
            if(detalle == null) {
                detalle = new Detalle();
                detalle.setProducto(producto);
                detalle.setPrecio(producto.getPrecio());
                detalle.setUnidades(0);
                detallesPedido.put(producto.getIdProducto(), detalle);
            }
            detalle.setUnidades(detalle.getUnidades() + 1);
        }

        for(Detalle detalle : detallesPedido.values()) {
            Producto producto = servicioProductos.buscarProductoPorId(detalle.getProducto().getIdProducto());
            if(producto == null || producto.getStock() < detalle.getUnidades()) {
                return new ModelAndView("redirect:/carrito");
            }
            detalle.setProducto(producto);
        }

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setFechaPedido(LocalDate.now());
        pedido.setFechaEntrega(LocalDate.now().plusDays(3));
        pedido.setMetodoPago(metodoPago);
        Pedido pedidoGuardado = servicioPedidos.guardarPedido(pedido);

        for(Detalle detalle : detallesPedido.values()) {
            Producto producto = detalle.getProducto();
            detalle.setPedido(pedidoGuardado);
            producto.setStock(producto.getStock() - detalle.getUnidades());
            servicioProductos.guardarProducto(producto);
            servicioDetalle.guardarDetalle(detalle);
        }

        session.setAttribute("carrito", new ArrayList<Producto>());
        return new ModelAndView("redirect:/usuariopedidos?pagado");
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

    // Anotación de Spring para mostrar los pedidos del usuario
    @GetMapping("/usuariopedidos")
    public ModelAndView usuarioPedidos(Authentication aut, HttpSession session) {
        if(aut == null) {
            return new ModelAndView("redirect:/login");
        }

        ModelAndView mv = new ModelAndView("usuario/pedidos");
        mv.addObject("usuario", aut.getName());
        mv.addObject("listaPedidos", servicioPedidos.verPedidosUsuario(aut.getName()));
        mv.addObject("productosCarrito", obtenerCarrito(session).size());
        return mv;
    }

    // Anotación de Spring para mostrar una página de acceso denegado
    @GetMapping("/denegado")
    public ModelAndView denegado(Authentication aut, HttpSession session) {
        ModelAndView mv = new ModelAndView("denegado");
        if(aut != null) {
            mv.addObject("usuario", aut.getName());
        }
        mv.addObject("productosCarrito", obtenerCarrito(session).size());
        return mv;
    }

    private List<Producto> obtenerCarrito(HttpSession session) {
        List<Producto> carrito = (List<Producto>) session.getAttribute("carrito");
        if(carrito == null) {
            carrito = new ArrayList<>();
            session.setAttribute("carrito", carrito);
        }
        return carrito;
    }

    private int calcularTotal(List<Producto> carrito) {
        int total = 0;
        for(Producto producto : carrito) {
            total += producto.getPrecio();
        }
        return total;
    }
}
