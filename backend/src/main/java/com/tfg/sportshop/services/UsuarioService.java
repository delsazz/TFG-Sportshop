package com.tfg.sportshop.services;
import java.util.List;
import java.util.Optional;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.repository.CarritoItemRepository;
import com.tfg.sportshop.repository.NotificacionRepository;
import com.tfg.sportshop.repository.PasswordResetTokenRepository;
import com.tfg.sportshop.repository.PedidoRepository;
import com.tfg.sportshop.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private CarritoItemRepository carritoItemRepository;
    @Autowired
    private NotificacionRepository notificacionRepository;
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public Usuario registrarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    public List<Usuario> verUsuarios() {
        return usuarioRepository.findAllWithRelations();
    }
    public Optional<Usuario> buscarUsuarioPorEmail(String email) {
        return usuarioRepository.findUsuarioByEmail(email);
    }

    public Optional<Usuario> buscarUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> buscarUsuarioPorIdConRelaciones(Integer id) {
        return usuarioRepository.findByIdWithRelations(id);
    }

    public long contarPedidosUsuario(Integer idUsuario) {
        return pedidoRepository.countByUsuarioIdUsuario(idUsuario);
    }

    @Transactional
    public boolean eliminarUsuario(Integer idUsuario) {
        if (!usuarioRepository.existsById(idUsuario)) {
            return false;
        }

        carritoItemRepository.deleteByUsuarioIdUsuario(idUsuario);
        passwordResetTokenRepository.deleteByUsuarioIdUsuario(idUsuario);
        notificacionRepository.deleteByUsuarioIdUsuario(idUsuario);
        pedidoRepository.desvincularUsuario(idUsuario);
        usuarioRepository.deleteRolesByUsuarioId(idUsuario);
        usuarioRepository.deleteById(idUsuario);

        return true;
    }

    public Optional<Usuario> autenticar(String email, String password) {
        Optional<Usuario> usuariobuscado = usuarioRepository.findUsuarioByEmail(email);
        if(usuariobuscado.isPresent()) {
            Usuario usuario = usuariobuscado.get();
            if(passwordEncoder.matches(password, usuario.getPassword())) {
                return Optional.of(usuario);
            }
        }
        return Optional.empty();
    }
}
