# frozen_string_literal: true

require "console/compatible/logger"
Sidekiq.configure_server do |config|
  config.redis = { url: ENV["REDIS_URL"] }
  config.logger =
    Console::Compatible::Logger.new("Sidekiq", Console.logger.output)
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV["REDIS_URL"] }
  config.logger =
    Console::Compatible::Logger.new("Sidekiq", Console.logger.output)
end
