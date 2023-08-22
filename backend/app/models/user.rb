# frozen_string_literal: true
class User < ApplicationRecord
  has_many :charts,
           foreign_key: :author_id,
           dependent: :destroy,
           inverse_of: :author
  belongs_to :user,
             optional: true,
             foreign_key: :owner_id,
             inverse_of: :alt_users
  has_many :alt_users,
           foreign_key: :owner_id,
           dependent: :destroy,
           class_name: "User",
           inverse_of: :user
  has_many :likes, dependent: :destroy
  enum discord_status: %i[no linked joined]

  def display_handle
    owner_id ? "x#{handle}" : handle
  end

  def to_frontend
    {
      handle: owner_id ? "x#{handle}" : handle,
      name:,
      aboutMe: about_me,
      bgColor: bg_color,
      fgColor: fg_color,
      chartCount: charts_count
    }
  end

  def to_s
    "#{name}##{handle}"
  end

  def discord_ok?
    discord_status == "joined"
  end

  def discord
    return unless discord_token
    refresh_discord_token if discord_expires_at < Time.now
    @discord ||= DiscordRequest.new(bearer_token: discord_token)
  end

  def check_discord
    return false unless discord_token
    refresh_discord_token if discord_expires_at < Time.now
    discord_user = discord.get("/users/@me")
    discord.get(
      "/guilds/#{ENV["DISCORD_GUILD_ID"]}/members/#{discord_user["id"]}"
    )
    true
  rescue StandardError
    update!(discord_status: :no, discord_token: nil, discord_refresh_token: nil)
    false
  end

  def refresh_discord_token
    payload = {
      client_id: ENV["DISCORD_CLIENT_ID"],
      client_secret: ENV["DISCORD_CLIENT_SECRET"],
      grant_type: "refresh_token",
      refresh_token: discord_refresh_token
    }
    response = $discord.post("/oauth2/token", form: payload)

    update!(
      discord_token: response["access_token"],
      discord_refresh_token: response["refresh_token"],
      discord_expires_at: Time.now + response["expires_in"].to_i.seconds
    )
  end

  def admin?
    ENV["ADMIN_HANDLE"] && ENV["ADMIN_HANDLE"].split(",").include?(handle)
  end
end
