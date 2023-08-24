# frozen_string_literal: true
require "openssl"
require "openssl/oaep"
require "request_store_rails"

class SonolusController < ApplicationController
  SONOLUS_PUBLIC_KEY =
    OpenSSL::PKey::RSA.new(
      Rails.root.join("config/sonolus_key.pub").read
    ).freeze

  around_action do |_, action|
    params.permit(:localization)
    locale = params[:localization] || I18n.default_locale
    begin
      I18n.with_locale(locale, &action)
    rescue I18n::InvalidLocale
      I18n.with_locale(:en, &action)
    end
  end

  around_action do |_, action|
    unless request.headers["Sonolus-Session-Id"] &&
             request.headers["Sonolus-Session-Data"]
      action.call
      next
    end
    session_id = request.headers["Sonolus-Session-Id"]
    unless session_data_raw =
             $redis.with { |c| c.get("sonolus_auth_session/#{session_id}") }
      logger.warn "Invalid session id: #{session_id}"
      render json: { error: "Session expired" }, status: :unauthorized
      next
    end
    begin
      session_data_encoded = JSON.parse(session_data_raw, symbolize_names: true)
      sonolus_seasion_data = {
        id: session_data_encoded[:id],
        key: Base64.strict_decode64(session_data_encoded[:key]),
        iv: Base64.strict_decode64(session_data_encoded[:iv])
      }
      aes = OpenSSL::Cipher.new("aes-256-cbc")
      aes.decrypt
      aes.key = sonolus_seasion_data[:key]
      aes.iv = sonolus_seasion_data[:iv]
      user_data =
        JSON.parse(
          aes.update(
            Base64.strict_decode64(request.headers["Sonolus-Session-Data"])
          ) + aes.final,
          symbolize_names: true
        )
      self.session_data = { user: user_data[:userProfile] }
      user_profile = user_data[:userProfile]
      table_contents = {
        handle: user_profile[:handle],
        name: user_profile[:name],
        about_me: user_profile[:aboutMe],
        fg_color: user_profile[:avatarForegroundColor],
        bg_color: user_profile[:avatarBackgroundColor]
      }

      user =
        if (u = User.find_by(handle: user_profile[:handle], owner_id: nil))
          if table_contents.each_pair.any? { |k, v| u[k] != v }
            logger.info "User #{u.handle} updated, updating table"
            u.update!(table_contents)
          else
            logger.info "User #{u.handle} not updated, skipping table update"
          end
          u
        else
          User.create(table_contents)
        end

      self.current_user = user
    rescue StandardError => e
      logger.warn "Invalid session data:"
      logger.warn [e, *e.backtrace].join("\n")
      render json: { error: "Invalid session" }, status: :unauthorized
      next
    else
      action.call
    end
  end

  def session_data
    RequestLocals.store[:sonolus_auth_session]
  end

  def session_data=(value)
    RequestLocals.store[:sonolus_auth_session] = value
  end

  def current_user
    RequestLocals.store[:sonolus_auth_user]
  end

  def current_user=(value)
    RequestLocals.store[:sonolus_auth_user] = value
  end

  def dummy_level(key, name, cover: nil, **kwargs)
    if cover.nil?
      cover_data = { type: "LevelCover", url: "" }
    else
      cover_path = Rails.public_path.join("assets", "#{cover}.png")
      raise "Cover not found: #{cover_path}" unless File.exist?(cover_path)
      cover_data = {
        type: "LevelCover",
        url: "/assets/#{cover}.png",
        hash: Digest::SHA1.file(cover_path).hexdigest
      }
    end
    {
      name: "chcy-sys-#{name}",
      title: I18n.t("levels.#{key}.title", **kwargs),
      artists: I18n.t("levels.#{key}.description", **kwargs),
      author: I18n.t("levels._.author", **kwargs),
      version: 1,
      rating: 0,
      engine: {
        name: "chcy-dummy",
        version: 0,
        title: I18n.t("levels._.engine-title", **kwargs)
      },
      cover: cover_data,
      bgm: {
        type: "LevelBgm",
        url: ""
      },
      data: {
        type: "LevelData",
        url: ""
      }
    }
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

  def dummy_level_info
    params.permit :id
    render json: {
             item: dummy_level("dummy", "dummy", cover: "error"),
             description: "",
             recommended: []
           }
  end

  def authenticate
    auth_data = {
      id: SecureRandom.urlsafe_base64(32),
      key: SecureRandom.random_bytes(32),
      iv: SecureRandom.random_bytes(16)
    }
    auth_data_encoded = {
      id: auth_data[:id],
      key: Base64.strict_encode64(auth_data[:key]),
      iv: Base64.strict_encode64(auth_data[:iv])
    }
    encrypted =
      SONOLUS_PUBLIC_KEY.public_encrypt_oaep(auth_data_encoded.to_json)

    $redis.with do |conn|
      conn.set(
        "sonolus_auth_session/#{auth_data[:id]}",
        auth_data_encoded.to_json,
        ex: 5.minutes
      )
    end

    address =
      ENV.fetch(
        "HOST",
        (Rails.env.development? ? "http://" : "https://") +
          request.host_with_port
      )
    address += "/auth" if request.path.start_with?("/auth/sonolus")
    address += "/test" if request.path.start_with?("/test/sonolus")
    render json: {
             address:,
             session: Base64.strict_encode64(encrypted),
             expiration: ((Time.now.to_f + 5.minutes) * 1000).to_i
           }
  end

  after_action { headers["Sonolus-Version"] = "0.7.2" }

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
