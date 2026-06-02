package com.tfg.sportshop.services;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.time.Instant;
import com.tfg.sportshop.model.Usuario;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.repository.PedidoRepository;
import com.tfg.sportshop.repository.UsuarioRepository;
import com.tfg.sportshop.repository.CarritoItemRepository;
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
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private static final int MAX_INTENTOS_LOGIN = 5;
    private static final int COOLDOWN_SEGUNDOS = 20;
    private final ConcurrentMap<String, IntentosLogin> intentosLogin = new ConcurrentHashMap<>();
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
        pedidoRepository.desvincularUsuario(idUsuario);
        usuarioRepository.deleteRolesByUsuarioId(idUsuario);
        usuarioRepository.deleteById(idUsuario);
        return true;
    }

    public Optional<Usuario> autenticar(String email, String password) {
        String emailNormalizado = email == null ? "" : email.trim().toLowerCase();
        validarCooldown(emailNormalizado);
        Optional<Usuario> usuariobuscado = usuarioRepository.findUsuarioByEmail(email);
        if(usuariobuscado.isPresent()) {
            Usuario usuario = usuariobuscado.get();
            if(passwordMatches(password, usuario.getPassword())) {
                if(!isBcryptHash(usuario.getPassword())) {
                    usuario.setPassword(passwordEncoder.encode(password));
                }
                intentosLogin.remove(emailNormalizado);
                usuarioRepository.save(usuario);
                return Optional.of(usuario);
            }
            IntentosLogin intentos = intentosLogin.compute(emailNormalizado, (clave, actual) -> {
                int total = actual == null ? 1 : actual.intentos() + 1;
                Instant bloqueadoHasta = total >= MAX_INTENTOS_LOGIN ? Instant.now().plusSeconds(COOLDOWN_SEGUNDOS) : null;
                return new IntentosLogin(total, bloqueadoHasta);
            });
            if(intentos.bloqueadoHasta() != null) {
                throw new IllegalStateException("LOGIN_COOLDOWN:" + COOLDOWN_SEGUNDOS);
            }
        }
        return Optional.empty();
    }

    private void validarCooldown(String email) {
        IntentosLogin intentos = intentosLogin.get(email);
        if(intentos == null || intentos.bloqueadoHasta() == null) {
            return;
        }
        long segundosRestantes = intentos.bloqueadoHasta().getEpochSecond() - Instant.now().getEpochSecond();
        if(segundosRestantes > 0) {
            throw new IllegalStateException("LOGIN_COOLDOWN:" + segundosRestantes);
        }
        intentosLogin.remove(email);
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

    private record IntentosLogin(int intentos, Instant bloqueadoHasta) {
    }
}
