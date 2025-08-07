frontend: cd frontend && pnpm dev
backend: cd backend && CONSOLE_OUTPUT=XTerm bundle exec rails s -p 3000 -u puma
backend-sidekiq: cd backend && CONSOLE_OUTPUT=XTerm bundle exec sidekiq
sub-audio: cd sub-audio && uv run task dev
sub-image: cd sub-image && cargo run
sub-chart: cd sub-chart && pnpm dev
sub-temp-storage: cd sub-temp-storage && cargo run
wiki: cd wiki && pnpm dev

