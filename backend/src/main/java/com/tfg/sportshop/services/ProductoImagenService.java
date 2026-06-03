package com.tfg.sportshop.services;

import com.tfg.sportshop.model.Producto;
import org.springframework.http.HttpStatus;
import com.tfg.sportshop.model.ProductoImagen;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.repository.ProductoRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import com.tfg.sportshop.repository.ProductoImagenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.nio.file.Path;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class ProductoImagenService {
    @Autowired
    private ProductoImagenRepository productoImagenRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Value("${app.upload.productos-dir:../frontend/public/img/productos}")
    private String uploadDir;
    
    @Value("${app.upload.max-size:5242880}")
    private long maxFileSize;

    @Transactional
    public ProductoImagen subirImagen(Long idProducto, MultipartFile file, Boolean esPrincipal) throws IOException {
        Producto producto = productoRepository.findById(idProducto.intValue())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if(file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo está vacío");
        }
        String contentType = file.getContentType();
        if(contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se permiten imágenes");
        }
        if(file.getSize() > maxFileSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "El archivo supera el tamaño máximo de " + (maxFileSize / (1024 * 1024)) + "MB");
        }
    
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if(originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + extension;
        Path uploadPath = resolveUploadPath(uploadDir, "frontend/public/img/productos");
        Files.createDirectories(uploadPath);
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());
        if(esPrincipal != null && esPrincipal) {
            ProductoImagen imagenPrincipalActual = productoImagenRepository
                .findByProductoIdProductoAndEsPrincipal(idProducto.intValue(), true);
            if(imagenPrincipalActual != null) {
                imagenPrincipalActual.setEsPrincipal(false);
                productoImagenRepository.save(imagenPrincipalActual);
            }
        }
        List<ProductoImagen> imagenesExistentes = productoImagenRepository
            .findByProductoIdProductoOrderByOrden(idProducto.intValue());
        int nuevoOrden = imagenesExistentes.size();
        ProductoImagen imagen = new ProductoImagen();
        imagen.setProducto(producto);
        imagen.setUrlImagen("/img/productos/" + filename);
        imagen.setAltText(producto.getNombre());
        imagen.setOrden(nuevoOrden);
        imagen.setEsPrincipal(esPrincipal != null && esPrincipal);
        return productoImagenRepository.save(imagen);
    }
    
    @Transactional(readOnly = true)
    public List<ProductoImagen> obtenerImagenesProducto(Long idProducto) {
        return productoImagenRepository.findByProductoIdProductoOrderByOrden(idProducto.intValue());
    }
    
    @Transactional
    public void eliminarImagen(Integer idImagen) {
        ProductoImagen imagen = productoImagenRepository.findById(idImagen)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imagen no encontrada"));
        try {
            String filename = imagen.getUrlImagen().substring(imagen.getUrlImagen().lastIndexOf("/") + 1);
            Path filePath = resolveUploadPath(uploadDir, "frontend/public/img/productos").resolve(filename);
            Files.deleteIfExists(filePath);
        } catch(IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al eliminar la imagen");
        }
        productoImagenRepository.deleteById(idImagen);
    }

    private Path resolveUploadPath(String configuredPath, String rootRelativeFallback) {
        Path current = Paths.get("").toAbsolutePath();
        while (current != null) {
            if (Files.exists(current.resolve("frontend/public/img"))) {
                return current.resolve(rootRelativeFallback);
            }
            current = current.getParent();
        }
        return Paths.get(rootRelativeFallback).toAbsolutePath().normalize();
    }
}
