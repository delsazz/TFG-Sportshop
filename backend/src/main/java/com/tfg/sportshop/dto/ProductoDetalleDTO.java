package com.tfg.sportshop.dto;
import java.util.List;
import com.tfg.sportshop.model.Producto;
import com.tfg.sportshop.model.ProductoImagen;
import com.tfg.sportshop.model.Talla;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDetalleDTO {
    private Producto producto;
    private List<ProductoImagen> imagenes;
    private List<Talla> tallasDisponibles;
}
