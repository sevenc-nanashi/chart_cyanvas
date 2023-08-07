frontend: cd frontend && pnpm dev
backend: cd backend && CONSOLE_OUTPUT=XTerm bundle exec rails s -p 3000 -u puma -e development
backend-sidekiq: cd backend && CONSOLE_OUTPUT=XTerm bundle exec sidekiq
sub-audio: cd sub-audio && poetry poe dev
sub-image: cd sub-image && poetry poe dev
sub-chart: cd sub-chart && pnpm dev

