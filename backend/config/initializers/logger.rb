# frozen_string_literal: true

require "rails"

require "console"
require "console/compatible/logger"

if ActiveSupport::Logger.respond_to?(:logger_outputs_to?)
  # https://github.com/rails/rails/issues/44800
  class ActiveSupport::Logger
    def self.logger_outputs_to?(*)
      true
    end
  end
end

Rails.logger = ActiveSupport::TaggedLogging.new(Console::Compatible::Logger.new("Rails", Console.logger.output))
