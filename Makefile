COMPOSE := docker compose
FILE := docker-compose.yml

.DEFAULT_GOAL := help

.PHONY: help up up-fg down logs ps build rebuild clean dev typecheck

help:
	@echo "Docker (production-style stack)"
	@echo "  Optional: copy .env.example to .env (COLYSEUS_PORT, WEB_HOST_PORT, COLYSEUS_WS_HOST, …)"
	@echo "  make up        - build images and start web + Colyseus in the background"
	@echo "  make up-fg     - same as up, stay attached (see logs in terminal)"
	@echo "  make down      - stop and remove containers"
	@echo "  make logs      - follow container logs"
	@echo "  make ps        - docker compose ps"
	@echo "  make build     - build images only"
	@echo "  make rebuild   - build with no cache"
	@echo ""
	@echo "Local dev (no Docker)"
	@echo "  make dev       - print how to run client + server locally"
	@echo "  make typecheck - npm run typecheck"

up:
	$(COMPOSE) -f $(FILE) up --build -d

up-fg:
	$(COMPOSE) -f $(FILE) up --build

down:
	$(COMPOSE) -f $(FILE) down

logs:
	$(COMPOSE) -f $(FILE) logs -f

ps:
	$(COMPOSE) -f $(FILE) ps

build:
	$(COMPOSE) -f $(FILE) build

rebuild:
	$(COMPOSE) -f $(FILE) build --no-cache

clean:
	$(COMPOSE) -f $(FILE) down --rmi local 2>/dev/null || true

dev:
	@echo "Terminal 1: npm run dev:server"
	@echo "Terminal 2: npm run dev:client   (Vite, default http://localhost:5173)"

typecheck:
	npm run typecheck
