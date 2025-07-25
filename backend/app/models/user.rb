# frozen_string_literal: true
class User < ApplicationRecord
  has_many :charts,
           foreign_key: :author_id,
           dependent: :destroy,
           inverse_of: :author
  belongs_to :owner, class_name: "User", optional: true, inverse_of: :alt_users
  has_many :alt_users,
           foreign_key: :owner_id,
           dependent: :destroy,
           class_name: "User",
           inverse_of: :owner
  has_many :likes, dependent: :destroy
  enum :discord_status, { no: 0, linked: 1, joined: 2 }

  def display_handle
    owner_id ? "x#{handle}" : handle
  end

  def to_frontend
    {
      handle: owner_id ? "x#{handle}" : handle,
      name:,
      aboutMe: about_me,
      chartCount: charts_count,
      avatar: {
        type: avatar_type,
        foregroundType: avatar_fg_type,
        foregroundColor: avatar_fg_color,
        backgroundType: avatar_bg_type,
        backgroundColor: avatar_bg_color
      },
      userType: admin? ? "admin" : "user"
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
    if discord_expires_at < Time.zone.now
      token = refresh_discord_token
      @discord = nil
    end
    @discord ||= DiscordRequest.new(bearer_token: token)
  end

  def check_discord
    return false unless discord_token
    discord_token
    discord_user = discord.get("/users/@me")
    $discord.get(
      "/guilds/#{ENV.fetch("DISCORD_GUILD_ID", nil)}/members/#{discord_user["id"]}"
    )
    true
  rescue StandardError => e
    logger.error "Discord check failed: #{e}"

    update!(discord_status: :no, discord_token: nil, discord_refresh_token: nil)
    false
  end

  def refresh_discord_token
    payload = {
      client_id: ENV.fetch("DISCORD_CLIENT_ID", nil),
      client_secret: ENV.fetch("DISCORD_CLIENT_SECRET", nil),
      grant_type: "refresh_token",
      refresh_token: discord_refresh_token
    }
    response = $discord.post("/oauth2/token", form: payload)

    update!(
      discord_token: response["access_token"],
      discord_refresh_token: response["refresh_token"],
      discord_expires_at: Time.zone.now + response["expires_in"].to_i.seconds
    )
    response["access_token"]
  end

  def admin?
    return false unless (admin_handle = ENV.fetch("ADMIN_HANDLE", nil))
    if admin_handle.start_with?("[")
      JSON.parse(admin_handle).include?(handle)
    else
      handle == admin_handle
    end
  end

  def self.sync_profile(user_profile)
    table_contents = {
      handle: user_profile[:handle],
      name: user_profile[:name],
      about_me: user_profile[:aboutMe],
      avatar_type: user_profile[:avatarType],
      avatar_fg_type: user_profile[:avatarForegroundType],
      avatar_fg_color: user_profile[:avatarForegroundColor],
      avatar_bg_type: user_profile[:avatarBackgroundType],
      avatar_bg_color: user_profile[:avatarBackgroundColor]
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
