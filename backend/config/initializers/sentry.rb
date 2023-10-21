# frozen_string_literal: true

require "sentry-ruby"

if ENV["SENTRY_DSN_BACKEND"].present?
  traces_sample_rate = ENV["SENTRY_TRACES_SAMPLE_RATE"]&.to_f || 0.1
  Sentry.init do |config|
    config.dsn = ENV["SENTRY_DSN_BACKEND"]
    config.breadcrumbs_logger = [:active_support_logger]

    config.traces_sample_rate = traces_sample_rate
    
    config.before_send = lambda do |event, hint|
      if hint[:exception].is_a?(ActiveRecord::ConnectionTimeoutError)
        nil
      else
        event
      end
    end
  end
end
