package es.sportshop.servicios;
import es.sportshop.model.Usuario;
import es.sportshop.repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

// Anotación de Spring para crear un bean
@Service
public class ServicioUsuarios {

    // Anotación de Spring para inyección de dependencias
    @Autowired

    // Atributos para la clase ServicioUsuarios
    private UsuarioRepository usuarioRepository;

    // Función para que un usuario se registre
    public Usuario registrarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // Función para buscar un usuario
    public Optional<Usuario> buscarUsuarioPorEmail(String correoElectronico) {
        return usuarioRepository.findById(String.valueOf(correoElectronico));
    }
}