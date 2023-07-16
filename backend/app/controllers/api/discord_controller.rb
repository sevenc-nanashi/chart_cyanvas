# frozen_string_literal: true

require "cgi"

class Api::DiscordController < ApplicationController
  def redirect_uri
    ENV.fetch(
      "HOST",
      (Rails.env.development? ? "http://" : "https://") + request.host_with_port
    )
  end
  def scope
    %w[identify guilds.join guilds]
  end
  def authorize
    state = SecureRandom.urlsafe_base64(32)
    $redis.with do |conn|
      conn.set(
        "discord_auth_token/#{state}",
        { session: session.id }.to_json,
        ex: 5.minutes
      )
    end
    render json: {
             url:
               "https://discord.com/api/oauth2/authorize" \
                 "?client_id=#{ENV["DISCORD_CLIENT_ID"]}" \
                 "&redirect_uri=#{CGI.escape(redirect_uri + "/discord/callback")}" \
                 "&response_type=code" \
                 "&scope=#{scope.join("+")}" \
                 "&state=#{state}"
           }
  end

  def callback
    params.require %i[code state]

    data =
      $redis
        .with { |conn| conn.get("discord_auth_token/#{params[:state]}") }
        &.then { |json| JSON.parse(json, symbolize_names: true) }

    unless data && data[:session] == session.id
      render json: { error: "Invalid state" }, status: :bad_request
      return
    end

    payload = {
      client_id: ENV["DISCORD_CLIENT_ID"],
      client_secret: ENV["DISCORD_CLIENT_SECRET"],
      grant_type: "authorization_code",
      code: params[:code],
      redirect_uri: redirect_uri + "/api/discord/callback",
      scope: scope.join("+")
    }

    response = HTTP.post("https://discord.com/api/oauth2/token", form: payload)

    pp response
  end
end
