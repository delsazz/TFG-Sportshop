package com.campusfp.uniformes.security;

import java.util.Arrays;
import java.io.IOException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.FilterChain;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.ServletException;
import com.campusfp.uniformes.model.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import com.campusfp.uniformes.services.UsuarioService;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

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
                || (path.startsWith("/api/catalogo/") && "GET".equalsIgnoreCase(request.getMethod()))
                || (path.startsWith("/api/categorias/") && "GET".equalsIgnoreCase(request.getMethod()))
                || ("/api/categorias".equals(path) && "GET".equalsIgnoreCase(request.getMethod()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest solicitud, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = extractJwtFromRequest(solicitud);
            logger.debug("JWT Token extraído: " + (jwt != null ? "SÍ" : "NO"));
            
            if(jwt != null && tokenJWT.validateToken(jwt)) {
                logger.debug("Token válido");
                String email = tokenJWT.getUsernameFromToken(jwt);
                logger.debug("Email del token: " + email);
                
                Usuario usuario = usuarioService.buscarUsuarioPorEmail(email).orElse(null);
                logger.debug("Usuario encontrado: " + (usuario != null ? usuario.getCorreoElectronico() : "NO"));

                if (usuario != null) {
                    var authorities = java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                    "ROLE_" + usuario.getRol().toUpperCase()
                            ));
                    
                    logger.debug("Autoridades asignadas: " + authorities.size());
                    UsernamePasswordAuthenticationToken aut =  new UsernamePasswordAuthenticationToken(usuario, null, authorities);                  
                    aut.setDetails(new WebAuthenticationDetailsSource().buildDetails(solicitud));
                    SecurityContextHolder.getContext().setAuthentication(aut);
                    logger.debug("Usuario autenticado: " + email);
                } else {
                    logger.debug("Usuario no encontrado en BD para email: " + email);
                }
            } else {
                logger.debug("Token no válido o no presente");
            }
        } catch(Exception e) {
            logger.error("No se puede autenticar al usuario", e);
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
                .filter(cookie -> "campusfp_auth".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
