# frozen_string_literal: true

require_relative "../../lib/discord_request"
if Rails.env.test?
  class Disabled
    def method_missing(*_args)
      raise "Discord disabled in test environment"
    end
  end
  $discord = Disabled.new
  # Disable
else
  $discord = DiscordRequest.new(bot_token: ENV["DISCORD_BOT_TOKEN"])

  info = $discord.get("/users/@me")

  Rails.logger.info(
    "Discord: Logged in as #{info[:username]}##{info[:discriminator]}"
  )
end
