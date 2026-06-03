import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface DetalleRepository extends JpaRepository<Detalle, Integer> {
    List<Detalle> findByPedido_IdPedido(Integer idPedido);
    // Check if a product has any detalle records
    boolean existsByProductoIdProducto(Integer idProducto);
    // Delete all detalle records for a given product
    @Modifying
    @Query("DELETE FROM Detalle d WHERE d.producto.idProducto = :idProducto")
    void deleteByProductoIdProducto(@Param("idProducto") Integer idProducto);
}
