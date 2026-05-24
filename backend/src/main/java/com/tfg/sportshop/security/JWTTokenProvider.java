package com.tfg.sportshop.security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
@Component
public class JWTTokenProvider {
    @Value("esta_es_una_clave_secreta_muy_larga_que_debe_tener_al_menos_64_caracteres_para_evitar_errores_de_algoritmo_hs512_123456")
    private String jwt;
    @Value("${jwt.expiration:86400000}")
    private long expiracion;
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwt.getBytes());
    }
    public String generateToken(String usuario) {
        return Jwts.builder()
            .subject(usuario)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiracion))
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser().verifyWith(getSigningKey()).build()
            .parseSignedClaims(token).getPayload();
        return claims.getSubject();
    }
}