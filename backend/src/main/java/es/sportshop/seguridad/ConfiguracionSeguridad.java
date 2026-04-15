package es.sportshop.seguridad;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import javax.sql.DataSource;

// Anotación de Spring para indicar que es una clase de configuración
@Configuration
public class ConfiguracionSeguridad {

    // Anotación de Spring para crear un bean
    @Bean

    // Función para encriptar las contraseñas
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Anotación de Spring para crear un bean
    @Bean

    // Función para gestionar los usuarios desde la base de datos
    public UserDetailsManager users(DataSource dataSource) {

        // Cargar los usuarios desde MySQL
        JdbcUserDetailsManager users = new JdbcUserDetailsManager(dataSource);

        // Query para seleccionar el usuario
        users.setUsersByUsernameQuery("SELECT correo_electronico, pw, true FROM usuario WHERE correo_electronico=?");

        // Query para obtener el rol del usuario
        users.setAuthoritiesByUsernameQuery("SELECT correo_electronico, rol FROM usuario WHERE correo_electronico=?");

        // Devolver los usuarios
        return users;
    }

    // Anotación de Spring para crear un bean
    @Bean

    // Función para crear la seguridad de la página por rutas
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth

                // Permitir acceso a los recursos estáticos
                .requestMatchers("/css/**", "/imagenes/**", "/JavaScript/**").permitAll()

                // Permitir acceso a la página principal y de inicio de sesión o registro
                .requestMatchers("/", "/productos", "/login", "/registro").permitAll()

                // Permitir el acceso solo a los clientes
                .requestMatchers("/cliente/**").hasAuthority("cliente")

                // Permitir el acceso solo a los admin
                .requestMatchers("/admin/**").hasAuthority("admin")
                .anyRequest().authenticated()
        );

        // Configuración del formulario de inicio de sesión
        http.formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/", true)
                .permitAll()
        );

        // Configuración de la página de cerrar sesión
        http.logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .permitAll()
        );

        // Página de error cuando el usuario no tiene permisos
        http.exceptionHandling(exception ->
                exception.accessDeniedPage("/denegado")
        );

        // Devolver la configuración de seguridad
        return http.build();
    }
}