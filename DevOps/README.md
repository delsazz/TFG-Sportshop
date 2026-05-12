# Observabilidad CampusFP

Stack de logs centralizados, alertas de disponibilidad y dashboard de servicios para los contenedores de CampusFP Uniformes.

## Servicios incluidos

- Loki: almacenamiento de logs.
- Promtail: captura logs de Docker y los envia a Loki.
- Prometheus: recopila metricas y evalua alertas.
- Alertmanager: entrega alertas por webhook.
- Grafana: dashboard basico de estado y busqueda de logs.
- cAdvisor: metricas de contenedores.
- Blackbox Exporter: comprueba que los endpoints HTTP respondan.
- Postgres Exporter: metricas de PostgreSQL.

## Arranque

Desde la raiz del repositorio:

```bash
docker compose -f docker-compose.server.yml -f DevOps/docker-compose.observability.yml --env-file .env.production up -d --build
```

Accesos:

- Grafana: `http://localhost:3002` (`admin` / `admin` por defecto).
- Prometheus: `http://localhost:9090`.
- Alertmanager: `http://localhost:9093`.
- Loki API: `http://localhost:3100`.

Puedes cambiar las credenciales de Grafana con:

```bash
GRAFANA_ADMIN_USER=admin GRAFANA_ADMIN_PASSWORD=una_clave_segura
```

## Logs centralizados

Los servicios de la aplicacion y del stack de observabilidad quedan etiquetados con `logging=promtail`.
Promtail detecta esos contenedores por el socket de Docker y envia sus logs a Loki con etiquetas como:

- `service`
- `container`
- `compose_project`

En Grafana, abre el dashboard `CampusFP - Estado de servicios` o usa Explore con Loki. Ejemplo de consulta:

```logql
{service="backend"}
```

## Alertas

Prometheus carga las reglas de `DevOps/alerts.yml`:

- `ContainerDown`: un contenedor deja de reportar metricas.
- `HttpEndpointDown`: nginx, admin o backend health no responden con HTTP 2xx.
- `TargetDown`: Prometheus no puede scrapear un target.
- `ContainerNoMetrics`: cAdvisor no reporta metricas de contenedores.

Alertmanager envia las alertas al webhook configurado en `DevOps/alertmanager.yml`. Por defecto usa:

```text
http://host.docker.internal:5001/alerts
```

Configura el endpoint real editando `DevOps/alertmanager.yml`, por ejemplo:

```yaml
webhook_configs:
  - url: https://monitoring.example.com/alerts
```

## Dashboard

Grafana provisiona automaticamente:

- Datasource Prometheus.
- Datasource Loki.
- Dashboard `CampusFP - Estado de servicios`.

El dashboard muestra disponibilidad HTTP, targets activos, contenedores detectados, CPU por contenedor y logs centralizados.

## Rotacion de logs

El override `DevOps/docker-compose.observability.yml` configura el driver `json-file` en los contenedores principales con:

```yaml
max-size: "10m"
max-file: "5"
```

Con esto cada contenedor conserva hasta 5 ficheros de 10 MB antes de rotar.
