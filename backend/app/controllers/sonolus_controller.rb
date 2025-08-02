# frozen_string_literal: true
require "jwt"
require "base64"
require "request_store_rails"

class SonolusController < ApplicationController
  SONOLUS_PUBLIC_KEY =
    JWT::JWK::EC.new(
      {
        kty: "EC",
        crv: "P-256",
        x: "d2B14ZAn-zDsqY42rHofst8rw3XB90-a5lT80NFdXo0",
        y: "Hxzi9DHrlJ4CVSJVRnydxFWBZAgkFxZXbyxPSa8SJQw"
      }
    )
  BACKGROUND_VERSIONS = %i[v1 v3 tablet_v1 tablet_v3].freeze

  around_action do |_, action|
    params.permit(:localization)
    locale = params[:localization] || I18n.default_locale
    begin
      I18n.with_locale(locale, &action)
    rescue I18n::InvalidLocale
      I18n.with_locale(:en, &action)
    end
  end

  before_action do
    params.permit(:c_background, :c_genres)
    background_version =
      BACKGROUND_VERSIONS.find { |v| v.to_s == params[:c_background] } || :v3

    self.background_version = background_version

    genres =
      (params[:c_genres] || "")
        .split(",")
        .filter_map do |genre|
          if Chart::GENRES.key?(genre.to_sym)
            genre.to_sym
          else
            logger.warn "Invalid genre: #{genre}"
            nil
          end
        end

    self.user_genres = (genres.empty? ? Chart::GENRES.keys : genres)
  end

  # around_action do |_, action|
  #   unless request.headers["Sonolus-Session"]
  #     action.call
  #     next
  #   end
  #   session_id = request.headers["Sonolus-Session"]
  #   begin
  #     unless user_profile =
  #              $redis
  #                .with { |c| c.get("sonolus_session/#{session_id}") }
  #                &.then { |json| JSON.parse(json, symbolize_names: true) }
  #       logger.warn "Invalid session id: #{session_id}"
  #       render json: { message: "Session expired" }, status: :unauthorized
  #       next
  #     end
  #     user =
  #       Rails
  #         .cache
  #         .fetch(
  #           "sonolus:auth:#{user_profile[:handle]}",
  #           expires_in: 30.minutes
  #         ) do
  #           Rails.logger.debug do
  #             "Fetching user #{user_profile[:handle]} from DB"
  #           end
  #           User.find_by(handle: user_profile[:handle], owner_id: nil)
  #         end
  #
  #     self.current_user = user
  #   rescue StandardError => e
  #     logger.warn "Invalid session data:"
  #     logger.warn [e, *e.backtrace].join("\n")
  #     render json: { message: "Invalid session" }, status: :unauthorized
  #     next
  #   else
  #     action.call
  #   end
  # end

  def session_data
    RequestLocals.store[:sonolus_auth_session]
  end

  def session_data=(value)
    RequestLocals.store[:sonolus_auth_session] = value
  end

  def current_user
    return nil unless request.headers["Sonolus-Session"]
    if RequestLocals.store[:sonolus_auth_user].nil?
      session_id = request.headers["Sonolus-Session"]
      begin
        unless user_profile =
                 $redis
                   .with { |c| c.get("sonolus_session/#{session_id}") }
                   &.then { |json| JSON.parse(json, symbolize_names: true) }
          logger.warn "Invalid session id: #{session_id}"
          render json: { message: "Session expired" }, status: :unauthorized
          return
        end
        user =
          Rails
            .cache
            .fetch(
              "sonolus:auth:#{user_profile[:handle]}",
              expires_in: 30.minutes
            ) do
              Rails.logger.debug do
                "Fetching user #{user_profile[:handle]} from DB"
              end
              User.find_by(handle: user_profile[:handle], owner_id: nil)
            end

        self.current_user = user
      rescue StandardError => e
        logger.warn "Invalid session data:"
        logger.warn [e, *e.backtrace].join("\n")
        render json: { message: "Invalid session" }, status: :unauthorized
        return
      end
    end
    RequestLocals.store[:sonolus_auth_user]
  end

  def current_user=(value)
    RequestLocals.store[:sonolus_auth_user] = value
  end

  def background_version
    RequestLocals.store[:sonolus_background_version]
  end

  def background_version=(value)
    RequestLocals.store[:sonolus_background_version] = value
  end

  def user_genres
    RequestLocals.store[:sonolus_genres] || Chart::GENRES.keys
  end

  def user_genres=(value)
    RequestLocals.store[:sonolus_genres] = value
  end

  def banner(name)
    banner_path = Rails.public_path.join("assets", "#{name}.png")
    raise "Banner not found: #{cover_path}" unless File.exist?(banner_path)
    {
      type: "ServerBanner",
      url: "/assets/#{name}.png",
      hash: Digest::SHA1.file(banner_path).hexdigest
    }
  end

  def authenticate
    body = request.body.read
    signature = request.headers["Sonolus-Signature"]
    unless signature
      logger.warn "No signature"
      render json: { error: "No signature" }, status: :unauthorized
      return
    end
    unless JWT::JWA::Ecdsa.verify(
             "ES256",
             SONOLUS_PUBLIC_KEY.verify_key,
             body,
             Base64.strict_decode64(signature)
           )
      logger.warn "Invalid signature"
      render json: { error: "Invalid signature" }, status: :unauthorized
      return
    end
    unless params[:type] == "authenticateServer"
      logger.warn "Invalid type"
      render json: { error: "Invalid type" }, status: :unauthorized
      return
    end
    if params[:address].exclude?(ENV["FINAL_HOST"])
      logger.warn "Invalid address"
      render json: { error: "Invalid address" }, status: :unauthorized
      return
    end
    if Time.now.to_i - (params[:time] / 1000) >= 1.minute
      logger.warn "Time too old"
      render json: { error: "Expired time" }, status: :unauthorized
      return
    end

    session_id = SecureRandom.uuid

    $redis.with do |conn|
      conn.set(
        "sonolus_session/#{session_id}",
        params[:userProfile].to_json,
        ex: 30.minutes
      )
    end

    User.sync_profile(params[:userProfile])

    Rails.cache.delete("sonolus:auth:#{params[:userProfile][:handle]}")

    render json: {
             session: session_id,
             expiration: (Time.now.to_f + 30.minutes) * 1000
           }
  end

  after_action { headers["Sonolus-Version"] = "1.0.0" }

  around_action do |_controller, action|
    success = false
    catch :unauthorized do
      action.call
      success = true
    end
    unless success
      render json: {
               code: "not_logged_in",
               error: "You are not logged in"
             },
             status: :unauthorized
    end
  end

  def require_login!
    throw :unauthorized unless current_user
  end
end
