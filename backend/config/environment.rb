# frozen_string_literal: true
# Load the Rails application.
require_relative "application"

require "console/adapter/rails"

Console::Adapter::Rails::ActiveRecord.apply!
# Initialize the Rails application.
Rails.application.initialize!
