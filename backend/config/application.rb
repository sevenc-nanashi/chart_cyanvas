# frozen_string_literal: true
require_relative "boot"
require "dotenv"
require "console/compatible/logger"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

Dotenv.overload(
  *(
    %w[../.env ../.env.local ../../.env ../../.env.local].map do |f|
      "#{__dir__}/#{f}"
    end
  )
)

module Backend
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    config.active_support.to_time_preserves_timezone = :zone

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CacheStore
    config.middleware.use ActionDispatch::Flash

    enable_stackprof =
      Rails.env.development? && Rails.root.join("tmp/stackprof-dev.txt").exist?

    config.middleware.use StackProf::Middleware,
                          enabled: enable_stackprof,
                          mode: :wall,
                          interval: 1000,
                          save_every: 1,
                          raw: true,
                          path: Rails.root.join("tmp/stackprof/").to_s

    config.paths.add "lib", eager_load: true

    config.active_job.queue_adapter = :sidekiq

    logger = Console::Compatible::Logger.new("Rails", Console.logger.output)
    logger.info!
    config.logger = ActiveSupport::TaggedLogging.new(logger)
  end
end
