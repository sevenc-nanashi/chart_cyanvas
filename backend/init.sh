#!/usr/bin/env bash
set -e

echo "Deleting pid file"
rm -f /app/tmp/pids/server.pid

echo "Setting up database..."
rails db:create
rails db:migrate

echo "Starting server..."
rails s
