package es.sportshop.seguridad;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

// Anotación de Spring para indicar que es una clase de configuración
@Configuration
public class ConfiguracionSeguridad {

    // Anotación de Spring para crear un bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Anotación de Spring para crear un bean
    @Bean
    public UserDetailsManager users(DataSource dataSource) {
        JdbcUserDetailsManager users = new JdbcUserDetailsManager(dataSource);
        users.setUsersByUsernameQuery("SELECT correo_electronico, pw, true FROM usuario WHERE correo_electronico=?");
        users.setAuthoritiesByUsernameQuery("SELECT correo_electronico, rol FROM usuario WHERE correo_electronico=?");
        return users;
    }

    // Anotación de Spring para crear un bean
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/css/**", "/img/**", "/JavaScript/**").permitAll()
                .requestMatchers("/", "/productos", "/login", "/registro", "/denegado").permitAll()
                .requestMatchers("/zonaAdmin", "/zonaAdmin/**").hasAuthority("admin")
                .requestMatchers("/carrito", "/anadirProductoCarrito", "/eliminarProductoCarrito", "/pagar_pedido", "/procesarPago", "/usuariopedidos")
                .hasAnyAuthority("cliente", "admin")
                .anyRequest().authenticated()
        );
        http.formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/", true)
                .permitAll()
        );
        http.logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .permitAll()
        );
        http.exceptionHandling(exception -> exception.accessDeniedPage("/denegado"));
        return http.build();
    }
}