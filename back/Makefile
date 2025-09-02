SHELL := /bin/bash

-include .env

.PHONY: dev build run migrate-up migrate-down migrate-new seed tidy

dev: tidy
	go run ./cmd/server

build:
	go build -o bin/server ./cmd/server

run:
	./bin/server

migrate-up:
	@if command -v migrate >/dev/null 2>&1; then \
	  migrate -path migrations -database "$$DATABASE_URL" up; \
	else \
	  echo "using dockerized migrate"; \
	  docker run --rm -v $$PWD/migrations:/migrations --network back_default migrate/migrate:4 -path /migrations -database "postgresql://postgres:postgres@db:5432/basetie?sslmode=disable" up; \
	fi

migrate-down:
	migrate -path migrations -database "$$DATABASE_URL" down 1

migrate-new:
	@if [ -z "$$name" ]; then echo "usage: make migrate-new name=add_table"; exit 1; fi
	migrate create -ext sql -dir migrations -seq "$$name"

seed:
	go run ./internal/tools/seed

tidy:
	go mod tidy


