require "http"

class FrontendController < ApplicationController
  include ActionController::Cookies
  def session_data
    RequestLocals.store[:frontend_auth_session]
  end

  def session_data=(value)
    RequestLocals.store[:frontend_auth_session] = value
  end
end
