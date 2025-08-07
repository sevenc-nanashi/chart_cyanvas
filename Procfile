frontend: cd frontend && pnpm dev
backend: cd backend && CONSOLE_OUTPUT=XTerm bundle exec falcon serve -b http://127.0.0.1:3000 -n 1
backend-sidekiq: cd backend && CONSOLE_OUTPUT=XTerm bundle exec sidekiq
sub-audio: cd sub-audio && uv run task dev
sub-image: cd sub-image && cargo run
sub-chart: cd sub-chart && pnpm dev
sub-temp-storage: cd sub-temp-storage && cargo run
wiki: cd wiki && pnpm dev

