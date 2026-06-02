package com.tfg.sportshop.controller;
import java.util.Map;
import java.util.List;
import jakarta.validation.Valid;
import com.tfg.sportshop.model.Roles;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.services.RolesService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import com.tfg.sportshop.services.UsuarioService;
import org.springframework.web.bind.annotation.*;
import com.tfg.sportshop.security.JWTTokenProvider;
import com.tfg.sportshop.dto.admin.AdminRolResponse;
import com.tfg.sportshop.dto.admin.AdminUsuarioResponse;
import org.springframework.security.core.Authentication;
import com.tfg.sportshop.dto.perfil.PerfilUsuarioResponse;
import com.tfg.sportshop.dto.admin.AdminCrearUsuarioRequest;
import com.tfg.sportshop.dto.perfil.ActualizarPerfilRequest;
import com.tfg.sportshop.dto.perfil.ActualizarPerfilResponse;
import com.tfg.sportshop.dto.admin.AdminActualizarUsuarioRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
public class UsuarioController {
    private final UsuarioService usuarioService;
    private final RolesService rolesService;
    private final PasswordEncoder passwordEncoder;
    private final JWTTokenProvider jwtTokenProvider;
    public UsuarioController(UsuarioService usuarioService, RolesService rolesService,
            PasswordEncoder passwordEncoder, JWTTokenProvider jwtTokenProvider) {
        this.usuarioService = usuarioService;
        this.rolesService = rolesService;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }


    @GetMapping("/api/usuarios/me")
    public ResponseEntity<?> getUsuarioActual(HttpServletRequest request) {
        Usuario usuario = usuarioAutenticadoDesdeBd(request);
        return ResponseEntity.ok(toPerfilResponse(usuario));
    }

