package es.sportshop.seguridad;
import java.util.List;
import java.nio.file.Path;
import java.nio.file.Files;
import java.nio.file.Paths;
import org.springframework.context.annotation.Bean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.thymeleaf.spring6.templateresolver.SpringResourceTemplateResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

// Anotación de Spring para indicar que es una clase de configuraciónº
@Configuration
public class ConfiguracionFrontend implements WebMvcConfigurer {

    // Anotación de Spring para crear un bean
    @Bean
    public SpringResourceTemplateResolver resolvedorPlantillas(ApplicationContext applicationContext) {
        SpringResourceTemplateResolver springResourceTemplateResolver = new SpringResourceTemplateResolver();
        springResourceTemplateResolver.setApplicationContext(applicationContext);
        springResourceTemplateResolver.setPrefix(resolverDirectorioFrontend("vistas"));
        springResourceTemplateResolver.setSuffix(".html");
        springResourceTemplateResolver.setTemplateMode("HTML");
        springResourceTemplateResolver.setCharacterEncoding("UTF-8");
        springResourceTemplateResolver.setCacheable(false);
        springResourceTemplateResolver.setCheckExistence(true);
        return springResourceTemplateResolver;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registro) {
        registro.addResourceHandler("/**").addResourceLocations(verDirectorioFrontend("static")); 
    }

    // Función para buscar el directorio frontend
    private String verDirectorioFrontend(String subcarpeta) {
        Path carpeta = Paths.get(System.getProperty("user.dir"));
        List<Path> rutasCandidatas = List.of(carpeta.resolve("frontend").resolve(subcarpeta), carpeta.resolve("..").resolve("frontend").resolve(subcarpeta));
        for(Path rutaCandidata : rutasCandidatas) {
            if(Files.exists(rutaCandidata)) {
                return "file:" + rutaCandidata.toAbsolutePath().normalize().toString().replace("\\", "/") + "/";
            }
        }
        Path rutaRespaldo = rutasCandidatas.get(0);
        return "file:" + rutaRespaldo.toAbsolutePath().normalize().toString().replace("\\", "/") + "/";
    }
}