package es.sportshop.servicios;
import java.util.List;
import es.sportshop.model.Foto;
import org.springframework.stereotype.Service;
import es.sportshop.repositories.FotoRepository;
import org.springframework.beans.factory.annotation.Autowired;

// Anotación de Spring para crear un bean
@Service
public class ServicioFotos {

    // Anotacion de Spring para inyección de dependencias
    @Autowired
    private FotoRepository fotoRepository;

    // Función para añadir fotos de productos
    public Foto anadirFoto(Foto foto) {
        return fotoRepository.save(foto);
    }

    // Función para ver fotos de los productos
    public List<Foto> verFotosProductos() {
        return fotoRepository.findAll();
    }
}