# --- Etapa 1: gera o build web estático do Expo ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Por padrão o app chama a API no mesmo domínio, em /api (o nginx faz o proxy).
# Assim não precisa configurar CORS nem IP do servidor no build.
ARG EXPO_PUBLIC_API_URL=/api
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

RUN npx expo export -p web && node inject-pwa.js

# --- Etapa 2: serve com nginx ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
