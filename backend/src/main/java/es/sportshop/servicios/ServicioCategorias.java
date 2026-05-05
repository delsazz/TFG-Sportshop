package es.sportshop.servicios;
import java.util.List;
import es.sportshop.model.Categoria;
import org.springframework.stereotype.Service;
import es.sportshop.repositories.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;

// Anotación de Spring para crear un bean
@Service
public class ServicioCategorias {

    // Anotación de Spring para inyección de dependencias
    @Autowired
    private CategoriaRepository categoriaRepository;

    // Función para ver todas las categorías
    public List<Categoria> verCategorias() {
        return categoriaRepository.findAll();
    }

    // Función para buscar una categoría por id
    public Categoria buscarCategoriaPorId(int idCategoria) {
        return categoriaRepository.findById(idCategoria).orElse(null);
    }

    // Función para guardar una categoría
    public Categoria guardarCategoria(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }
}
