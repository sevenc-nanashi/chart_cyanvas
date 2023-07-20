# frozen_string_literal: true

require "cgi"

class Api::DiscordController < FrontendController
  def redirect_uri
    ENV.fetch(
      "HOST",
      (Rails.env.development? ? "http://" : "https://") + request.host_with_port
    ) + "/api/discord/callback"
  end
  def scope
    %w[identify guilds role_connections.write]
  end
  def my_discord
    require_login!

    unless current_user.discord_ok?
      render json: { discord: nil }
      return
    end

    render json: {
             discord: {
               displayName: current_user.discord_display_name,
               username: current_user.discord_username,
               avatar: current_user.discord_avatar
             }
           }
  end
  def link
    unless current_user
      redirect_to "/login?to=/api/discord/link?#{request.query_string}"
      return
    end
    state = SecureRandom.urlsafe_base64(32)
    $redis.with do |conn|
      conn.set(
        "discord_auth_token/#{state}",
        { user_id: session[:user_id] }.to_json,
        ex: 5.minutes
      )
    end
    redirect_to "https://discord.com/api/oauth2/authorize" \
                  "?client_id=#{ENV["DISCORD_CLIENT_ID"]}" \
                  "&redirect_uri=#{CGI.escape(redirect_uri)}" \
                  "&response_type=code" \
                  "&scope=#{scope.join("+")}" \
                  "&state=#{state}",
                allow_other_host: true
  end

  def callback
    params.permit %i[code state error]
    if params[:error]
      redirect_to "/charts/upload"
      return
    end
    unless current_user
      redirect_to "/login?to=/api/discord/callback?#{request.query_string}"
      return
    end

    data =
      $redis
        .with { |conn| conn.get("discord_auth_token/#{params[:state]}") }
        &.then { |json| JSON.parse(json, symbolize_names: true) }

    unless data && data[:user_id] == session[:user_id]
      render json: { error: "Invalid state" }, status: :bad_request
      return
    end

    payload = {
      client_id: ENV["DISCORD_CLIENT_ID"],
      client_secret: ENV["DISCORD_CLIENT_SECRET"],
      grant_type: "authorization_code",
      code: params[:code],
      redirect_uri: redirect_uri,
      scope: scope.join(" ")
    }

    response =
      begin
        $discord.post("/oauth2/token", form: payload)
      rescue StandardError
        redirect_to "/discord/error?code=discord_error"
        return
      end

    current_user.update!(
      discord_token: response["access_token"],
      discord_refresh_token: response["refresh_token"],
      discord_expires_at: Time.now + response["expires_in"].to_i.seconds
    )

    $redis.with { |conn| conn.del("discord_auth_token/#{params[:state]}") }

    discord_user =
      begin
        current_user.discord.get("/users/@me")
      rescue StandardError
        redirect_to "/discord/error?code=discord_error"
        return
      end
    current_user.update!(
      **if discord_user["discriminator"] == "0"
        {
          discord_id: discord_user["id"],
          discord_username: "@" + discord_user["username"],
          discord_display_name:
            discord_user["global_name"] || discord_user["username"],
          discord_avatar:
            (
              if discord_user["avatar"].nil?
                "https://cdn.discordapp.com/embed/avatars/#{
                  (discord_user["id"].to_i >> 22) % 6
                }.png"
              else
                "https://cdn.discordapp.com/avatars/#{discord_user["id"]}/#{discord_user["avatar"]}.webp"
              end
            )
        }
      else
        {
          discord_id: discord_user["id"],
          discord_username:
            discord_user["username"] + "#" + discord_user["discriminator"],
          discord_display_name: discord_user["username"],
          discord_avatar:
            (
              if discord_user["avatar"].nil?
                "https://cdn.discordapp.com/embed/avatars/#{
                  (discord_user["discriminator"].to_i % 5)
                }.png"
              else
                "https://cdn.discordapp.com/avatars/#{discord_user["id"]}/#{discord_user["avatar"]}.webp"
              end
            )
        }
      end
    )

    current_user.update!(discord_status: :linked)

    member =
      begin
        $discord.get(
          "/guilds/#{ENV["DISCORD_GUILD_ID"]}/members/#{discord_user["id"]}"
        )
      rescue RuntimeError
        redirect_to "/discord/error?code=notInGuild"
      end

    begin
      current_user.discord.put(
        "/users/@me/applications/#{ENV["DISCORD_CLIENT_ID"]}/role-connection",
        json: {
          "platform_name" => "Chart Cyanvas / Sonolus",
          "platform_username" => current_user.to_s
        }
      )
    rescue StandardError
      redirect_to "/discord/error?code=discordError"
    end

    current_user.update!(discord_status: :joined)

    redirect_to "/charts/upload"
  rescue StandardError => e
    Rails.logger.error e
    redirect_to "/discord/error?code=unknown"
  end
end