    @PutMapping("/api/usuarios/me")
    public ResponseEntity<?> actualizarPerfil(@RequestBody ActualizarPerfilRequest datos, HttpServletRequest request) {
        Usuario usuario = usuarioAutenticadoDesdeBd(request);
        if(datos.nombre() != null) {
            usuario.setNombre(datos.nombre().trim());
        } 
        if(datos.apellidos() != null) {
            usuario.setApellidos(datos.apellidos().trim());
        } 
        if(datos.telefono() != null) {
            usuario.setTelefono(datos.telefono().trim());
        } 
        if(datos.avatarUrl() != null) {
            usuario.setAvatarUrl(datos.avatarUrl().trim());
        }
        aplicarDireccion(usuario, datos.direccion(), datos.direccionCalle(),  datos.direccionNumero(), 
                datos.direccionPiso(), datos.direccionCiudad(), datos.direccionProvincia(), datos.codigoPostal());
        if(datos.email() != null) {
            String nuevoEmail = datos.email().trim();
            usuarioService.buscarUsuarioPorEmail(nuevoEmail)
                    .filter(existente -> !existente.getIdUsuario().equals(usuario.getIdUsuario()))
                    .ifPresent(existente -> {
                        throw new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.BAD_REQUEST, "El email ya esta registrado");
                    });
            usuario.setEmail(nuevoEmail);
        }
        Usuario actualizado = usuarioService.registrarUsuario(usuario);
        String nuevoToken = jwtTokenProvider.generateToken(actualizado.getEmail());
        return ResponseEntity.ok(new ActualizarPerfilResponse("Perfil actualizado correctamente", nuevoToken, 
                toPerfilResponse(actualizado)));
        
    }

    @PutMapping("/api/usuarios/me/password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        Usuario usuario = usuarioAutenticadoDesdeBd(httpRequest);
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");
        if(currentPassword == null || newPassword == null || confirmPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Datos inválidos"));
        }
        if(!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña actual no coincide"));
        }
        if(!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Las contraseñas nuevas no coinciden"));
        }
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña cambiada correctamente"));
    }

    @GetMapping("/api/usuarios")
    public List<AdminUsuarioResponse> verUsuarios() {
        requireAdmin();
        return usuarioService.verUsuarios().stream().map(this::toUsuarioResponse).toList();
    }

    @GetMapping("/api/roles")
    public List<AdminRolResponse> verRoles() {
        requireAdmin();
        return rolesService.verRoles().stream().map(this::toRolResponse).toList();
    }

    @PostMapping("/api/usuarios")
    public ResponseEntity<AdminUsuarioResponse> crearUsuario(@Valid @RequestBody AdminCrearUsuarioRequest request) {
        requireAdmin();
        if(usuarioService.buscarUsuarioPorEmail(request.email()).isPresent()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "El email ya esta registrado");
        }
        Roles rol = rolesService.bucarPorNombre(request.rol())
                .or(() -> rolesService.bucarPorNombre(request.rol().toLowerCase()))
                .or(() -> rolesService.bucarPorNombre(request.rol().toUpperCase()))
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Rol no valido"));
        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setApellidos(request.apellidos());
        usuario.setEmail(request.email());
        usuario.setPassword(passwordEncoder.encode(request.password()));
        usuario.setTelefono(request.telefono());
        usuario.setDireccion(request.direccion());
        usuario.setRoles(List.of(rol));
        Usuario creado = usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok(toUsuarioResponse(creado));
    }

    @PutMapping("/api/admin/usuarios/{idUsuario}")
    public ResponseEntity<AdminUsuarioResponse> actualizarUsuarioAdmin(@PathVariable Integer idUsuario,
            @RequestBody AdminActualizarUsuarioRequest request) {
        requireAdmin();
        Usuario usuario = usuarioService.buscarUsuarioPorId(idUsuario)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Usuario no encontrado"));   
        if(request.nombre() != null) {
            usuario.setNombre(request.nombre());
        } 
        if(request.apellidos() != null) {
            usuario.setApellidos(request.apellidos());
        } 
        if(request.email() != null) {
            usuario.setEmail(request.email());
        } 
        if(request.telefono() != null) {
            usuario.setTelefono(request.telefono());
        } 
        if(request.direccion() != null) {
            usuario.setDireccion(request.direccion());
        } 
        Usuario actualizado = usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok(toUsuarioResponse(actualizado));
    }

    @DeleteMapping("/api/admin/usuarios/{idUsuario}")
    public ResponseEntity<Void> eliminarUsuarioAdmin(@PathVariable Integer idUsuario) {
        requireAdmin();
        boolean eliminado = usuarioService.eliminarUsuario(idUsuario);
        if(!eliminado) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Usuario no encontrado"  
            );
        }
        return ResponseEntity.noContent().build();
    }

    private AdminUsuarioResponse toUsuarioResponse(Usuario usuario) {
        return new AdminUsuarioResponse(usuario.getIdUsuario(), usuario.getNombre(), usuario.getApellidos(), usuario.getEmail(),
                usuario.getTelefono(), usuario.getDireccion(), usuario.getPedidos() == null ? 0 : usuario.getPedidos().size(),
                usuario.getRoles() == null ? List.of() : usuario.getRoles().stream().map(this::toRolResponse).toList()           
        );
    }

    private AdminRolResponse toRolResponse(Roles rol) {
        return new AdminRolResponse(rol.getIdRol(), rol.getNombreRol());
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
                usuario.getRoles() == null ? List.of() : usuario.getRoles().stream().map(Roles::getNombreRol).toList()              
        );
    }

    private void aplicarDireccion(Usuario usuario, String direccion, String calle, String numero, String piso, String ciudad,
            String provincia, String codigoPostal) {
        if(List.of(direccion, calle, numero, piso, ciudad, provincia, codigoPostal).stream().allMatch(valor -> valor == null)) {
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
        if(valor == null) {
            return null;
        }
        String limpio = valor.trim();
        return limpio.isEmpty() ? null : limpio;
    }

    private String construirDireccion(Usuario usuario) {
        String via = List.of(usuario.getDireccionCalle(), usuario.getDireccionNumero(), usuario.getDireccionPiso()).stream()
                .filter(valor -> valor != null && !valor.isBlank()).reduce((actual, siguiente) -> actual + ", " + siguiente).orElse("");
        String localidad = List.of(usuario.getCodigoPostal(), usuario.getDireccionCiudad(), usuario.getDireccionProvincia()).stream()
                .filter(valor -> valor != null && !valor.isBlank()).reduce((actual, siguiente) -> actual + " " + siguiente).orElse("");
        return List.of(via, localidad).stream().filter(valor -> valor != null && !valor.isBlank())
                .reduce((actual, siguiente) -> actual + " - " + siguiente).orElse("");
                
    }

    private Usuario usuarioAutenticadoDesdeBd(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            if(principal instanceof Usuario usuario) {
                return cargarUsuarioConRelaciones(usuario.getIdUsuario());
            }
            if(!(principal instanceof String principalTexto && "anonymousUser".equalsIgnoreCase(principalTexto))) {
                return usuarioService.buscarUsuarioPorEmail(auth.getName()).map(Usuario::getIdUsuario)
                        .map(this::cargarUsuarioConRelaciones)
                        .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));                  
            }
        }
        String token = extractJwtFromRequest(request);
        if(token == null || !jwtTokenProvider.validateToken(token)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        String email = jwtTokenProvider.getUsernameFromToken(token);
        return usuarioService.buscarUsuarioPorEmail(email).map(Usuario::getIdUsuario).map(this::cargarUsuarioConRelaciones)     
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));
    }

    private Usuario cargarUsuarioConRelaciones(Integer idUsuario) {
        return usuarioService.buscarUsuarioPorIdConRelaciones(idUsuario)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if(token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return null;
    }

    private void requireAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(authority -> "ROLE_ADMIN".equalsIgnoreCase(authority.getAuthority()));
        if(!isAdmin) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Se requieren permisos de administrador");
        }
    }
}
