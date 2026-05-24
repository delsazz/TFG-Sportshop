package com.tfg.sportshop.services;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.tfg.sportshop.model.Usuario;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.repository.PedidoRepository;
import com.tfg.sportshop.repository.UsuarioRepository;
import com.tfg.sportshop.repository.CarritoItemRepository;
import com.tfg.sportshop.repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.tfg.sportshop.repository.PasswordResetTokenRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    @Autowired
    private CorreoTemplateService correoTemplateService;
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
        if(!usuarioRepository.existsById(idUsuario)) {
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
            if(Boolean.TRUE.equals(usuario.getLoginBloqueado())) {
                throw new IllegalStateException("LOGIN_BLOQUEADO");
            }
            if(passwordMatches(password, usuario.getPassword())) {
                if(!isBcryptHash(usuario.getPassword())) {
                    usuario.setPassword(passwordEncoder.encode(password));
                }
                usuario.setLoginIntentosFallidos(0);
                usuario.setLoginBloqueado(false);
                usuario.setLoginDesbloqueoToken(null);
                usuarioRepository.save(usuario);
                return Optional.of(usuario);
            }
            int intentos = usuario.getLoginIntentosFallidos() == null ? 0 : usuario.getLoginIntentosFallidos();
            intentos++;
            usuario.setLoginIntentosFallidos(intentos);
            if(intentos >= 5) {
                usuario.setLoginBloqueado(true);
                usuario.setLoginDesbloqueoToken(UUID.randomUUID().toString());
                usuarioRepository.save(usuario);
                correoTemplateService.enviarLoginBloqueado(usuario);
                throw new IllegalStateException("LOGIN_BLOQUEADO");
            }
            usuarioRepository.save(usuario);
        }
        return Optional.empty();
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if(rawPassword == null || storedPassword == null) {
            return false;
        }
        if(isBcryptHash(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return rawPassword.equals(storedPassword);
    }

    private boolean isBcryptHash(String password) {
        return password != null && password.matches("^\\$2[aby]\\$\\d{2}\\$.*");
    }

    @Transactional
    public boolean desbloquearLogin(String token) {
        if(token == null || token.isBlank()) {
            return false;
        }
        Optional<Usuario> usuario = usuarioRepository.findByLoginDesbloqueoToken(token.trim());
        if(usuario.isEmpty()) {
            return false;
        }
        Usuario u = usuario.get();
        u.setLoginBloqueado(false);
        u.setLoginIntentosFallidos(0);
        u.setLoginDesbloqueoToken(null);
        usuarioRepository.save(u);
        return true;
    }
}
