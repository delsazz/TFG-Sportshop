package com.tfg.sportshop.repository;

import java.util.List;
import com.tfg.sportshop.model.Notificacion;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {
    List<Notificacion> findByUsuarioIdUsuarioOrderByFechaEnvioDesc(Integer idUsuario);
    long countByUsuarioIdUsuarioAndLeidaFalse(Integer idUsuario);
    void deleteByUsuarioIdUsuario(Integer idUsuario);
}
