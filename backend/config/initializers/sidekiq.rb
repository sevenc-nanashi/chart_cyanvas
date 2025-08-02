# frozen_string_literal: true

require "console/compatible/logger"

logger =
  ActiveSupport::TaggedLogging.new(
    Console::Compatible::Logger.new("Sidekiq", Console.logger.output)
  )

if Rails.env.production?
  logger.level = :info
end

Sidekiq.configure_server do |config|
  config.redis = { url: ENV.fetch("REDIS_URL", nil), network_timeout: 10 }
  config.logger = logger
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch("REDIS_URL", nil) }
  config.logger = logger
end
