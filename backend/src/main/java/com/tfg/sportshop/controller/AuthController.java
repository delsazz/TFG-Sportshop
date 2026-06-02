package com.tfg.sportshop.controller;
import java.util.Map;
import java.util.List;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;
import java.nio.file.Path;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.ui.Model;
import com.tfg.sportshop.model.Roles;
import com.tfg.sportshop.model.Usuario;
import jakarta.servlet.http.HttpSession;
import com.tfg.sportshop.dto.LoginRequest;
import org.springframework.http.HttpHeaders;
import com.tfg.sportshop.services.RolesService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import com.tfg.sportshop.services.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import com.tfg.sportshop.security.JWTTokenProvider;
import org.springframework.security.core.Authentication;
import com.tfg.sportshop.dto.perfil.PerfilUsuarioResponse;
import com.tfg.sportshop.dto.perfil.ActualizarPerfilRequest;
import com.tfg.sportshop.dto.perfil.ActualizarPerfilResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.security.core.context.SecurityContextHolder;

// Anotación de Spring para indicar que es un controlador
@Controller
public class AuthController {

    // Anotación de Spring para inyección de dependencias
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private JWTTokenProvider jwtTokenProvider;

    @Autowired
    private RolesService rolesService;

    @Value("${app.upload.perfiles-dir:uploads/perfiles}")
    private String perfilesUploadDir;
    @GetMapping("/auth/login")
    public Object loginPage(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated()  && !auth.getPrincipal().equals("anonymousUser")) {
            return "redirect:/";
        }
        return "login";
    }

    @PostMapping("/auth/login")
    public String login(@RequestParam String email, @RequestParam String password, HttpSession session,
                        RedirectAttributes redirectAttributes, Model model) {
        Optional<Usuario> usuario;
        try {
            usuario = usuarioService.autenticar(email, password);
        } catch(IllegalStateException e) {
            if(e.getMessage() != null && e.getMessage().startsWith("LOGIN_COOLDOWN:")) {
                model.addAttribute("error", "Demasiados intentos. Espera " + segundosCooldown(e) + " segundos.");
                return "login";
            }
            throw e;
        }
        if(usuario.isPresent()) {
            session.setAttribute("usuario", usuario.get());
            session.setAttribute("usuarioId", usuario.get().getIdUsuario());
            session.setAttribute("usuarioEmail", usuario.get().getEmail());
            redirectAttributes.addFlashAttribute("success", "Bienvenido " + usuario.get().getNombre() );
            return "redirect:/";
        }
        model.addAttribute("error", "Email o contraseña incorrectos");
        return "login";
    }

    @PostMapping("/api/auth/login")
    @ResponseBody
    public ResponseEntity<?> loginApi(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        Optional<Usuario> usuario;
        try {
            usuario = usuarioService.autenticar(request.getEmail(), request.getPassword());
        } catch(IllegalStateException e) {
            if(e.getMessage() != null && e.getMessage().startsWith("LOGIN_COOLDOWN:")) {
                int segundos = segundosCooldown(e);
                return ResponseEntity.status(429).body(Map.of(
                        "message", "Demasiados intentos fallidos. Espera " + segundos + " segundos.",
                        "retryAfterSeconds", segundos));
            }
            throw e;
        }
        if(!usuario.isPresent()) {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciales incorrectas"));            
        }
        String token = jwtTokenProvider.generateToken(usuario.get().getEmail());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, httpRequest).toString())
                .body(new LoginResponse(token, usuario.get().getNombre(), usuario.get().getIdUsuario(), 
                usuario.get().getEmail(), usuario.get().getRoles() == null ? List.of() :
                        usuario.get().getRoles().stream().map(rol -> rol.getNombreRol().toLowerCase()).toList()));
    }

    @PostMapping("/api/auth/admin/login")
    @ResponseBody
    public ResponseEntity<?> loginAdminApi(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        Optional<Usuario> usuario;
        try {
            usuario = usuarioService.autenticar(request.getEmail(), request.getPassword());
        } catch(IllegalStateException e) {
            if(e.getMessage() != null && e.getMessage().startsWith("LOGIN_COOLDOWN:")) {
                int segundos = segundosCooldown(e);
                return ResponseEntity.status(429).body(Map.of(
                        "error", "Demasiados intentos fallidos. Espera " + segundos + " segundos.",
                        "retryAfterSeconds", segundos));
            }
            throw e;
        }
        if(usuario.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales incorrectas"));
        }
        Usuario usuarioAutenticado = usuario.get();
        if (!esAdmin(usuarioAutenticado)) {
            return ResponseEntity.status(403).body(Map.of("error", "Se requieren permisos de administrador"));
        }
        String token = jwtTokenProvider.generateToken(usuarioAutenticado.getEmail());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, httpRequest).toString())
                .body(Map.of("token", token, "usuario", Map.of("id", usuarioAutenticado.getIdUsuario(),
                        "email", usuarioAutenticado.getEmail(), "role", "admin" )));     
    }

    @PostMapping("/api/auth/logout")
    @ResponseBody
    public ResponseEntity<?> logoutApi(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, clearAuthCookie(request).toString())
                .body(Map.of("mensaje", "Sesion cerrada correctamente"));
    }



    @GetMapping("/api/admin")
    @ResponseBody
    public ResponseEntity<?> validarSesionAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuario usuario)) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
        }
        if(!esAdmin(usuario)) {
            return ResponseEntity.status(403).body(Map.of("error", "Se requieren permisos de administrador"));
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/api/auth/me")
    @ResponseBody
    public ResponseEntity<?> perfilActual(HttpServletRequest request) {
        Usuario usuario = getUsuarioDesdeToken(request);
        return ResponseEntity.ok(toPerfilResponse(usuario));
    }

    @PutMapping("/api/auth/me")
    @ResponseBody
    public ResponseEntity<?> actualizarPerfil(@RequestBody ActualizarPerfilRequest request, HttpServletRequest httpRequest) {
        Usuario usuario = getUsuarioDesdeToken(httpRequest);
        if(request.avatarUrl() != null) {
            usuario.setAvatarUrl(request.avatarUrl().trim());
        }
        if(request.email() != null) {
            String nuevoEmail = request.email().trim();
            usuarioService.buscarUsuarioPorEmail(nuevoEmail)
                    .filter(existente -> !existente.getIdUsuario().equals(usuario.getIdUsuario())).ifPresent(existente -> {
                        throw new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.BAD_REQUEST, "El email ya esta registrado");  
                    });
            usuario.setEmail(nuevoEmail);
        }
        Usuario actualizado = usuarioService.registrarUsuario(usuario);
        String token = jwtTokenProvider.generateToken(actualizado.getEmail());
        return ResponseEntity.ok(new ActualizarPerfilResponse("Perfil actualizado correctamente", token, toPerfilResponse(actualizado)));   
    }

    @PutMapping("/api/auth/me/password")
    @ResponseBody
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {  
        Usuario usuario = getUsuarioDesdeToken(httpRequest);
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");
        if(currentPassword == null || newPassword == null || confirmPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Datos invalidos"));
        }
        if(!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña actual no coincide"));
        }
        if(!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Las contraseñas nuevas no coinciden"));
        }
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok(Map.of("mensaje", "Contrasena cambiada correctamente"));
    }

    @PostMapping("/api/auth/me/avatar")
    @ResponseBody
    public ResponseEntity<?> subirAvatar(@RequestParam("file") MultipartFile file, HttpServletRequest httpRequest) {
        Usuario usuario = getUsuarioDesdeToken(httpRequest);
        if(file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Selecciona una imagen"));
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if(!contentType.equals("image/jpeg") && !contentType.equals("image/png")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Solo se permiten archivos jpg o png"));
        }
        try {
            Path uploadPath = Paths.get(perfilesUploadDir);
            Files.createDirectories(uploadPath);
            String extension = contentType.equals("image/png") ? ".png" : ".jpg";
            String filename = "perfil-" + usuario.getIdUsuario() + "-" + UUID.randomUUID() + extension;
            Path destino = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
            usuario.setAvatarUrl("/uploads/perfiles/" + filename);
            usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok(Map.of("avatarUrl", usuario.getAvatarUrl(), "usuario", toPerfilResponse(usuario)));
        } catch(Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "No se pudo subir la foto de perfil"));
        }
    }

    @GetMapping("/auth/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/auth/register")
    public String register(@RequestParam String nombre, @RequestParam String apellidos, @RequestParam String email,
                           @RequestParam String password, @RequestParam String confirmPassword, 
                           @RequestParam(required = false) String telefono,
                           @RequestParam(required = false) String direccion,
                           @RequestParam(required = false) String direccionCalle,
                           @RequestParam(required = false) String direccionNumero,
                           @RequestParam(required = false) String direccionPiso,
                           @RequestParam(required = false) String direccionCiudad,
                           @RequestParam(required = false) String direccionProvincia,
                           @RequestParam(required = false) String codigoPostal, Model model) {
        if(!password.equals(confirmPassword)) {
            model.addAttribute("error", "Las contraseñas no coinciden");
            return "register";
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setApellidos(apellidos);
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setTelefono(telefono);
        aplicarDireccion(usuario, direccion, direccionCalle, direccionNumero, direccionPiso, direccionCiudad, direccionProvincia, codigoPostal);
        
        // Asignar rol por defecto
        rolesService.bucarPorNombre("cliente").ifPresent(rol -> usuario.setRoles(List.of(rol)));

        // Registrar al usuario
        Usuario usuarioRegistrado = usuarioService.registrarUsuario(usuario);
        return "redirect:/auth/login";
    }

    @PostMapping("/api/auth/register")
    @ResponseBody
    public ResponseEntity<?> registerApi(@RequestBody Usuario usuario) {
        try {
            if(usuario.getEmail() == null || usuario.getPassword() == null) {
                return ResponseEntity.status(400).body(Map.of("message", "Email y contraseña son obligatorios."));
            }
            if(!Boolean.TRUE.equals(usuario.getCaptchaVerified())) {
                return ResponseEntity.status(400).body(Map.of("message", "Debes completar el captcha."));
            }
            Optional<Usuario> usuarioExistente = usuarioService.buscarUsuarioPorEmail(usuario.getEmail());
            if(usuarioExistente.isPresent()) {
                return ResponseEntity.status(400).body(Map.of("message", "El email ya está registrado."));
            }
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            aplicarDireccion(usuario, usuario.getDireccion(), usuario.getDireccionCalle(), usuario.getDireccionNumero(),
                    usuario.getDireccionPiso(), usuario.getDireccionCiudad(), usuario.getDireccionProvincia(),
                    usuario.getCodigoPostal());
           
            // Asignar rol por defecto cliente
            rolesService.bucarPorNombre("cliente").ifPresent(rol -> usuario.setRoles(List.of(rol)));
            Usuario usuarioRegistrado = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok(Map.of("message", "Usuario registrado correctamente"));
        } catch(Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error interno al registrarse."));
        }
    }

    @GetMapping("/auth/logout")
    public String logout(HttpSession session, RedirectAttributes redirectAttributes) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        redirectAttributes.addFlashAttribute("success", "Sesión cerrada correctamente");
        return "redirect:/";
    }

    private boolean esAdmin(Usuario usuario) {
        return usuario.getRoles() != null && usuario.getRoles().stream().anyMatch(rol -> "ADMIN".equalsIgnoreCase(rol.getNombreRol()));      
    }

    private int segundosCooldown(IllegalStateException e) {
        try {
            return Math.max(1, Integer.parseInt(e.getMessage().substring("LOGIN_COOLDOWN:".length())));
        } catch(Exception ex) {
            return 20;
        }
    }

    private Usuario getUsuarioDesdeToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        String email = null;
        if(authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            if(jwtTokenProvider.validateToken(token)) {
                email = jwtTokenProvider.getUsernameFromToken(token);
            }
        }

        if(email == null || email.isBlank()) {
            String cookieToken = extractTokenFromCookie(request);
            if(cookieToken != null && jwtTokenProvider.validateToken(cookieToken)) {
                email = jwtTokenProvider.getUsernameFromToken(cookieToken);
            }
        }

        if(email == null || email.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return usuarioService.buscarUsuarioPorEmail(email)
                .flatMap(usuario -> usuarioService.buscarUsuarioPorIdConRelaciones(usuario.getIdUsuario()))
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));         
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if(cookies == null) {
            return null;
        }
        return Arrays.stream(cookies).filter(cookie -> "sportshop_auth".equals(cookie.getName()))
                .map(Cookie::getValue).findFirst().orElse(null);
    }

    private ResponseCookie buildAuthCookie(String token, HttpServletRequest request) {
        return ResponseCookie.from("sportshop_auth", token).httpOnly(true).secure(request.isSecure())   
                .sameSite("Lax").path("/").maxAge(java.time.Duration.ofDays(1)).build();         
    }

    private ResponseCookie clearAuthCookie(HttpServletRequest request) {
        return ResponseCookie.from("sportshop_auth", "").httpOnly(true).secure(request.isSecure())
                .sameSite("Lax").path("/").maxAge(java.time.Duration.ZERO).build();    
    }

    private PerfilUsuarioResponse toPerfilResponse(Usuario usuario) {
        return new PerfilUsuarioResponse(usuario.getIdUsuario(), usuario.getNombre(), usuario.getApellidos(),
                usuario.getEmail(), usuario.getTelefono() != null ? usuario.getTelefono() : "",
                usuario.getDireccion() != null ? usuario.getDireccion() : "",
                usuario.getDireccionCalle() != null ? usuario.getDireccionCalle() : "",
                usuario.getDireccionNumero() != null ? usuario.getDireccionNumero() : "",
                usuario.getDireccionPiso() != null ? usuario.getDireccionPiso() : "",
                usuario.getDireccionCiudad() != null ? usuario.getDireccionCiudad() : "",
                usuario.getDireccionProvincia() != null ? usuario.getDireccionProvincia() : "",
                usuario.getCodigoPostal() != null ? usuario.getCodigoPostal() : "",
                usuario.getAvatarUrl() != null ? usuario.getAvatarUrl() : "",
                Math.toIntExact(usuarioService.contarPedidosUsuario(usuario.getIdUsuario())),
                usuario.getRoles() == null ? List.of() : usuario.getRoles().stream().map(Roles::getNombreRol).toList());                     
    }

    private void aplicarDireccion(Usuario usuario, String direccion, String calle, String numero, String piso, String ciudad,
            String provincia, String codigoPostal) {
        // If all address components are null, do nothing
        if (java.util.stream.Stream.of(direccion, calle, numero, piso, ciudad, provincia, codigoPostal)
                .allMatch(v -> v == null)) {
            return;
        }
        // Normalize and set individual fields
        usuario.setDireccionCalle(normalizar(calle));
        usuario.setDireccionNumero(normalizar(numero));
        usuario.setDireccionPiso(normalizar(piso));
        usuario.setDireccionCiudad(normalizar(ciudad));
        usuario.setDireccionProvincia(normalizar(provincia));
        usuario.setCodigoPostal(normalizar(codigoPostal));

        // Build address string in required format: "Calle <calle>, <numero>, <piso> - <ciudad> <provincia> <codigoPostal>"
        StringBuilder sb = new StringBuilder();
        if (usuario.getDireccionCalle() != null) {
            sb.append("Calle ").append(usuario.getDireccionCalle());
        }
        if (usuario.getDireccionNumero() != null) {
            sb.append(", ").append(usuario.getDireccionNumero());
        }
        if (usuario.getDireccionPiso() != null) {
            sb.append(", ").append(usuario.getDireccionPiso());
        }
        // location part
        boolean hasLocation = false;
        if (usuario.getDireccionCiudad() != null) {
            sb.append(" - ").append(usuario.getDireccionCiudad());
            hasLocation = true;
        }
        if (usuario.getDireccionProvincia() != null) {
            if (hasLocation) sb.append(" ");
            sb.append(usuario.getDireccionProvincia());
            hasLocation = true;
        }
        if (usuario.getCodigoPostal() != null) {
            if (hasLocation) sb.append(" ");
            sb.append(usuario.getCodigoPostal());
        }
        String direccionCompuesta = sb.toString().trim();
        usuario.setDireccion(direccionCompuesta.isEmpty() ? (direccion != null ? normalizar(direccion) : null) : direccionCompuesta);
    }
        if(java.util.stream.Stream.of(direccion, calle, numero, piso, ciudad, provincia, codigoPostal).allMatch(valor -> valor == null)) {
            return;
        }
        usuario.setDireccionCalle(normalizar(calle));
        usuario.setDireccionNumero(normalizar(numero));
        usuario.setDireccionPiso(normalizar(piso));
        usuario.setDireccionCiudad(normalizar(ciudad));
        usuario.setDireccionProvincia(normalizar(provincia));
        usuario.setCodigoPostal(normalizar(codigoPostal));
        // Build address string in required format
        StringBuilder sb = new StringBuilder();
        if(usuario.getDireccionCalle() != null) {
            sb.append("Calle ").append(usuario.getDireccionCalle());
        }
        if(usuario.getDireccionNumero() != null) {
            sb.append(", ").append(usuario.getDireccionNumero());
        }
        if(usuario.getDireccionPiso() != null) {
            sb.append(", ").append(usuario.getDireccionPiso());
        }
        // location part
        boolean hasLocation = false;
        if(usuario.getDireccionCiudad() != null) {
            sb.append(" - ").append(usuario.getDireccionCiudad());
            hasLocation = true;
        }
        if(usuario.getDireccionProvincia() != null) {
            if(hasLocation) sb.append(" ");
            sb.append(usuario.getDireccionProvincia());
            hasLocation = true;
        }
        if(usuario.getCodigoPostal() != null) {
            if(hasLocation) sb.append(" ");
            sb.append(usuario.getCodigoPostal());
        }
        String direccionCompuesta = sb.toString().trim();
        usuario.setDireccion(direccionCompuesta.isEmpty() ? (direccion != null ? normalizar(direccion) : null) : direccionCompuesta);
    }


    private String normalizar(String valor) {
        if(valor == null) {
            return null;
        }
        String limpio = valor.trim();
        return limpio.isEmpty() ? null : limpio;
    }

    private String construirDireccion(Usuario usuario) {
        String via = java.util.stream.Stream.of( usuario.getDireccionCalle(), usuario.getDireccionNumero(), usuario.getDireccionPiso())
                .filter(valor -> valor != null && !valor.isBlank()).reduce((actual, siguiente) -> actual + ", " + siguiente).orElse("");       
        String localidad = java.util.stream.Stream.of(usuario.getCodigoPostal(), usuario.getDireccionCiudad(), usuario.getDireccionProvincia())
                .filter(valor -> valor != null && !valor.isBlank()).reduce((actual, siguiente) -> actual + " " + siguiente).orElse("");      
        return java.util.stream.Stream.of(via, localidad).filter(valor -> valor != null && !valor.isBlank())
                .reduce((actual, siguiente) -> actual + " - " + siguiente).orElse("");  
    }
}
