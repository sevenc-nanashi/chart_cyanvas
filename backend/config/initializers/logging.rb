# frozen_string_literal: true
require "console"
require "active_support/log_subscriber"
require "active_record/log_subscriber"

class LogSubscriber < ActiveSupport::LogSubscriber
  IGNORE_PAYLOAD_NAMES = %w[SCHEMA EXPLAIN TRANSACTION].freeze

  def sql(event)
    return if IGNORE_PAYLOAD_NAMES.include?(event.payload[:name])

    payload = event.payload.dup
    Console.logger&.info(
        "SQL",
        payload[:sql],
        allocations: event.allocations,
        duration: event.duration
      )
  end

  def process_action(event)
    return unless Console.logger

    payload = event.payload.dup
    payload[:params] = payload[:params].except(:controller, :action)
    Console.logger.info(
      "HTTP",
      "#{payload[:method].upcase} #{payload[:path]} => #{payload[:controller]}##{payload[:action]}",
      allocations: event.allocations,
      duration: event.duration
    )
  end
end

# Configure the logger for ActiveRecord
LogSubscriber.attach_to(
  :active_record,
  LogSubscriber.new,
  ActiveSupport::Notifications
)
LogSubscriber.attach_to(
  :action_controller,
  LogSubscriber.new,
  ActiveSupport::Notifications
)
