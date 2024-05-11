# frozen_string_literal: true

require "http"

class DiscordRequest
  @@ratelimits = {}
  def initialize(bearer_token: nil, bot_token: nil)
    @token = bearer_token || bot_token
    @bot = bot_token ? true : false
  end

  def get(path, **)
    request(:get, path, **)
  end
  def post(path, **)
    request(:post, path, **)
  end
  def put(path, **)
    request(:put, path, **)
  end

  def inspect
    "#<#{self.class.name} #{@bot ? "Bot" : "User"}>"
  end

  def enabled?
    true
  end

  private

  def request(method, path, **options)
    options[:headers] ||= {}

    if @token
      options[:headers]["Authorization"] = if @bot
        "Bot #{@token}"
      else
        "Bearer #{@token}"
      end
    end
    options[:headers][
      "User-Agent"
    ] = "DiscordBot (https://github.com/sevenc-nanashi/chart_cyanvas, HTTP.rb/#{HTTP::VERSION})"

    if @@ratelimits[path]
      if @@ratelimits[path][:reset] < Time.now.to_f
        @@ratelimits.delete(path)
      elsif @@ratelimits[path][:remaining].zero?
        sleep_time = @@ratelimits[path][:reset] - Time.now.to_f
        sleep(sleep_time) if sleep_time.positive?
      end
    end

    Rails.logger.info("Discord: #{method.to_s.upcase} #{path}")
    response =
      HTTP.request(method, "https://discord.com/api/v10#{path}", **options)

    if response.headers["X-RateLimit-Remaining"]
      @@ratelimits[path] = {
        remaining: response.headers["X-RateLimit-Remaining"].to_i,
        reset: response.headers["X-RateLimit-Reset"].to_f
      }
    end
    if response.status.code == 429
      retry_after = response.parse["retry_after"]
      Rails.logger.warn("Rate limited, waiting for #{retry_after}s")
      sleep(retry_after)
      return request(method, path, **options)
    end

    unless response.status.success?
      raise "Discord API error: #{response.status} #{response.body}"
    end

    response.parse
  end
end
