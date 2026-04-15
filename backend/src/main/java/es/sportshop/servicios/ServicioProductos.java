package es.sportshop.servicios;
import es.sportshop.model.Producto;
import es.sportshop.repositorios.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// Anotación de Spring para crear un bean
@Service
public class ServicioProductos {

    // Anotación de Spring para inyección de dependencias
    @Autowired

    // Atributos para la clase ServicioProductos
    private ProductoRepository productoRepository;

    // Función para ver los productos
    public List<Producto> verProductos() {
        return productoRepository.findAll();
    }

    // Función para buscar producto por nombre
    public List<Producto> buscarProductoPorNombre(String nombre) {
        return productoRepository.buscarProductoPorNombre(nombre);
    }

    // Función para guardar un producto
    public Producto guardarProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    // Función para eliminar un producto por id
    public Producto eliminarProducto(Producto producto) {
        productoRepository.delete(producto);
        return producto;
    }
}