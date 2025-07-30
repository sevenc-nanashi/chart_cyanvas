# frozen_string_literal: true
require "http"

class FrontendController < ApplicationController
  include ActionController::Cookies

  def meta
    render json: {
             genres: Chart::GENRES.keys,
             discordEnabled: $discord.enabled?
           }
  end

  def session_data
    RequestLocals.store[:frontend_auth_session]
  end

  def session_data=(value)
    RequestLocals.store[:frontend_auth_session] = value
  end

  def current_user
    if RequestLocals.store[:frontend_current_user]
      RequestLocals.store[:frontend_current_user]
    elsif session
      RequestLocals.store[:frontend_current_user] = User.find_by(
        id: session[:user_id]
      )
    end
  end

  around_action do |_controller, action|
    catch :abort do
      action.call
    end
  end

  def require_login!
    unless current_user
      render json: {
               code: "not_logged_in",
               error: "You are not logged in"
             },
             status: :unauthorized
      throw :abort
    end
  end
  def require_discord!
    if $discord.enabled? && !current_user.check_discord
      render json: {
               code: "no_discord",
               error: "Failed to verify discord link"
             },
             status: :forbidden
      throw :abort
    end
  end
end
