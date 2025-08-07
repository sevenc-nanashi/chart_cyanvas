#!/usr/bin/env -S falcon-host
# frozen_string_literal: true

require "falcon/environment/rack"

hostname = File.basename(__dir__)

service hostname do
  include Falcon::Environment::Rack
  count 1 if ENV["RAILS_ENV"] != "production"

  # This file will be loaded in the main process before forking.
  preload "preload.rb"

  # Default to port 3000 unless otherwise specified.
  port { ENV.fetch("PORT", 3000).to_i }

  # Default to HTTP/1.1.
  endpoint do
    Async::HTTP::Endpoint.parse("http://0.0.0.0:#{port}").with(
      protocol: Async::HTTP::Protocol::HTTP11
    )
  end
end
