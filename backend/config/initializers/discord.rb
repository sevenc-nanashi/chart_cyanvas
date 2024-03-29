# frozen_string_literal: true

require_relative "../../lib/discord_request"
class Disabled
  def method_missing(*_args)
    raise "Discord disabled"
  end
end
if Rails.env.test?
  $discord = Disabled.new
  # Disable
else
  $discord = DiscordRequest.new(bot_token: ENV["DISCORD_BOT_TOKEN"])

  info =
    begin
      $discord.get("/users/@me")
    rescue StandardError
      Rails.logger.error("Discord: Failed to log in, disabling")
      $discord = Disabled.new
    end

  Rails.logger.info(
    "Discord: Logged in as #{info["username"]}##{info["discriminator"]}"
  )
end
