package com.campusfp.uniformes.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.campusfp.uniformes.model.Usuario;
import com.campusfp.uniformes.repository.UsuarioRepository;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario registrarUsuario(String nombre, String apellidos, String email, String password, 
                                    String telefono, String direccion, String nif, String ciudad, String pais, String codigoPostal) {
        if (usuarioRepository.findById(email).isPresent()) {
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
        usuario.setCorreoElectronico(email);
        usuario.setPw(passwordEncoder.encode(password));
        usuario.setTelefono(telefono);
        usuario.setDireccion(direccion);
        usuario.setNif(nif);
        usuario.setCiudad(ciudad);
        usuario.setPais(pais);
        usuario.setCodigoPostal(codigoPostal);
        usuario.setRol("cliente");

        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> autenticar(String email, String password) {
        Optional<Usuario> usuario = usuarioRepository.findById(email);

        if (usuario.isPresent() && passwordEncoder.matches(password, usuario.get().getPw())) {
            return usuario;
        }

        return Optional.empty();
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findById(email);
    }
}
