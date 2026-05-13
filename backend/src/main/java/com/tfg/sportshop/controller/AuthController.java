package com.tfg.sportshop.controller;
import java.util.Map;
import java.util.List;
import java.util.Arrays;
import java.util.Optional;
import jakarta.servlet.http.Cookie;
import org.springframework.ui.Model;
import com.tfg.sportshop.model.Roles;
import com.tfg.sportshop.model.Usuario;
import jakarta.servlet.http.HttpSession;
import com.tfg.sportshop.dto.LoginRequest;
import com.tfg.sportshop.dto.LoginResponse;
import org.springframework.http.HttpHeaders;
import com.tfg.sportshop.services.RolesService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import com.tfg.sportshop.services.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import com.tfg.sportshop.dto.ResetPasswordRequest;
import com.tfg.sportshop.dto.ForgotPasswordRequest;
import com.tfg.sportshop.security.JWTTokenProvider;
import com.tfg.sportshop.services.PasswordResetService;
import com.tfg.sportshop.services.RegistroEmailService;
import com.tfg.sportshop.services.CorreoTemplateService;
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
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RolesService rolesService;
    @Autowired
    private RegistroEmailService registroEmailService;
    @Autowired
    private PasswordResetService passwordResetService;
    @Autowired
    private CorreoTemplateService correoTemplateService;
    @GetMapping("/auth/login")
    public Object loginPage(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated()  && !auth.getPrincipal().equals("anonymousUser")) {
            return "redirect:/";
        }
        return "login";
    }

    @PostMapping("/auth/login")
    public String login(@RequestParam String email,
                        @RequestParam String password,
                        HttpSession session,
                        RedirectAttributes redirectAttributes,
                        Model model) {

        Optional<Usuario> usuario = usuarioService.autenticar(email, password);
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
        Optional<Usuario> usuario = usuarioService.autenticar(request.getEmail(), request.getPassword());
        if(!usuario.isPresent()) {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciales incorrectas"));            
        }
        String token = jwtTokenProvider.generateToken(usuario.get().getEmail());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, httpRequest).toString())
                .body(new LoginResponse(
                token,
                usuario.get().getNombre(),
                usuario.get().getIdUsuario(),
                usuario.get().getEmail(),
                usuario.get().getRoles() == null ? List.of() :
                        usuario.get().getRoles().stream().map(rol -> rol.getNombreRol().toLowerCase()).toList()
        ));
    }

    @PostMapping("/api/auth/admin/login")
    @ResponseBody
    public ResponseEntity<?> loginAdminApi(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        Optional<Usuario> usuario = usuarioService.autenticar(request.getEmail(), request.getPassword());
        if (usuario.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales incorrectas"));
        }

        Usuario usuarioAutenticado = usuario.get();
        if (!esAdmin(usuarioAutenticado)) {
            return ResponseEntity.status(403).body(Map.of("error", "Se requieren permisos de administrador"));
        }

        String token = jwtTokenProvider.generateToken(usuarioAutenticado.getEmail());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, httpRequest).toString())
                .body(Map.of(
                "token", token,
                "usuario", Map.of(
                        "id", usuarioAutenticado.getIdUsuario(),
                        "email", usuarioAutenticado.getEmail(),
                        "role", "admin"
                )
        ));
    }

    @PostMapping("/api/auth/logout")
    @ResponseBody
    public ResponseEntity<?> logoutApi(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearAuthCookie(request).toString())
                .body(Map.of("mensaje", "Sesion cerrada correctamente"));
    }

    @PostMapping("/api/auth/forgot-password")
    @ResponseBody
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request == null || request.email() == null || request.email().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El email es obligatorio"));
        }

        passwordResetService.solicitarRecuperacion(request.email());
        return ResponseEntity.ok(Map.of(
                "message",
                "Si el email esta registrado, recibiras un codigo de verificacion en unos minutos"
        ));
    }

    @PostMapping("/api/auth/reset-password")
    @ResponseBody
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.restablecerPassword(request);
            return ResponseEntity.ok(Map.of("message", "Contrasena actualizada correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/api/admin")
    @ResponseBody
    public ResponseEntity<?> validarSesionAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuario usuario)) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
        }
        if (!esAdmin(usuario)) {
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
    public ResponseEntity<?> actualizarPerfil(
            @RequestBody ActualizarPerfilRequest request,
            HttpServletRequest httpRequest) {
        Usuario usuario = getUsuarioDesdeToken(httpRequest);

        if (request.nombre() != null) usuario.setNombre(request.nombre().trim());
        if (request.apellidos() != null) usuario.setApellidos(request.apellidos().trim());
        if (request.telefono() != null) usuario.setTelefono(request.telefono().trim());
        aplicarDireccion(
                usuario,
                request.direccion(),
                request.direccionCalle(),
                request.direccionNumero(),
                request.direccionPiso(),
                request.direccionCiudad(),
                request.direccionProvincia(),
                request.codigoPostal()
        );

        if (request.email() != null) {
            String nuevoEmail = request.email().trim();
            usuarioService.buscarUsuarioPorEmail(nuevoEmail)
                    .filter(existente -> !existente.getIdUsuario().equals(usuario.getIdUsuario()))
                    .ifPresent(existente -> {
                        throw new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.BAD_REQUEST,
                                "El email ya esta registrado"
                        );
                    });
            usuario.setEmail(nuevoEmail);
        }

        Usuario actualizado = usuarioService.registrarUsuario(usuario);
        String token = jwtTokenProvider.generateToken(actualizado.getEmail());

        return ResponseEntity.ok(new ActualizarPerfilResponse(
                "Perfil actualizado correctamente",
                token,
                toPerfilResponse(actualizado)
        ));
    }

    @PutMapping("/api/auth/me/password")
    @ResponseBody
    public ResponseEntity<?> cambiarPassword(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        Usuario usuario = getUsuarioDesdeToken(httpRequest);
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Datos invalidos"));
        }

        if (!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contrasena actual es incorrecta"));
        }

        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioService.registrarUsuario(usuario);
        correoTemplateService.enviarCambioPassword(usuario);

        return ResponseEntity.ok(Map.of("mensaje", "Contrasena cambiada correctamente"));
    }

    @GetMapping("/auth/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/auth/register")
    public String register(@RequestParam String nombre,
                           @RequestParam String apellidos,
                           @RequestParam String email,
                           @RequestParam String password,
                           @RequestParam String confirmPassword,
                           @RequestParam(required = false) String telefono,
                           @RequestParam(required = false) String direccion,
                           @RequestParam(required = false) String direccionCalle,
                           @RequestParam(required = false) String direccionNumero,
                           @RequestParam(required = false) String direccionPiso,
                           @RequestParam(required = false) String direccionCiudad,
                           @RequestParam(required = false) String direccionProvincia,
                           @RequestParam(required = false) String codigoPostal,
                           Model model) {

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
        registroEmailService.enviarConfirmacionRegistro(usuarioRegistrado);
        return "redirect:/auth/login";
    }

    @PostMapping("/api/auth/register")
    @ResponseBody
    public ResponseEntity<?> registerApi(@RequestBody Usuario usuario) {
        try {
            if (usuario.getEmail() == null || usuario.getPassword() == null) {
                return ResponseEntity.status(400).body(Map.of("message", "Email y contraseña son obligatorios."));
            }
            Optional<Usuario> usuarioExistente = usuarioService.buscarUsuarioPorEmail(usuario.getEmail());
            if (usuarioExistente.isPresent()) {
                return ResponseEntity.status(400).body(Map.of("message", "El email ya está registrado."));
            }
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            aplicarDireccion(
                    usuario,
                    usuario.getDireccion(),
                    usuario.getDireccionCalle(),
                    usuario.getDireccionNumero(),
                    usuario.getDireccionPiso(),
                    usuario.getDireccionCiudad(),
                    usuario.getDireccionProvincia(),
                    usuario.getCodigoPostal()
            );
            
            // Asignar rol por defecto cliente
            rolesService.bucarPorNombre("cliente").ifPresent(rol -> usuario.setRoles(List.of(rol)));
            Usuario usuarioRegistrado = usuarioService.registrarUsuario(usuario);
            registroEmailService.enviarConfirmacionRegistro(usuarioRegistrado);
            return ResponseEntity.ok(Map.of("message", "Usuario registrado correctamente"));
        } catch (Exception e) {
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
        return usuario.getRoles() != null && usuario.getRoles().stream()
                .anyMatch(rol -> "ADMIN".equalsIgnoreCase(rol.getNombreRol()));
    }

    private Usuario getUsuarioDesdeToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        String email = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                email = jwtTokenProvider.getUsernameFromToken(token);
            }
        }

        if (email == null || email.isBlank()) {
            String cookieToken = extractTokenFromCookie(request);
            if (cookieToken != null && jwtTokenProvider.validateToken(cookieToken)) {
                email = jwtTokenProvider.getUsernameFromToken(cookieToken);
            }
        }

        if (email == null || email.isBlank()) {
            email = request.getHeader("X-User-Email");
        }

        if (email == null || email.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Usuario no autenticado"
            );
        }

        return usuarioService.buscarUsuarioPorEmail(email)
                .flatMap(usuario -> usuarioService.buscarUsuarioPorIdConRelaciones(usuario.getIdUsuario()))
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED,
                        "Usuario no autenticado"
                ));
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
                .filter(cookie -> "campusfp_auth".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private ResponseCookie buildAuthCookie(String token, HttpServletRequest request) {
        return ResponseCookie.from("campusfp_auth", token)
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(java.time.Duration.ofDays(1))
                .build();
    }

    private ResponseCookie clearAuthCookie(HttpServletRequest request) {
        return ResponseCookie.from("campusfp_auth", "")
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(java.time.Duration.ZERO)
                .build();
    }

    private PerfilUsuarioResponse toPerfilResponse(Usuario usuario) {
        return new PerfilUsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getApellidos(),
                usuario.getEmail(),
                usuario.getTelefono() != null ? usuario.getTelefono() : "",
                usuario.getDireccion() != null ? usuario.getDireccion() : "",
                usuario.getDireccionCalle() != null ? usuario.getDireccionCalle() : "",
                usuario.getDireccionNumero() != null ? usuario.getDireccionNumero() : "",
                usuario.getDireccionPiso() != null ? usuario.getDireccionPiso() : "",
                usuario.getDireccionCiudad() != null ? usuario.getDireccionCiudad() : "",
                usuario.getDireccionProvincia() != null ? usuario.getDireccionProvincia() : "",
                usuario.getCodigoPostal() != null ? usuario.getCodigoPostal() : "",
                Math.toIntExact(usuarioService.contarPedidosUsuario(usuario.getIdUsuario())),
                usuario.getRoles() == null ? List.of() :
                        usuario.getRoles().stream().map(Roles::getNombreRol).toList()
        );
    }

    private void aplicarDireccion(
            Usuario usuario,
            String direccion,
            String calle,
            String numero,
            String piso,
            String ciudad,
            String provincia,
            String codigoPostal) {
        if (List.of(direccion, calle, numero, piso, ciudad, provincia, codigoPostal).stream().allMatch(valor -> valor == null)) {
            return;
        }

        usuario.setDireccionCalle(normalizar(calle));
        usuario.setDireccionNumero(normalizar(numero));
        usuario.setDireccionPiso(normalizar(piso));
        usuario.setDireccionCiudad(normalizar(ciudad));
        usuario.setDireccionProvincia(normalizar(provincia));
        usuario.setCodigoPostal(normalizar(codigoPostal));

        String direccionCompuesta = construirDireccion(usuario);
        usuario.setDireccion(direccionCompuesta.isBlank() ? normalizar(direccion) : direccionCompuesta);
    }

    private String normalizar(String valor) {
        if (valor == null) {
            return null;
        }

        String limpio = valor.trim();
        return limpio.isEmpty() ? null : limpio;
    }

    private String construirDireccion(Usuario usuario) {
        String via = List.of(
                        usuario.getDireccionCalle(),
                        usuario.getDireccionNumero(),
                        usuario.getDireccionPiso()
                ).stream()
                .filter(valor -> valor != null && !valor.isBlank())
                .reduce((actual, siguiente) -> actual + ", " + siguiente)
                .orElse("");

        String localidad = List.of(
                        usuario.getCodigoPostal(),
                        usuario.getDireccionCiudad(),
                        usuario.getDireccionProvincia()
                ).stream()
                .filter(valor -> valor != null && !valor.isBlank())
                .reduce((actual, siguiente) -> actual + " " + siguiente)
                .orElse("");

        return List.of(via, localidad).stream()
                .filter(valor -> valor != null && !valor.isBlank())
                .reduce((actual, siguiente) -> actual + " - " + siguiente)
                .orElse("");
    }
}