install:
	cd frontend && pnpm install
	cd backend && bundle install
	cd sub-audio && poetry install
	cd sub-image && poetry install
	cd sub-chart && pnpm install

.PHONY: install
