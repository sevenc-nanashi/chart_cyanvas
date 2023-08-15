# frozen_string_literal: true

require "sentry-ruby"

if ENV["SENTRY_DSN_BACKEND"].present?
  Sentry.init do |config|
    config.dsn = ENV["SENTRY_DSN_BACKEND"]
    config.breadcrumbs_logger = [:active_support_logger]
  end
end
