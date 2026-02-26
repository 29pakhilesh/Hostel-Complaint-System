SHELL := /bin/bash

.PHONY: help install backend-install frontend-install migrate-db backend frontend dev stop-backend stop-frontend

help:
	@echo "Available commands:"
	@echo "  make install        - Install backend and frontend dependencies"
	@echo ""
	@echo "  Run the app (choose one):"
	@echo "  make dev            - Start backend + frontend in ONE terminal (backend in background)"
	@echo "  make backend        - Start only backend (port 5002). Use in terminal 1."
	@echo "  make frontend       - Start only frontend (Vite). Use in terminal 2."
	@echo ""
	@echo "  make migrate-db     - Run all database migrations (v1, v2, v3, v4, v5, v6)"
	@echo "  make stop-backend   - Stop backend server on port 5002"
	@echo "  make stop-frontend  - Stop Vite dev server (common ports)"

install: backend-install frontend-install

backend-install:
	cd backend && npm install

frontend-install:
	cd frontend && npm install

migrate-db:
	cd backend && npm run migrate && npm run migrate-v2 && npm run migrate-v3 && npm run migrate-v4 && npm run migrate-v5 && npm run migrate-v6

backend:
	cd backend && npm start

frontend:
	cd frontend && npm run dev

# Single terminal: backend in background, frontend in foreground (Ctrl+C stops frontend; use make stop-backend to stop backend)
dev:
	cd backend && npm start & cd frontend && npm run dev

stop-backend:
	-@lsof -ti:5002 | xargs kill -9 2>/dev/null || echo "No backend running on port 5002"

stop-frontend:
	-@lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || echo "No Vite dev server running on ports 3000–3002"

