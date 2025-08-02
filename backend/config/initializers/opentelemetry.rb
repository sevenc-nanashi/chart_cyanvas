# frozen_string_literal: true
require "console/compatible/logger"
require "opentelemetry/sdk"
require "opentelemetry/instrumentation/all"

OpenTelemetry::SDK.configure do |c|
  c.service_name = "backend"
  c.use_all
  c.logger =
    Console::Compatible::Logger.new("OpenTelemetry", Console.logger.output)
end
