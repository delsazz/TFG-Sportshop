package es.sportshop.servicios;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

// Anotación de Spring para crear un bean
@Service
public class ServicioArchivos {

    // Función para guardar una imagen subida desde el panel de administración
    public String guardarImagen(MultipartFile archivo) throws IOException {
        if(archivo == null || archivo.isEmpty()) {
            return null;
        }

        String nombreOriginal = archivo.getOriginalFilename();
        String extension = obtenerExtension(nombreOriginal);
        String nombreArchivo = UUID.randomUUID().toString() + extension;
        Path carpetaImagenes = obtenerCarpetaImagenes();
        Files.createDirectories(carpetaImagenes);
        archivo.transferTo(carpetaImagenes.resolve(nombreArchivo).toFile());
        return nombreArchivo;
    }

    private String obtenerExtension(String nombreOriginal) {
        if(nombreOriginal == null) {
            return ".jpg";
        }

        String nombreLimpio = nombreOriginal.toLowerCase();
        int posicionPunto = nombreLimpio.lastIndexOf(".");
        if(posicionPunto == -1) {
            return ".jpg";
        }

        String extension = nombreLimpio.substring(posicionPunto);
        if(List.of(".jpg", ".jpeg", ".png", ".webp").contains(extension)) {
            return extension;
        }
        return ".jpg";
    }

    private Path obtenerCarpetaImagenes() {
        Path carpeta = Paths.get(System.getProperty("user.dir"));
        List<Path> rutasCandidatas = List.of(
                carpeta.resolve("frontend").resolve("static").resolve("img"),
                carpeta.resolve("..").resolve("frontend").resolve("static").resolve("img")
        );

        for(Path rutaCandidata : rutasCandidatas) {
            if(Files.exists(rutaCandidata)) {
                return rutaCandidata.toAbsolutePath().normalize();
            }
        }
        return rutasCandidatas.get(0).toAbsolutePath().normalize();
    }
}
