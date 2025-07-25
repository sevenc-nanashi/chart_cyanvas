# frozen_string_literal: true
require "connection_pool"
require "redis"

class ApplicationController < ActionController::API
  rescue_from ActionController::RoutingError, with: :not_found

  def index
    render json: { code: "ok" }
  end

  def meta
    render json: {
      genres: Chart::GENRES.keys,
      discord_enabled: $discord.enabled?
    }
  end

  def not_found
    render json: { code: "not_found" }, status: :not_found
  end
  after_action do
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
  end
end
