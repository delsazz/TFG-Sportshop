package com.tfg.sportshop.services;

import java.util.Set;
import java.util.List;
import java.util.HashSet;
import java.util.Optional;
import com.tfg.sportshop.model.Producto;
import com.tfg.sportshop.model.Categoria;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.repository.ProductoRepository;
import com.tfg.sportshop.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoriaService {
    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private ProductoRepository productoRepository;

    public Optional<Categoria> buscarCategoriaPorNombre(String nombreCategoria) {
        return categoriaRepository.findByNombreCategoria(nombreCategoria);
    }

    public Optional<Categoria> buscarCategoriaPorId(Integer idCategoria) {
        return categoriaRepository.findById(idCategoria);
    }

    public Optional<Categoria> buscarCategoriaPorSlug(String slug) {
        return categoriaRepository.findBySlug(slug);
    }

    public List<Categoria> verCategorias() {
        return categoriaRepository.findAllByOrderByOrdenVisualizacionAscNombreCategoriaAsc();
    }

    public boolean comprobarCategoria(String nombreCategoria) {
        return categoriaRepository.existsByNombreCategoria(nombreCategoria);
    }

    @Transactional
    public Categoria crearCategoria(String nombreCategoria, String slug, String descripcion, String imagenUrl, Integer ordenVisualizacion, List<Integer> productoIds) {
        validarNombreUnico(nombreCategoria, null);
        validarSlugUnico(slug, null);
        Categoria categoria = new Categoria();
        aplicarDatos(categoria, nombreCategoria, slug, descripcion, imagenUrl, ordenVisualizacion);
        Categoria categoriaGuardada = categoriaRepository.save(categoria);
        asignarProductos(categoriaGuardada, productoIds);
        return categoriaRepository.save(categoriaGuardada);
    }

    @Transactional
    public Categoria actualizarCategoria(Integer idCategoria, String nombreCategoria, String slug, String descripcion, String imagenUrl, Integer ordenVisualizacion, List<Integer> productoIds) {
        Categoria categoria = categoriaRepository.findById(idCategoria)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada"));
        validarNombreUnico(nombreCategoria, idCategoria);
        validarSlugUnico(slug, idCategoria);
        aplicarDatos(categoria, nombreCategoria, slug, descripcion, imagenUrl, ordenVisualizacion);
        Categoria categoriaActualizada = categoriaRepository.save(categoria);
        asignarProductos(categoriaActualizada, productoIds);
        return categoriaRepository.save(categoriaActualizada);
    }

    @Transactional
    public void eliminarCategoria(Integer idCategoria) {
        Categoria categoria = categoriaRepository.findById(idCategoria)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada"));
        List<Producto> productosAsignados = productoRepository.findByCategoriaIdCategoria(idCategoria);
        if(!productosAsignados.isEmpty()) {
            for(Producto producto : productosAsignados) {
                producto.setCategoria(null);
            }
            productoRepository.saveAll(productosAsignados);
        }
        categoriaRepository.delete(categoria);
    }

    private void asignarProductos(Categoria categoria, List<Integer> productoIds) {
        if(productoIds == null || productoIds.isEmpty()) {
            return;
        }
        Set<Integer> idsUnicos = new HashSet<>(productoIds);
        List<Producto> productos = productoRepository.findByIdProductoIn(productoIds);
        if (productos.size() != idsUnicos.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uno o varios productos no existen");
        }
        for(Producto producto : productos) {
            producto.setCategoria(categoria);
        }
        productoRepository.saveAll(productos);
    }

    private void aplicarDatos(Categoria categoria, String nombreCategoria, String slug, String descripcion, String imagenUrl, Integer ordenVisualizacion) {
        categoria.setNombreCategoria(nombreCategoria.trim());
        categoria.setSlug(normalizarSlug(slug));
        categoria.setDescripcion(descripcion == null ? null : descripcion.trim());
        categoria.setImagenUrl(imagenUrl == null || imagenUrl.isBlank() ? null : imagenUrl.trim());
        categoria.setOrdenVisualizacion(ordenVisualizacion == null ? 0 : ordenVisualizacion);
    }

    private void validarNombreUnico(String nombreCategoria, Integer idCategoria) {
        boolean exists = idCategoria == null
            ? categoriaRepository.existsByNombreCategoria(nombreCategoria.trim())
            : categoriaRepository.existsByNombreCategoriaAndIdCategoriaNot(nombreCategoria.trim(), idCategoria);
        if (exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una categoria con ese nombre");
        }
    }

    private void validarSlugUnico(String slug, Integer idCategoria) {
        String normalizado = normalizarSlug(slug);
        boolean exists = idCategoria == null ? categoriaRepository.existsBySlug(normalizado)
            : categoriaRepository.existsBySlugAndIdCategoriaNot(normalizado, idCategoria);
        if(exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una categoria con ese slug");
        }
    }

    private String normalizarSlug(String slug) {
        String normalizado = slug == null ? "" : slug.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
        if(normalizado.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El slug no es valido");
        }
        return normalizado;
    }
}