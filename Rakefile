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

  sources =
    FileList
      .new(
        "./frontend/**/*.{ts,tsx,js}",
        "./backend/**/*.rb",
        "./sub-audio/**/*.py",
        "./sub-chart/**/*.ts",
        "./sub-image/**/*.rs"
      )
      .exclude("node_modules")
      .exclude("./backend/config/environments/production.rb")
      .exclude(".venv")
      .exclude("target")
      .exclude("dist")
      .exclude("build")

  env_patterns = [
    /ENV\["([A-Z0-9_]+)"\](?! (?:\|\|)?=)(?!\.present)/,
    /ENV\.fetch\("([A-Z0-9_]+)"/,
    /process\.env\.([A-Z0-9_]+)/,
    /os\.getenv\("([A-Z0-9_]+)"\)/,
    /std::env::var\("([A-Z0-9_]+)"\)/
  ]
  envs = Set.new
  sources.each do |source|
    source_file = File.read(source)
    env_patterns.each do |pattern|
      source_file.scan(pattern) { |match| envs << match[0] }
    end
  end
  File
    .read("./docker-compose.yml")
    .scan(/{{([A-Z0-9_]+)}}/) { |match| envs << match[0] }

  config_env = {}
  def search_env(config_env, content, parents = [])
    content.each do |key, value|
      if value.is_a?(Hash)
        search_env(config_env, value, parents + [key])
      else
        env_key = (parents + [key]).join("_").upcase
        config_env[env_key] = value
      end
    end
  end
  search_env(config_env, YAML.load_file("./config.yml"))

  dockerfile_envs = Set.new
  FileList
    .new("./*/Dockerfile")
    .each do |dockerfile|
      File
        .read(dockerfile)
        .scan(/ENV ([A-Z0-9_]+)[ =]/) { |match| dockerfile_envs << match[0] }
    end
  not_found =
    (
      envs - config_env.keys - dockerfile_envs -
        %w[RAILS_MIN_THREADS RAILS_MAX_THREADS PIDFILE WEB_CONCURRENCY]
    )
      .reject { |env| env.start_with?("SENTRY_") }
      .reject { |env| env.start_with?("DISCORD_") }

  raise "Missing ENVs: #{not_found.join(", ")}" if not_found.any?

  File.write(
    ".env",
    config_env
      .map { |key, value| "#{key}=#{value && value.inspect}" }
      .join("\n")
  )
  puts "Built .env"
end
