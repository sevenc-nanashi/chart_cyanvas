# frozen_string_literal: true
module Api
  class AuthController < FrontendController
    def create_code
      code = SecureRandom.random_number(100_000_000 - 1).to_s.rjust(8, "0")
      Rails.logger.info("New auth code: #{code}")
      $redis.with do |conn|
        conn.set(
          "auth_code/#{code}",
          { authorized: false }.to_json,
          ex: 1.5.minutes.to_i
        )
      end

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
      unless (
               auth_data =
                 $redis.with do |conn|
                   conn
                     .get("auth_code/#{code}")
                     &.then { |v| JSON.parse(v, symbolize_names: true) }
                 end
             )
        render json: {
                 code: "unknown_code",
                 message: "Unknown auth code"
               },
               status: :not_found
        return
      end
      if auth_data[:authorized]
        token_data =
          $redis.with do |conn|
            conn
              .get("auth_token/#{auth_data[:token]}")
              &.then { |v| JSON.parse(v, symbolize_names: true) }
          end
        user = User.new(token_data[:user])
        render json: {
                 code: "ok",
                 user: user.to_frontend
               }
        session[:user_id] = user.id
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
end
