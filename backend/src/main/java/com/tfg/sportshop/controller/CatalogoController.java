package com.tfg.sportshop.controller;

import java.util.List;
import java.io.IOException;
import jakarta.validation.Valid;
import com.tfg.sportshop.model.Kit;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.Cookie;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.model.Producto;
import com.tfg.sportshop.dto.KitResponse;
import com.tfg.sportshop.model.Categoria;
import com.tfg.sportshop.dto.TallaStockDTO;
import com.tfg.sportshop.model.KitProducto;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.services.KitService;
import com.tfg.sportshop.model.ProductoImagen;
import com.tfg.sportshop.model.BackorderPedido;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import com.tfg.sportshop.model.ProductoDocumento;
import com.tfg.sportshop.services.UsuarioService;
import org.springframework.web.bind.annotation.*;
import com.tfg.sportshop.services.ProductoService;
import com.tfg.sportshop.dto.admin.AdminKitRequest;
import com.tfg.sportshop.security.JWTTokenProvider;
import com.tfg.sportshop.services.CategoriaService;
import com.tfg.sportshop.dto.admin.AdminKitResponse;
import com.tfg.sportshop.dto.admin.BackorderResponse;
import com.tfg.sportshop.services.ProductoTallaService;
import org.springframework.web.multipart.MultipartFile;
import com.tfg.sportshop.dto.admin.AdminProductoRequest;
import com.tfg.sportshop.services.ProductoImagenService;
import org.springframework.security.core.Authentication;
import com.tfg.sportshop.dto.admin.AdminCategoriaRequest;
import com.tfg.sportshop.dto.admin.AdminProductoResponse;
import com.tfg.sportshop.services.BackorderPedidoService;
import com.tfg.sportshop.dto.admin.AdminCategoriaResponse;
import com.tfg.sportshop.dto.admin.ProductoImagenResponse;
import com.tfg.sportshop.services.ProductoDocumentoService;
import com.tfg.sportshop.dto.admin.ProductoDocumentoResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class CatalogoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private ProductoImagenService productoImagenService;

    @Autowired
    private ProductoTallaService productoTallaService;

    @Autowired
    private KitService kitService;
    
    @Autowired
    private ProductoDocumentoService productoDocumentoService;

    @Autowired
    private JWTTokenProvider jwtTokenProvider;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private BackorderPedidoService backorderPedidoService;


    // =========================
    // PRODUCTOS
    // =========================

    @GetMapping("/catalogo")
    public List<AdminProductoResponse> todos() {
        return productoService.verProductos().stream().map(this::toProductoResponse) .toList();     
    }

    @GetMapping("/catalogo/{id}")
    public AdminProductoResponse verProductoPorId(@PathVariable Long id) {
        return toProductoResponse(productoService.buscarProductoPorId(id));
    }

    @PostMapping("/catalogo")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductoResponse crearProducto(@Valid @RequestBody AdminProductoRequest request) {
        validarAdministrador();
        Producto producto = productoService.crearProductoConTallas(request);
        return toProductoResponse(producto);
    }

    @PutMapping("/catalogo/{id}")
    public AdminProductoResponse actualizarProducto( @PathVariable Long id, @Valid @RequestBody AdminProductoRequest request) {
        validarAdministrador();
        Producto producto = productoService.actualizarProducto(id, request);
        return toProductoResponse(producto);
    }

    @DeleteMapping("/catalogo/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarProducto(@PathVariable Long id) {
        validarAdministrador();
        productoService.eliminarProducto(id);
    }

    // =========================
    // TALLAS
    // =========================

    @GetMapping("/catalogo/{id}/tallas")
    public ResponseEntity<List<TallaStockDTO>> tallasPorProducto(@PathVariable Integer id) {
        List<TallaStockDTO> tallaStockDTO = productoTallaService.buscarTallasPorProducto(id).stream()
                .map(pt -> new TallaStockDTO(pt.getTalla().getIdTalla(), pt.getTalla().getNombre(), pt.getStock())).toList();
        return ResponseEntity.ok(tallaStockDTO);
    }

    // =========================
    // IMÁGENES
    // =========================

    @PostMapping("/catalogo/{id}/imagen")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoImagenResponse subirImagen(@PathVariable Long id, @RequestParam("file") MultipartFile file,
            @RequestParam(value = "esPrincipal", defaultValue = "false") Boolean esPrincipal) throws IOException {
        validarAdministrador();
        ProductoImagen imagen = productoImagenService.subirImagen(id, file, esPrincipal);
        return toImagenResponse(imagen);
    }

    @GetMapping("/catalogo/{id}/imagenes")
    public List<ProductoImagenResponse> obtenerImagenesProducto(@PathVariable Long id) {
        return productoImagenService.obtenerImagenesProducto(id).stream().map(this::toImagenResponse).toList();     
    }

    @PostMapping("/catalogo/{id}/imagenes")
    public List<ProductoImagenResponse> subirImagenes(@PathVariable Long id, @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "principalIndex", required = false) Integer principalIndex) throws IOException {
        validarAdministrador();
        List<ProductoImagenResponse> responses = new java.util.ArrayList<>();
        for(int i = 0; i < files.length; i++) {
            MultipartFile f = files[i];
            Boolean esPrincipal = (principalIndex != null && principalIndex == i);
            responses.add(toImagenResponse(productoImagenService.subirImagen(id, f, esPrincipal)));
        }
        return responses;
    }

    // Documentos (PDF)
    @PostMapping("/catalogo/{id}/documentos")
    public ProductoDocumentoResponse subirDocumento(@PathVariable Long id, @RequestParam("file") MultipartFile file,
            @RequestParam(value = "nombre", required = false) String nombre ) throws IOException {
        validarAdministrador();
        var doc = productoDocumentoService.subirDocumento(id, file, nombre);
        return toDocumentoResponse(doc);
    }

    @GetMapping("/catalogo/{id}/documentos")
    public List<ProductoDocumentoResponse> obtenerDocumentosProducto(@PathVariable Long id) {
        return productoDocumentoService.obtenerDocumentosPorProducto(id).stream()
                .map(d -> toDocumentoResponse(d)).toList();
    }

    @DeleteMapping("/catalogo/documentos/{idDocumento}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarDocumento(@PathVariable Integer idDocumento) {
        validarAdministrador();
        productoDocumentoService.eliminarDocumento(idDocumento);
    }

    @DeleteMapping("/catalogo/imagenes/{idImagen}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarImagen(@PathVariable Integer idImagen) {
        validarAdministrador();
        productoImagenService.eliminarImagen(idImagen);
    }

    // =========================
    // KITS (PÚBLICOS)
    // =========================

    @GetMapping("/kits")
    public List<KitResponse> obtenerKitsPublicos() {
        return kitService.obtenerTodosLosKits().stream().map(this::toKitResponsePublico).toList();
    }

    @GetMapping("/kits/{id}")
    public KitResponse obtenerKitPublico(@PathVariable Integer id) {
        Kit kit = kitService.obtenerKitPorId(id);
        return toKitResponsePublico(kit);
    }

    @GetMapping("/categorias/{categoriaId}/kits")
    public List<KitResponse> obtenerKitsPublicosPorCategoria(@PathVariable Integer categoriaId) {
        return kitService.obtenerKitsPorCategoria(categoriaId).stream().map(this::toKitResponsePublico).toList();
    }

    // =========================
    // CATEGORÍAS
    // =========================

    @GetMapping("/categorias")
    public List<AdminCategoriaResponse> verCategorias() {
        return categoriaService.verCategorias().stream() .map(this::toCategoriaResponse).toList();
    }

    @GetMapping("/categorias/slug/{slug}")
    public AdminCategoriaResponse verCategoriaPorSlug(@PathVariable String slug) {
        Categoria categoria = categoriaService.buscarCategoriaPorSlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada"));
        return toCategoriaResponse(categoria);
    }

    @PostMapping("/categorias")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminCategoriaResponse crearCategoria(@Valid @RequestBody AdminCategoriaRequest request) {
        validarAdministrador();
        Categoria categoria = categoriaService.crearCategoria(request.nombreCategoria(), request.slug(),
                request.descripcion(), request.imagenUrl(),  request.ordenVisualizacion(), request.productoIds());
        return toCategoriaResponse(categoria);
    }

    @PutMapping("/categorias/{id}")
    public AdminCategoriaResponse actualizarCategoria(@PathVariable Integer id, @Valid @RequestBody AdminCategoriaRequest request) {
        validarAdministrador();
        Categoria categoria = categoriaService.actualizarCategoria(id, request.nombreCategoria(), request.slug(),   
                request.descripcion(), request.imagenUrl(), request.ordenVisualizacion(), request.productoIds());
        return toCategoriaResponse(categoria);
    }

    @DeleteMapping("/categorias/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarCategoria(@PathVariable Integer id) {
        validarAdministrador();
        categoriaService.eliminarCategoria(id);
    }

    // =========================
    // KITS (ADMIN)
    // =========================

    @GetMapping("/admin/kits")
    public List<AdminKitResponse> obtenerTodosLosKitsAdmin() {
        validarAdministrador();
        return kitService.obtenerTodosLosKits().stream().map(this::toKitResponse).toList();   
    }

    @GetMapping("/admin/kits/{id}")
    public AdminKitResponse obtenerKitAdmin(@PathVariable Integer id) {
        validarAdministrador();
        return toKitResponse(kitService.obtenerKitPorId(id));
    }

    @PostMapping("/admin/kits")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminKitResponse crearKitAdmin(@Valid @RequestBody AdminKitRequest request) {
        validarAdministrador();
        Kit kit = kitService.crearKit(request);
        return toKitResponse(kit);
    }

    @PutMapping("/admin/kits/{id}")
    public AdminKitResponse actualizarKitAdmin(@PathVariable Integer id, @Valid @RequestBody AdminKitRequest request) {
        validarAdministrador();
        Kit kit = kitService.actualizarKit(id, request);
        return toKitResponse(kit);
    }

    @DeleteMapping("/admin/kits/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarKitAdmin(@PathVariable Integer id) {
        validarAdministrador();
        kitService.eliminarKit(id);
    }

    // =========================
    // BACKORDERS (ADMIN)
    // =========================

    @GetMapping("/admin/backorders")
    public List<BackorderResponse> obtenerBackordersPendientes() {
        validarAdministrador();
        return backorderPedidoService.obtenerBackordersPendientes().stream().map(backorderPedidoService::toResponse).toList();
    }

    @GetMapping("/admin/backorders/todos")
    public List<BackorderResponse> obtenerTodosBackorders() {
        validarAdministrador();
        return backorderPedidoService.obtenerTodosBackorders().stream().map(backorderPedidoService::toResponse).toList();    
    }

    @GetMapping("/admin/backorders/producto/{id}")
    public List<BackorderResponse> obtenerBackordersPorProducto(@PathVariable Integer id) {
        validarAdministrador();
        return backorderPedidoService.obtenerBackordersPorProducto(id).stream().map(backorderPedidoService::toResponse).toList();
    }

    @PutMapping("/admin/backorders/{id}")
    public BackorderResponse actualizarBackorder(@PathVariable Integer id, @RequestParam String estado,
            @RequestParam(required = false) String observaciones) {
        validarAdministrador();
        BackorderPedido backorder = backorderPedidoService.actualizar(id, estado, observaciones);
        return backorderPedidoService.toResponse(backorder);
    }

    @DeleteMapping("/admin/backorders/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarBackorder(@PathVariable Integer id) {
        validarAdministrador();
        backorderPedidoService.eliminar(id);
    }

    // =========================
    // MAPPERS
    // =========================

    private AdminProductoResponse toProductoResponse(Producto producto) {
        return new AdminProductoResponse(producto.getIdProducto(), producto.getNombre(), producto.getTipoPrenda(),
                producto.getColor(), producto.getPrecio(), producto.getStock(), producto.getImagen(),
                producto.getDescripcion(), producto.getComposicion(), producto.getNormativa(),
                producto.getInstruccionesLavado(), producto.getConsejos(),
                producto.getCategoria() == null ? null : toCategoriaResponse(producto.getCategoria()));
    }

    private ProductoImagenResponse toImagenResponse(ProductoImagen imagen) {
        return new ProductoImagenResponse(imagen.getIdImagen(), imagen.getUrlImagen(), imagen.getAltText(),
                imagen.getOrden(), imagen.getEsPrincipal());
    }

    private ProductoDocumentoResponse toDocumentoResponse(com.tfg.sportshop.model.ProductoDocumento doc) {
        return new ProductoDocumentoResponse(doc.getIdDocumento(), doc.getNombre(), doc.getUrlDocumento(), doc.getTipo());
    }

    private AdminCategoriaResponse toCategoriaResponse(Categoria categoria) {
        return new AdminCategoriaResponse(categoria.getIdCategoria(), categoria.getNombreCategoria(), categoria.getSlug(),
                categoria.getDescripcion(),  categoria.getImagenUrl(), categoria.getOrdenVisualizacion(),
                productoService.verProductosPorCategoria(categoria.getIdCategoria()).size());
    }

    private AdminKitResponse toKitResponse(Kit kit) {
        List<AdminKitResponse.AdminKitProductoResponse> productosResponse = kit.getProductos() != null
            ? kit.getProductos().stream()
                .map(kp -> new AdminKitResponse.AdminKitProductoResponse(kp.getIdKitProducto(), toProductoResponse(kp.getProducto()),
                    kp.getCantidad())).toList() : List.of();
        return new AdminKitResponse( kit.getIdKit(), kit.getNombre(), kit.getDescripcion(), kit.getPrecio(),
                kit.getStock(), kit.getImagen(), kit.getActivo(), kit.getFechaCreacion(), kit.getFechaActualizacion(),
                kit.getCategoria() == null ? null : toCategoriaResponse(kit.getCategoria()), productosResponse);  
    }

    private KitResponse toKitResponsePublico(Kit kit) {
        List<KitResponse.KitProductoResponse> productosResponse = kit.getProductos() != null
            ? kit.getProductos().stream()
                .map(kp -> {
                    Producto p = kp.getProducto();
                    List<String> tallas = productoTallaService.buscarTallasPorProducto(p.getIdProducto()).stream()
                        .map(pt -> pt.getTalla().getNombre()).toList();
                    return new KitResponse.KitProductoResponse(p.getIdProducto(), p.getNombre(), p.getTipoPrenda(), p.getColor(),
                        p.getPrecio(), p.getImagen(), kp.getCantidad(), tallas);
                        }).toList() : List.of();
        return new KitResponse(kit.getIdKit(), kit.getNombre(), kit.getDescripcion(), kit.getPrecio(), kit.getImagen(), 
                kit.getStock(), kit.getCategoria() == null ? null : kit.getCategoria().getIdCategoria(),
                kit.getCategoria() == null ? null : kit.getCategoria().getNombreCategoria(), productosResponse);  
    }

    // =========================
    // SEGURIDAD
    // =========================

    private void validarAdministrador() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Usuario usuarioAutenticado) {
            if(esAdmin(usuarioAutenticado)) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requieren permisos de administrador");
        }
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if(attributes == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        HttpServletRequest request = attributes.getRequest();
        Usuario usuario = resolverUsuarioDesdeRequest(request);
        if(usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No se pudo obtener informacion del usuario");
        }
        if(!esAdmin(usuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requieren permisos de administrador");
        }
    }

    private Usuario resolverUsuarioDesdeRequest(HttpServletRequest request) {
        String email = null;
        String authorization = request.getHeader("Authorization");
        if(authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            if(jwtTokenProvider.validateToken(token)) {
                email = jwtTokenProvider.getUsernameFromToken(token);
            }
        }
        if(email == null || email.isBlank()) {
            Cookie[] cookies = request.getCookies();
            if(cookies != null) {
                for(Cookie cookie : cookies) {
                    if("sportshop_auth".equals(cookie.getName())) {
                        String token = cookie.getValue();
                        if(token != null && jwtTokenProvider.validateToken(token)) {
                            email = jwtTokenProvider.getUsernameFromToken(token);
                        }
                        break;
                    }
                }
            }
        }
        if(email == null || email.isBlank()) {
            email = request.getHeader("X-User-Email");
        }
        if(email == null || email.isBlank()) {
            return null;
        }
        return usuarioService.buscarUsuarioPorEmail(email)
                .flatMap(usuario -> usuarioService.buscarUsuarioPorIdConRelaciones(usuario.getIdUsuario()))
                .orElse(null);
    }

    private boolean esAdmin(Usuario usuario) {
        return usuario.getRoles() != null && usuario.getRoles().stream().anyMatch(rol -> "ADMIN".equalsIgnoreCase(rol.getNombreRol()));
    }
}
