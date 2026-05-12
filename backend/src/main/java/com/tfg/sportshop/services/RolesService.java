package com.tfg.sportshop.services;
import java.util.List;
import java.util.Optional;
import com.tfg.sportshop.model.Roles;
import org.springframework.stereotype.Service;
import com.tfg.sportshop.repository.RolesRepository;
import org.springframework.beans.factory.annotation.Autowired;
@Service
public class RolesService {
    @Autowired
    RolesRepository rolesRepository;
    public Optional<Roles> bucarPorNombre(String rolNombre){
        return rolesRepository.findByNombreRol(rolNombre);
    }

    public List<Roles> verRoles() {
        return rolesRepository.findAll();
    }
}
