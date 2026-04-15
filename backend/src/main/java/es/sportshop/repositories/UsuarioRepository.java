package es.sportshop.repositorios;
import es.sportshop.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// Anotación de Spring para indicar que es un repositorio
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    // Anotación de Spring para buscar un usuario por correo
    @Query("SELECT usuario FROM Usuario usuario WHERE usuario.correoElectronico = :correo")

    // Función para buscar usuario
    Optional<Usuario> buscarUsuario(@Param("correo") String correoElectronico);
}