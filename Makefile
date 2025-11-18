# Perfect Cut - Makefile for common tasks
# Makes Docker operations easier with simple commands

.PHONY: help build up down logs restart clean dev prod test

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Perfect Cut - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

# Production Commands
build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build

up: ## Start services in production mode
	@echo "$(BLUE)Starting services (production mode)...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Services started!$(NC)"
	@echo "Frontend: http://localhost:81"
	@echo "Backend: http://localhost:8001"
	@echo "API Docs: http://localhost:8001/docs"

down: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	docker-compose restart

status: ## Show status of all services
	@echo "$(BLUE)Service Status:$(NC)"
	docker-compose ps

# Development Commands
dev: ## Start services in development mode with hot reload
	@echo "$(BLUE)Starting services (development mode)...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)Development services started!$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:8005"

dev-down: ## Stop development services
	@echo "$(YELLOW)Stopping development services...$(NC)"
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## View development logs
	docker-compose -f docker-compose.dev.yml logs -f

# Database Commands
db-shell: ## Access PostgreSQL shell
	@echo "$(BLUE)Connecting to database...$(NC)"
	docker-compose exec db psql -U postgres -d perfectcut

db-backup: ## Backup database to backup.sql
	@echo "$(BLUE)Creating database backup...$(NC)"
	docker-compose exec -T db pg_dump -U postgres perfectcut > backup.sql
	@echo "$(GREEN)Backup created: backup.sql$(NC)"

db-restore: ## Restore database from backup.sql
	@echo "$(YELLOW)Restoring database from backup.sql...$(NC)"
	docker-compose exec -T db psql -U postgres perfectcut < backup.sql
	@echo "$(GREEN)Database restored!$(NC)"

migrate: ## Run database migrations
	@echo "$(BLUE)Running migrations...$(NC)"
	docker-compose exec backend alembic upgrade head

# Service-specific Commands
backend-shell: ## Access backend container shell
	docker-compose exec backend sh

backend-logs: ## View backend logs only
	docker-compose logs -f backend

frontend-logs: ## View frontend logs only
	docker-compose logs -f frontend

# Cleanup Commands
clean: ## Stop services and remove volumes (CAUTION: deletes data)
	@echo "$(YELLOW)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)Cleanup complete$(NC)"; \
	fi

clean-images: ## Remove all Perfect Cut Docker images
	@echo "$(BLUE)Removing Docker images...$(NC)"
	docker-compose down --rmi all

prune: ## Clean up Docker system (unused images, containers, etc.)
	@echo "$(BLUE)Cleaning up Docker system...$(NC)"
	docker system prune -f

# Setup Commands
setup: ## Initial setup (copy .env and start services)
	@echo "$(BLUE)Setting up Perfect Cut...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)Created .env file$(NC)"; \
	else \
		echo "$(YELLOW).env already exists$(NC)"; \
	fi
	@$(MAKE) up

# Test Commands
test-backend: ## Run backend tests
	docker-compose exec backend pytest

test-frontend: ## Run frontend tests
	docker-compose exec frontend npm test

# Production Commands
prod-build: ## Build for production (no cache)
	@echo "$(BLUE)Building production images...$(NC)"
	docker-compose build --no-cache

prod-deploy: ## Deploy to production
	@echo "$(BLUE)Deploying to production...$(NC)"
	@$(MAKE) prod-build
	@$(MAKE) up
	@echo "$(GREEN)Deployment complete!$(NC)"

# Health Check
health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo "Database:"
	@docker-compose exec db pg_isready -U postgres || echo "$(YELLOW)Database not ready$(NC)"
	@echo "\nBackend:"
	@curl -s http://localhost:8001/health > /dev/null && echo "$(GREEN)Healthy$(NC)" || echo "$(YELLOW)Not healthy$(NC)"
	@echo "\nFrontend:"
	@curl -s http://localhost:81/health > /dev/null && echo "$(GREEN)Healthy$(NC)" || echo "$(YELLOW)Not healthy$(NC)"

# Quick Commands
start: up ## Alias for 'up'
stop: down ## Alias for 'down'

# Default target
.DEFAULT_GOAL := help
