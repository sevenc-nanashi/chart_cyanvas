# frozen_string_literal: true
class User < ApplicationRecord
  has_many :charts,
           foreign_key: :author_id,
           dependent: :destroy,
           inverse_of: :author
  belongs_to :owner,
             class_name: "User",
             optional: true,
             foreign_key: :owner_id,
             inverse_of: :alt_users
  has_many :alt_users,
           foreign_key: :owner_id,
           dependent: :destroy,
           class_name: "User",
           inverse_of: :owner
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
    token = discord_token
    if discord_expires_at < Time.now
      token = refresh_discord_token
      @discord = nil
    end
    @discord ||= DiscordRequest.new(bearer_token: token)
  end

  def check_discord
    return false unless discord_token
    token = discord_token
    discord_user = discord.get("/users/@me")
    $discord.get(
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
    response["access_token"]
  end

  def admin?
    ENV["ADMIN_HANDLE"] && ENV["ADMIN_HANDLE"].split(",").include?(handle)
  end

  def self.from_profile(user_profile)
    table_contents = {
      handle: user_profile[:handle],
      name: user_profile[:name],
      about_me: user_profile[:aboutMe],
      fg_color: user_profile[:avatarForegroundColor],
      bg_color: user_profile[:avatarBackgroundColor]
    }

    if (u = User.find_by(handle: user_profile[:handle], owner_id: nil))
      if table_contents.each_pair.any? { |k, v| u[k] != v }
        logger.info "User #{u.handle} updated, updating table"
        u.update!(table_contents)
      else
        logger.info "User #{u.handle} not updated, skipping table update"
      end
      u
    else
      logger.info "User #{user_profile[:handle]} not found, creating"
      User.create(table_contents)
    end
  end
end
