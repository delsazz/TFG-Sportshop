# Usamos la imagen ligera de Nginx basada en Alpine
FROM nginx:alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /etc/nginx

# Copiamos la configuración personalizada al contenedor
COPY nginx.conf /etc/nginx/nginx.conf

# Exponemos el puerto 80 para el tráfico HTTP
EXPOSE 80

# Comando por defecto de Nginx
CMD ["nginx", "-g", "daemon off;"]