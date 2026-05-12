package com.tfg.sportshop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {
    @Value("${app.upload.dir:img/productos}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = Paths.get(uploadDir).toAbsolutePath().getParent().toUri().toString();
        registry.addResourceHandler("/img/**")
                .addResourceLocations(uploadPath);
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
