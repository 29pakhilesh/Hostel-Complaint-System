SHELL := /bin/bash

.PHONY: help install backend-install frontend-install migrate-db backend frontend dev stop-backend stop-frontend

help:
	@echo "Available commands:"
	@echo "  make install        - Install backend and frontend dependencies"
	@echo "  make backend        - Start backend server (port 5002)"
	@echo "  make frontend       - Start frontend dev server (Vite)"
	@echo "  make dev            - Start backend and frontend (run in separate terminals)"
	@echo "  make migrate-db     - Run all database migrations (v1, v2, v3)"
	@echo "  make stop-backend   - Stop backend server on port 5002"
	@echo "  make stop-frontend  - Stop Vite dev server (common ports)"

install: backend-install frontend-install

backend-install:
	cd backend && npm install

frontend-install:
	cd frontend && npm install

migrate-db:
	cd backend && npm run migrate && npm run migrate-v2 && npm run migrate-v3

backend:
	cd backend && npm start

frontend:
	cd frontend && npm run dev

# Convenience: remind user to run in two terminals
dev:
	@echo "Run backend and frontend in two terminals:"
	@echo "  Terminal 1: make backend"
	@echo "  Terminal 2: make frontend"

stop-backend:
	-@lsof -ti:5002 | xargs kill -9 2>/dev/null || echo "No backend running on port 5002"

stop-frontend:
	-@lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || echo "No Vite dev server running on ports 3000–3002"

