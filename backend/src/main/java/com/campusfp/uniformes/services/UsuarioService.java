package com.campusfp.uniformes.services;
import java.util.List;
import java.util.Optional;
import com.campusfp.uniformes.model.Usuario;
import com.campusfp.uniformes.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Usuario registrarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> verUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarUsuarioPorEmail(String email) {
        return usuarioRepository.findById(email);
    }

    public boolean eliminarUsuario(String email) {
        if (!usuarioRepository.existsById(email)) {
            return false;
        }
        usuarioRepository.deleteById(email);
        return true;
    }

    public Optional<Usuario> autenticar(String email, String password) {
        Optional<Usuario> usuariobuscado = usuarioRepository.findById(email);
        if(usuariobuscado.isPresent()) {
            Usuario usuario = usuariobuscado.get();
            if(passwordEncoder.matches(password, usuario.getPw())) {
                return Optional.of(usuario);
            }
        }
        return Optional.empty();
    }
}
