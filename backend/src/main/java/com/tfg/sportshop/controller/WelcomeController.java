package com.tfg.sportshop.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
public class WelcomeController {

    @GetMapping("/")
    public Map<String, Object> welcome() {
        return Map.of(
            "message", "Bienvenido al API de Campus FP Uniformes",
            "version", "1.0.0",
            "status", "Online",
            "endpoints", Map.of(
                "auth", Map.of(
                    "login", "POST /api/auth/login",
                    "register", "POST /api/auth/register",
                    "logout", "POST /api/auth/logout",
                    "me", "GET /api/auth/me"
                ),
                "catalog", Map.of(
                    "all", "GET /api/catalogo",
                    "byId", "GET /api/catalogo/{id}"
                )
            ),
            "documentation", Map.of(
                "frontend", "http://localhost:5173",
                "h2-console", "http://localhost:8080/h2-console"
            )
        );
    }
}
