package com.campusfp.uniformes.security;

import com.campusfp.uniformes.model.Usuario;
import com.campusfp.uniformes.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findById(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().toUpperCase()));

        return new User(
                usuario.getCorreoElectronico(),
                usuario.getPw(),
                authorities
        );
    }
}
