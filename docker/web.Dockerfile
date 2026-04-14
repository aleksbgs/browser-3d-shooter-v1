FROM node:22-alpine AS build
WORKDIR /app

# Full URL takes precedence in client code if non-empty; otherwise host + port.
ARG VITE_COLYSEUS_URL=
ARG VITE_COLYSEUS_HOST=localhost
ARG VITE_COLYSEUS_PORT=2567
ARG VITE_COLYSEUS_ROOM_NAME=pirate_shooter_v2

ENV VITE_COLYSEUS_URL=${VITE_COLYSEUS_URL}
ENV VITE_COLYSEUS_HOST=${VITE_COLYSEUS_HOST}
ENV VITE_COLYSEUS_PORT=${VITE_COLYSEUS_PORT}
ENV VITE_COLYSEUS_ROOM_NAME=${VITE_COLYSEUS_ROOM_NAME}

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY shared ./shared

RUN npm run build:client

FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
