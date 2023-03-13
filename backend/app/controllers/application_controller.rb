# frozen_string_literal: true
require "connection_pool"
require "redis"

class ApplicationController < ActionController::API
  rescue_from ActionController::RoutingError, with: :not_found

  def index
    render json: { code: "ok" }
  end

  def not_found
    render json: { code: "not_found" }, status: :not_found
  end
  after_action do
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
  end

  def self.revalidate(path)
    %w[ja en].each do |lang|
      HTTP.post(
        "#{ENV.fetch("FRONTEND_HOST", nil)}/api/next/revalidate",
        json: {
          path: "/#{lang}#{path}"
        }
      )
    end
    HTTP.post(
      "#{ENV.fetch("FRONTEND_HOST", nil)}/api/next/revalidate",
      json: {
        path: "/#{path}"
      }
    )
    deleted = Rails.cache.delete(path)
    logger.info "Revalidate: #{path}, deleted: #{deleted}"
  end

  def revalidate(path)
    self.class.revalidate(path)
  end
end
