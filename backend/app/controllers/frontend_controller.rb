# frozen_string_literal: true
require "http"

class FrontendController < ApplicationController
  include ActionController::Cookies
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
    else
      nil
    end
  end
end
