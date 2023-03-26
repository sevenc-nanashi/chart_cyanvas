# frozen_string_literal: true

require "redis"

$redis ||=
  ConnectionPool.new(size: ENV.fetch("RAILS_MAX_THREADS", 10), timeout: 5) do
    Redis.new(url: ENV.fetch("REDIS_URL"))
  end
$redis.with do |conn|
  conn.set("job_count", 0)
  conn.set("total_job_count", 0)
  conn.set("error_job_count", 0)
  conn.set("success_job_count", 0)
end
