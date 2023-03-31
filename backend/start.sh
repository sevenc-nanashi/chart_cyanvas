#!/usr/bin/env bash
set -e
echo "Starting server"
rm -f tmp/pids/server.pid

echo "Setting up database"
rails db:create db:migrate

echo "Starting sidekiq"
sidekiq -C config/sidekiq.yml &

echo "Starting rails server"
rails s
