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
    params.permit(:c_background)
    background_version = params[:c_background]
    self.background_version =
      (background_version ? background_version.to_s.delete_prefix("v").to_i : 3)
  end

  around_action do |_, action|
    unless request.headers["Sonolus-Session"]
      action.call
      next
    end
    session_id = request.headers["Sonolus-Session"]
    begin
      unless user_profile =
               $redis
                 .with { |c| c.get("sonolus_session/#{session_id}") }
                 &.then { |json| JSON.parse(json, symbolize_names: true) }
        logger.warn "Invalid session id: #{session_id}"
        render json: { error: "Session expired" }, status: :unauthorized
        next
      end
      user = User.find_by(handle: user_profile[:handle], owner_id: nil)

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

  def background_version
    warn RequestLocals.store.inspect
    RequestLocals.store[:sonolus_background_version]
  end

  def background_version=(value)
    RequestLocals.store[:sonolus_background_version] = value
  end

  def dummy_level(key, name, cover: nil, **)
    if cover.nil?
      cover_data = { type: "LevelCover", url: "" }
    else
      cover_path = Rails.public_path.join("assets", "#{cover}.png")
      raise "Cover not found: #{cover_path}" unless File.exist?(cover_path)
      cover_data = {
        url: "/assets/#{cover}.png",
        hash: Digest::SHA1.file(cover_path).hexdigest
      }
    end
    {
      name: "chcy-sys-#{name}",
      title: I18n.t("levels.#{key}.title", **),
      artists: I18n.t("levels.#{key}.description", **),
      author: I18n.t("levels._.author", **),
      version: 1,
      tags: [],
      rating: 0,
      engine: {
        author: "Nanashi. (Forked from Burrito)",
        background: {
          name: "chcy-sys-dummy",
          version: 0,
          title: "",
          subtitle: "",
          author: "",
          thumbnail: {
            hash: "",
            url: ""
          },
          data: {
            hash: "",
            url: ""
          },
          image: {
            hash: "",
            url: ""
          },
          configuration: {
            hash: "",
            url: ""
          },
          source: "",
          tags: []
        },
        configuration: {
          hash: "",
          url: ""
        },
        playData: {
          hash: "",
          url: ""
        },
        tutorialData: {
          hash: "",
          url: ""
        },
        previewData: {
          hash: "",
          url: ""
        },
        watchData: {
          hash: "",
          url: ""
        },
        name: "",
        particle: {
          author: "",
          data: {
            hash: "",
            url: ""
          },
          name: "",
          subtitle: "",
          description: "",
          texture: {
            hash: "",
            url: ""
          },
          thumbnail: {
            hash: "",
            url: ""
          },
          title: "",
          version: 3,
          source: "",
          tags: []
        },
        skin: {
          author: "",
          data: {
            hash: "",
            url: ""
          },
          name: "",
          subtitle: "",
          description: "",
          texture: {
            hash: "",
            url: ""
          },
          thumbnail: {
            hash: "",
            url: ""
          },
          title: "",
          version: 4,
          source: "",
          tags: []
        },
        effect: {
          audio: {
            hash: "",
            url: ""
          },
          author: "",
          data: {
            hash: "",
            url: ""
          },
          name: "",
          subtitle: "",
          description: "",
          thumbnail: {
            hash: "",
            url: ""
          },
          title: "",
          version: 5,
          source: "",
          tags: []
        },
        description: "",
        subtitle: "",
        thumbnail: {
          hash: "",
          url: ""
        },
        title: "-",
        version: 0,
        source: "https://cc.sevenc7c.com",
        tags: []
      },
      cover: cover_data,
      bgm: {
        hash: "",
        url: ""
      },
      data: {
        hash: "",
        url: ""
      },
      useSkin: {
        useDefault: true
      },
      useBackground: {
        useDefault: true
      },
      useEffect: {
        useDefault: true
      },
      useParticle: {
        useDefault: true
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
             hasCommunity: false,
             description: "",
             sections: []
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

    render json: {
             session: session_id,
             expiration: (Time.now.to_f + 30.minutes) * 1000
           }
  end

  after_action { headers["Sonolus-Version"] = "0.8.8" }

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
