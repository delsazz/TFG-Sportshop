package com.campusfp.uniformes.services;
import com.campusfp.uniformes.model.Notificacion;
import com.campusfp.uniformes.repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificacionService {
    @Autowired
    private NotificacionRepository notificacionRepository;

    public Notificacion guardar(Notificacion notificacion) {
        return notificacionRepository.save(notificacion);
    }

    public List<Notificacion> obtenerTodas() {
        return notificacionRepository.findAll();
    }
}
