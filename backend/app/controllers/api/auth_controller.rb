# frozen_string_literal: true
module Api
  class AuthController < FrontendController
    def start
      uuid = SecureRandom.uuid
      host =
        ENV.fetch("FINAL_HOST") do
          if Rails.env.development?
            request.host_with_port
          else
            raise "FINAL_HOST must be set in production"
          end
        end
      url =
        "https://open.sonolus.com/external-login/#{host}/api/login/callback?uuid=#{uuid}"
      render json: { url:, uuid: }
    end

    def callback
      body = request.body.read
      signature = request.headers["Sonolus-Signature"]
      unless signature
        logger.warn "No signature"
        render json: { error: "No signature" }, status: :unauthorized
        return
      end
      unless JWT::JWA::Ecdsa.verify(
               "ES256",
               SonolusController::SONOLUS_PUBLIC_KEY.verify_key,
               body,
               Base64.strict_decode64(signature)
             )
        logger.warn "Invalid signature"
        render json: { error: "Invalid signature" }, status: :unauthorized
        return
      end
      unless params[:type] == "authenticateExternal"
        logger.warn "Invalid type: #{params[:type]}"
        render json: { error: "Invalid type" }, status: :unauthorized
        return
      end
      if !Rails.env.development? &&
           !params[:url].ends_with?(
             "//#{request.host}/api/login/callback?uuid=#{params[:uuid]}"
           )
        logger.warn "Invalid url: #{params[:url]}"
        render json: { error: "Invalid url" }, status: :unauthorized
        return
      end
      unless params[:time] &&
               (Time.now.to_i - (params[:time] / 1000)) < 1.minute
        render json: { error: "Expired time" }, status: :unauthorized
        return
      end

      user = User.sync_profile(params[:userProfile])
      uuid = params[:uuid]
      $redis.with do |conn|
        conn.set("sonolus_login/#{uuid}", user.id, ex: 30.minutes)
      end

      render json: { message: I18n.t("sonolus.auth.external_done") }
    end

    def status
      uuid = params[:uuid]
      unless uuid
        render json: {
                 code: "not_found",
                 message: "Not Found"
               },
               status: :not_found
        return
      end

      $redis.with do |conn|
        status = conn.get("sonolus_login/#{uuid}")
        if status
          session[:user_id] = status.to_i
          render json: { code: "ok" }
        else
          render json: {
                   code: "not_found",
                   message: "Not Found"
                 },
                 status: :not_found
        end
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
