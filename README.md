# CampusFP - Gestión de Uniformes

Aplicación web para gestionar los uniformes de Protección Civil y Emergencias Sanitarias de CampusFP.

## Estructura del monorepo

```
campusfp-uniformes/
├── frontend/          → React + TypeScript (tienda del alumno)
├── admin/             → React + TypeScript (panel de administración)
├── backend/           → Spring Boot (API REST)
├── database/          → Migraciones Flyway y seeds
├── nginx/             → Configuración del proxy inverso
├── .github/           → Plantillas de issues y pull requests
├── docker-compose.yml → Orquestación local
├── docker-compose.prod.yml → Orquestación producción
└── Jenkinsfile        → Pipeline CI/CD
```

## Pila tecnológica

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Admin**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Spring Boot + Java + JWT + Stripe
- **Base de datos**: PostgreSQL + Flyway
- **Proxy inverso**: Nginx
- **Contenedores**: Docker + Docker Compose
- **CI/CD**: Jenkins

## Enrutado Nginx

| Ruta | Servicio | Puerto |
|------|----------|--------|
| `/` | frontend | 3000 |
| `/admin` | admin | 3001 |
| `/api` | backend | 8080 |

## Arranque en local

```bash
docker compose up --build
```

La aplicación estará disponible en `http://localhost`.

## Email de notificaciones

El backend envia emails cuando un pedido cambia de estado si el SMTP esta configurado. Copia `.env.example` a `.env.production` en el servidor y rellena:

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_password_de_aplicacion
NOTIFICATIONS_EMAIL_FROM=tu_correo@gmail.com
NOTIFICATIONS_EMAIL_ENABLED=true
```

Para Gmail hay que usar una contrasena de aplicacion, no la contrasena normal de la cuenta.

## Estrategia de ramas

| Rama | Entorno | Descripción |
|------|---------|-------------|
| `main` | Producción | Solo merges desde release con aprobación manual |
| `release` | Preproducción | Tests completos antes de pasar a main |
| `develop` | QA | Integración continua de features |
| `feature/*` | Local | Ramas individuales por issue |

## Normas de trabajo

1. Nunca se trabaja directamente en `main` ni en `develop`.
2. Formato de ramas: `feature/nombre-funcionalidad` o `fix/nombre-error`.
3. Pull request hacia `develop` con `Closes #numero-issue`.
4. Revisión obligatoria por otro miembro del equipo.

# Prueba CI
Este cambio es solo para disparar GitHub Actions
