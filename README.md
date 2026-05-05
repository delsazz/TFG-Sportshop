# SportShop - TFG

SportShop es una tienda online desarrollada como proyecto de TFG con Spring Boot, Thymeleaf, Spring Security, JPA y MySQL. La aplicación permite consultar productos deportivos, registrarse, iniciar sesión, gestionar un carrito, realizar pedidos y administrar productos, usuarios y pedidos desde una zona privada.

## Funcionalidades principales

- Catálogo público de productos con foto, precio y stock.
- Registro e inicio de sesión de usuarios.
- Carrito por sesión y creación de pedidos.
- Descuento de stock al confirmar un pedido.
- Pago por Bizum, tarjeta o transferencia bancaria.
- Integración preparada con Stripe Checkout para tarjetas.
- Historial de pedidos para cada usuario.
- Panel de administración protegido por rol `admin`.
- Gestión básica de productos desde la zona de administración.
- Configuración de teléfono Bizum, IBAN y claves de Stripe desde administración.
- Scripts SQL con esquema inicial y datos de prueba.

## Tecnologías

- Java 17
- Spring Boot
- Spring MVC
- Spring Security
- Spring Data JPA
- Thymeleaf
- MySQL
- Bootstrap 5

## Estructura

```text
backend/
  src/main/java/es/sportshop/
    controladores/     Controladores MVC
    model/             Entidades JPA
    repositories/      Repositorios de datos
    seguridad/         Configuración de seguridad y frontend
    servicios/         Lógica de negocio
  database/migrations/ Scripts SQL del proyecto
frontend/
  vistas/              Plantillas Thymeleaf
  static/              CSS, JavaScript e imágenes
```

## Base de datos

1. Crea la base de datos y las tablas ejecutando:

```sql
source backend/database/migrations/V1__esquema_inicial.sql;
```

2. Inserta los datos de prueba:

```sql
source backend/database/migrations/V2__datos_prueba.sql;
```

3. Añade la configuración de pagos:

```sql
source backend/database/migrations/V3__configuracion_pagos.sql;
```

4. Añade tallas y fotos representativas para productos/categorías:

```sql
source backend/database/migrations/V4__productos_categorias_imagenes_tallas.sql;
```

La configuración actual espera MySQL en `localhost:3306` con la base de datos `sportshop`, usuario `root` y contraseña `curso`. Estos datos están en `backend/src/main/resources/application.properties`.

## Usuarios de prueba

Todos los usuarios de prueba usan la contraseña codificada incluida en el script de datos.

- Cliente: `juan@sportshop.com`
- Cliente: `ana@sportshop.com`
- Admin: `admin@sportshop.com`

## Ejecución

Desde la raíz del proyecto:

```powershell
.\mvnw.cmd -f backend\pom.xml spring-boot:run
```

La aplicación arranca en:

```text
http://localhost:8095
```

## Rutas principales

- `/` Inicio
- `/productos` Catálogo
- `/registro` Registro
- `/login` Inicio de sesión
- `/carrito` Carrito
- `/usuariopedidos` Pedidos del usuario
- `/zonaAdmin` Panel de administración
- `/zonaAdmin/productos` Administración de productos
- `/zonaAdmin/pedidos` Administración de pedidos
- `/zonaAdmin/usuarios` Administración de usuarios
- `/zonaAdmin/pagos` Configuración de Bizum, transferencia y Stripe

## Notas para la memoria

El proyecto separa la lógica en capas: controladores para las rutas web, servicios para la lógica de negocio, repositorios para el acceso a datos y entidades para representar el modelo relacional. La seguridad se basa en usuarios almacenados en base de datos y roles simples (`cliente` y `admin`). La sesión usa una cookie HTTP-only llamada `SPORTSHOP_SESION` y se invalida al cerrar sesión.
