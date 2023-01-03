class Api::AuthController < FrontendController
  def create_code
    code = SecureRandom.random_number(100_000_000 - 1).to_s.rjust(8, "0")
    Rails.logger.info("New auth code: #{code}")
    Rails.cache.write(
      "auth_code/#{code}",
      { authorized: false },
      expires_in: 1.5.minutes
    )
    render json: { code: "ok", authCode: code }
  end

  def check_code
    params.require :code
    code = params[:code]
    if code.blank?
      render json: {
               code: "invalid_request",
               message: "Missing auth code"
             },
             status: :bad_request
      return
    end
    unless (auth_data = Rails.cache.read("auth_code/#{code}"))
      render json: {
               code: "unknown_code",
               message: "Unknown auth code"
             },
             status: :not_found
      return
    end
    if auth_data[:authorized]
      token_data = Rails.cache.read("auth_token/#{auth_data[:token]}")
      render json: { code: "ok", user: token_data[:user].to_frontend }
      session[:user_id] = token_data[:user].id
    else
      render json: {
               code: "not_authorized",
               message: "Auth code not authorized"
             },
             status: :forbidden
    end
  end

  def restore_session
    unless session[:user_id]
      render json: {
               code: "not_authorized",
               message: "Not authorized"
             },
             status: :unauthorized
      return
    end
    user = User.find_by(id: session[:user_id])
    render json: { code: "ok", user: user.to_frontend }
  end

  def logout
    session[:user_id] = nil
    render json: { code: "ok" }
  end
end
