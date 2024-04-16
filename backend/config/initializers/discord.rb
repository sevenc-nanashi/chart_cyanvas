# frozen_string_literal: true

require_relative "../../lib/discord_request"
class Disabled
  def method_missing(*_args)
    raise "Discord disabled"
  end

  def enabled?
    false
  end
end
if bot_token = ENV["DISCORD_BOT_TOKEN"]
  $discord = DiscordRequest.new(bot_token:)

  begin
    info = $discord.get("/users/@me")
    Rails.logger.info(
      "Discord: Logged in as #{info["username"]}##{info["discriminator"]}"
    )
  rescue StandardError
    Rails.logger.error("Discord: Failed to log in")
    raise
  end
else
  Rails.logger.info("Discord: Disabled")
  $discord = Disabled.new
end
