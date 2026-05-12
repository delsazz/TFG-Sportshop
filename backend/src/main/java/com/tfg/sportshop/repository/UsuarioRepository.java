package com.tfg.sportshop.repository;
import java.util.List;
import java.util.Optional;
import com.tfg.sportshop.model.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    @EntityGraph(attributePaths = {"roles"})
    @Query("SELECT DISTINCT usuario FROM Usuario usuario")
    List<Usuario> findAllWithRelations();

    @EntityGraph(attributePaths = {"roles"})
    @Query("SELECT usuario FROM Usuario usuario WHERE usuario.email = :correo")
    Optional<Usuario> findUsuarioByEmail(@Param("correo") String email);

    @EntityGraph(attributePaths = {"roles"})
    @Query("SELECT usuario FROM Usuario usuario WHERE usuario.idUsuario = :id")
    Optional<Usuario> findByIdWithRelations(@Param("id") Integer id);

    @Modifying
    @Query(value = "DELETE FROM roles_usuario WHERE id_usuario = :idUsuario", nativeQuery = true)
    void deleteRolesByUsuarioId(@Param("idUsuario") Integer idUsuario);
}
