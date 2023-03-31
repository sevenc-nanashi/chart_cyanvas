# frozen_string_literal: true

require "redis"

$redis ||=
  ConnectionPool.new(size: ENV.fetch("RAILS_MAX_THREADS", 10), timeout: 5) do
    Redis.new(url: ENV.fetch("REDIS_URL"))
  end
