# frozen_string_literal: true

require_relative "../../lib/discord_request"
$discord = DiscordRequest.new(bot_token: ENV["DISCORD_BOT_TOKEN"])

info = $discord.get("/users/@me")

Rails.logger.info(
  "Discord: Logged in as #{info[:username]}##{info[:discriminator]}"
)
