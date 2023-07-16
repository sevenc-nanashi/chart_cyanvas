# frozen_string_literal: true

require "console/compatible/logger"

logger =
  ActiveSupport::TaggedLogging.new(
    Console::Compatible::Logger.new("Sidekiq", Console.logger.output)
  )
Sidekiq.configure_server do |config|
  config.redis = { url: ENV["REDIS_URL"] }
  config.logger = logger
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV["REDIS_URL"] }
  config.logger = logger
end
