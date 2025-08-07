# frozen_string_literal: true

task "configure:nginx" do
  puts "Configuring Nginx..."
  base = File.read("./nginx.base.conf")

  inject = +""
  %w[api test/sonolus sonolus rails admin/sidekiq test].each do |route|
    if route.is_a?(Array)
      from = route[0]
      to = route[1]
    else
      from = route
      to = route
    end
    inject << <<~NGINX
      location /#{from}/ {
        proxy_pass http://back/#{to}/;
      }
    NGINX
  end

  base.gsub!("# inject", inject.gsub("\n", "\n    "))

  File.write("./nginx.conf", base)
end

task "configure" do
  require "yaml"
  require "json"
  config_env = {}
  def search_env(config_env, content, parents = [])
    content.each do |key, value|
      if value.is_a?(Hash)
        search_env(config_env, value, parents + [key])
      else
        env_key = (parents + [key]).join("_").upcase
        config_env[env_key] = (value.is_a?(String) ? value : JSON.dump(value))
      end
    end
  end
  search_env(config_env, YAML.load_file("./config.yml"))

  if config_env["SECRET_KEY_BASE"].nil? || config_env["SECRET_KEY_BASE"].empty?
    raise "Error: SECRET_KEY_BASE is not set in config.yml. Please run `rake secret` to generate a new secret key, and add it to config.yml."
  end

  File.write(
    ".env",
    config_env
      .map { |key, value| "#{key}=#{value && value.inspect}" }
      .join("\n")
  )
  puts "Built .env"
end

task "install" do
  sh "cd backend && bundle install"
  sh "cd sub-audio && uv sync"
  sh "pnpm install"
end

task "format" do
  sh "cd frontend && pnpm run lint:fix"
  sh "cd backend && bundle exec rubocop -a"
  sh "cd sub-audio && uv run task lint"
  sh "cd sub-chart && pnpm run lint:fix"
  sh "cd sub-image && cargo fmt"
end

task "secret" do
  require "securerandom"
  secret = SecureRandom.hex(64)
  puts %(secret_key_base: "#{secret}")
end
