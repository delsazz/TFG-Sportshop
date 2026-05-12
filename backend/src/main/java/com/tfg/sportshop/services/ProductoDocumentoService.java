package com.tfg.sportshop.services;

import com.tfg.sportshop.model.Producto;
import com.tfg.sportshop.model.ProductoDocumento;
import com.tfg.sportshop.repository.ProductoDocumentoRepository;
import com.tfg.sportshop.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class ProductoDocumentoService {
    @Autowired
    private ProductoDocumentoRepository productoDocumentoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Value("${app.upload.docs-dir:uploads/documentos}")
    private String docsDir;

    @Value("${app.upload.max-doc-size:10485760}")
    private long maxDocSize;

    @Transactional
    public ProductoDocumento subirDocumento(Long idProducto, MultipartFile file, String nombreDocumento) throws IOException {
        Producto producto = productoRepository.findById(idProducto.intValue())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo está vacío");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && !contentType.equals("application/octet-stream"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se permiten PDFs");
        }

        if (file.getSize() > maxDocSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El archivo supera el tamaño máximo de " + (maxDocSize / (1024 * 1024)) + "MB");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = UUID.randomUUID() + extension;
        Path uploadPath = Paths.get(docsDir);
        Files.createDirectories(uploadPath);

        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());

        ProductoDocumento doc = new ProductoDocumento();
        doc.setProducto(producto);
        doc.setNombre(resolveNombreDocumento(nombreDocumento, originalFilename));
        doc.setUrlDocumento("/uploads/documentos/" + filename);

        return productoDocumentoRepository.save(doc);
    }

    private String resolveNombreDocumento(String nombreDocumento, String originalFilename) {
        if (nombreDocumento != null && !nombreDocumento.isBlank()) {
            return nombreDocumento.trim();
        }

        if (originalFilename != null && !originalFilename.isBlank()) {
            int extensionIndex = originalFilename.lastIndexOf('.');
            return extensionIndex > 0 ? originalFilename.substring(0, extensionIndex) : originalFilename;
        }

        return "Documento";
    }

    @Transactional(readOnly = true)
    public List<ProductoDocumento> obtenerDocumentosPorProducto(Long idProducto) {
        return productoDocumentoRepository.findByProductoIdProducto(idProducto.intValue());
    }

    @Transactional
    public void eliminarDocumento(Integer idDocumento) {
        ProductoDocumento doc = productoDocumentoRepository.findById(idDocumento)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento no encontrado"));

        try {
            String filename = doc.getUrlDocumento().substring(doc.getUrlDocumento().lastIndexOf('/') + 1);
            Path filePath = Paths.get(docsDir).resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al eliminar el documento");
        }

        productoDocumentoRepository.deleteById(idDocumento);
    }
}

