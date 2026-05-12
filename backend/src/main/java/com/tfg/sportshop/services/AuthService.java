package com.tfg.sportshop.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.tfg.sportshop.model.Usuario;
import com.tfg.sportshop.model.Roles;
import com.tfg.sportshop.repository.UsuarioRepository;
import com.tfg.sportshop.repository.RolesRepository;
import java.util.Optional;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuthService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolesRepository rolesRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario registrarUsuario(String nombre, String apellidos, String email, String password, 
                                    String telefono, String direccion) {
        if (usuarioRepository.findUsuarioByEmail(email).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        if (!password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")) {
            throw new IllegalArgumentException(
                "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
            );
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setApellidos(apellidos);
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setTelefono(telefono);
        usuario.setDireccion(direccion);

        List<Roles> roles = new ArrayList<>();
        Roles userRole = rolesRepository.findByNombreRol("USER")
            .orElseThrow(() -> new RuntimeException("Rol USER no encontrado"));
        roles.add(userRole);
        usuario.setRoles(roles);

        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> autenticar(String email, String password) {
        Optional<Usuario> usuario = usuarioRepository.findUsuarioByEmail(email);

        if (usuario.isPresent() && passwordEncoder.matches(password, usuario.get().getPassword())) {
            return usuario;
        }

        return Optional.empty();
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findUsuarioByEmail(email);
    }
}
