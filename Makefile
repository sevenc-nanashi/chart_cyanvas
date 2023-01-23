frontend:
	cd frontend && ${SHELL} ./build.sh
	docker compose --env-file $(ENV_FILE) --profile $(PROFILE) up --build -d

backend:
	docker compose --env-file $(ENV_FILE) --profile $(PROFILE) up --build -d

sub-audio:
	docker compose --env-file $(ENV_FILE) --profile $(PROFILE) up --build -d

sub-image:
	docker compose --env-file $(ENV_FILE) --profile $(PROFILE) up --build -d

sub-sus:
	cd frontend && ${SHELL} ./build.sh
	docker compose --env-file $(ENV_FILE) --profile $(PROFILE) up --build -d

.PHONY: frontend backend sub-audio sub-image sub-sus
