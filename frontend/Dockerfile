# --- Etapa 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_BASE=/
ENV VITE_BASE=$VITE_BASE
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Etapa 2: Servir con nginx ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
