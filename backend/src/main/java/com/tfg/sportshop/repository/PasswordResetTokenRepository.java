package com.tfg.sportshop.repository;

import com.tfg.sportshop.model.PasswordResetToken;
import com.tfg.sportshop.model.Usuario;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    List<PasswordResetToken> findByUsuarioAndFechaUsoIsNullAndFechaExpiracionAfterOrderByFechaCreacionDesc(
            Usuario usuario,
            Instant ahora
    );

    @Modifying
    @Query("""
            UPDATE PasswordResetToken token
            SET token.fechaUso = :fechaUso
            WHERE token.usuario = :usuario AND token.fechaUso IS NULL
            """)
    void marcarTokensPendientesComoUsados(
            @Param("usuario") Usuario usuario,
            @Param("fechaUso") Instant fechaUso
    );

    void deleteByUsuarioIdUsuario(Integer idUsuario);
}
