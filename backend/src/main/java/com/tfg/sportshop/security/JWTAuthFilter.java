package com.tfg.sportshop.security;

import java.util.Arrays;
import java.io.IOException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.FilterChain;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.ServletException;
import com.tfg.sportshop.model.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import com.tfg.sportshop.services.UsuarioService;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Component
@RequiredArgsConstructor
public class JWTAuthFilter extends OncePerRequestFilter {
    private final JWTTokenProvider tokenJWT;
    private final UsuarioService usuarioService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/")
                || path.startsWith("/auth/")
                || ("/api/pagos/webhook".equals(path) && "POST".equalsIgnoreCase(request.getMethod()))
                || ("/api/configuracion".equals(path) && "GET".equalsIgnoreCase(request.getMethod()))
                || (path.startsWith("/api/catalogo/") && "GET".equalsIgnoreCase(request.getMethod()))
                || (path.startsWith("/api/categorias/") && "GET".equalsIgnoreCase(request.getMethod()))
                || ("/api/categorias".equals(path) && "GET".equalsIgnoreCase(request.getMethod()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest solicitud, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
         try {
             String jwt = extractJwtFromRequest(solicitud);
             logger.info("JWT Token extraído: " + (jwt != null ? "SÍ" : "NO"));
             
             Usuario usuario = null;
             String email = null;

             if (jwt != null && tokenJWT.validateToken(jwt)) {
                 logger.info("✅ Token válido");
                 email = tokenJWT.getUsernameFromToken(jwt);
                 logger.info("  Email del token: " + email);
                 usuario = usuarioService.buscarUsuarioPorEmail(email).orElse(null);
                 logger.info("  Usuario encontrado: " + (usuario != null ? "✅" : "❌"));
                 
                 if (usuario != null) {
                     logger.info("  Cargando relaciones (JWT)...");
                     usuario = usuarioService.buscarUsuarioPorIdConRelaciones(usuario.getIdUsuario()).orElse(usuario);
                     int roles = usuario.getRoles() != null ? usuario.getRoles().size() : 0;
                     logger.info("  Roles cargados: " + roles);
                 }
             } else {
                 if (jwt == null) {
                     logger.info("⚠️ Sin JWT en Authorization ni en cookies");
                 } else {
                     logger.warn("❌ Token JWT NO válido");
                 }
             }

             if (usuario == null) {
                 String fallbackEmail = solicitud.getHeader("X-User-Email");
                 if (fallbackEmail != null && !fallbackEmail.isBlank()) {
                     logger.info("⚠️ Usando X-User-Email: " + fallbackEmail);
                     usuario = usuarioService.buscarUsuarioPorEmail(fallbackEmail).orElse(null);
                     email = fallbackEmail;
                     logger.info("  Usuario encontrado: " + (usuario != null ? "✅" : "❌"));

                     if (usuario != null) {
                         logger.info("  Cargando relaciones (respaldo)...");
                         usuario = usuarioService.buscarUsuarioPorIdConRelaciones(usuario.getIdUsuario()).orElse(usuario);
                         int roles = usuario.getRoles() != null ? usuario.getRoles().size() : 0;
                         logger.info("  Roles cargados: " + roles);
                     }
                 } else {
                     logger.info("❌ Sin X-User-Email header");
                 }
             }

             if (usuario != null) {
                 var autoridades = (usuario.getRoles() != null ? usuario.getRoles() : java.util.List.<com.tfg.sportshop.model.Roles>of())
                         .stream()
                         .map(rol -> new SimpleGrantedAuthority("ROLE_" + rol.getNombreRol().toUpperCase()))
                         .toList();

                 logger.info("✅ AUTENTICADO: " + email + " (" + autoridades.size() + " autoridades)");
                 for (var auth : autoridades) {
                     logger.info("    ├─ " + auth.getAuthority());
                 }
                 UsernamePasswordAuthenticationToken aut = new UsernamePasswordAuthenticationToken(usuario, null, autoridades);
                 aut.setDetails(new WebAuthenticationDetailsSource().buildDetails(solicitud));
                 SecurityContextHolder.getContext().setAuthentication(aut);
             } else {
                 logger.warn("❌ NO AUTENTICADO: token inválido + sin usuario de respaldo");
             }
         } catch(Exception e) {
             logger.error("❌ ERROR en filtro JWT", e);
         }
        filterChain.doFilter(solicitud, response);
    }
    private String extractJwtFromRequest(HttpServletRequest solicitud) {
        String token = solicitud.getHeader("Authorization");
        if(token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        Cookie[] cookies = solicitud.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
                .filter(cookie -> "sportshop_auth".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
