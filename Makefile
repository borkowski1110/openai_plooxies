.PHONY: env
env:
	@if [ ! -f POSTGRES_PASSWORD ]; then openssl rand -base64 32 | tr -d '/' > /tmp/POSTGRES_PASSWORD && chmod 644 /tmp/POSTGRES_PASSWORD && mv /tmp/POSTGRES_PASSWORD POSTGRES_PASSWORD; else echo 'Skipping setting POSTGRES_PASSWORD'; fi

.PHONY: up
up:
	@docker compose up -d --build

.PHONY: clean
clean:
	@docker compose down -v

.PHONY: dev
dev:
	@echo "Starting services (Press Ctrl+C to stop all)..."
	@(trap './opik/opik.sh --stop & rm -r -f opik & kill $${DOCKER_PID} $${NPM_PID} 2>/dev/null' EXIT INT TERM; \
	git clone https://github.com/comet-ml/opik.git & ./opik/opik.sh; \
	docker compose -f compose.yaml -f compose.dev.yaml up --build & DOCKER_PID=$$!; \
	(cd client && npm run dev) & NPM_PID=$$!; \
	wait)
	
.PHONY: restart
restart:
	@docker compose restart


# Special target to handle additional arguments
%:
	@:
