# frozen_string_literal: true
require "sidekiq/web"

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  get "/", to: "application#index"

  mount Sidekiq::Web => "/admin/sidekiq",
        :constraints => ->(req) {
          User.find_by(id: req.session[:user_id])&.handle == ENV["ADMIN_HANDLE"]
        }
  get "/admin/sidekiq" => redirect("/")
  get "/admin/sidekiq/*path" => redirect("/")

  scope "/api" do
    get "/users/:handle", to: "api/users#show"

    get "/charts", to: "api/charts#all"
    get "/charts/:name", to: "api/charts#show"
    put "/charts/:name", to: "api/charts#update"
    delete "/charts/:name", to: "api/charts#delete"
    get "/charts/:name/download_chart", to: "api/charts#download_chart"
    post "/charts", to: "api/charts#create"

    post "/login/start", to: "api/auth#start"
    get "/login/status", to: "api/auth#status"
    post "/login/callback", to: "api/auth#callback"
    get "/login/session", to: "api/auth#restore_session"
    delete "/login/session", to: "api/auth#logout"

    get "/my/alt_users", to: "api/my#alt_users"
    post "/my/alt_users", to: "api/my#create_alt_user"
    put "/my/alt_users/:handle", to: "api/my#update_alt_user"
    delete "/my/alt_users/:handle", to: "api/my#delete_alt_user"

    get "/admin", to: "api/admin#data"
    get "/admin/users/:handle", to: "api/admin#show_user"
    post "/admin/expire-data", to: "api/admin#expire_data"
    post "/admin/delete-chart", to: "api/admin#delete_chart"

    get "/my/discord", to: "api/discord#my_discord"
    get "/discord/link", to: "api/discord#link"
    get "/discord/callback", to: "api/discord#callback"
  end

  scope "/sonolus" do
    get "/info", to: "sonolus/info#info"
    get "/playlists/info", to: "sonolus/info#empty_info"
    get "/posts/info", to: "sonolus/info#empty_info"
    get "/levels/info", to: "sonolus/levels#info"
    get "/levels/list", to: "sonolus/levels#list"

    get "/backgrounds/chcy-bg-:name", to: "sonolus/levels#background"
  end
  scope "/test" do
    scope "sonolus" do
      get "/info", to: "sonolus/info#test_info"
    end
    get "/rails/active_storage/*path" =>
          redirect("/rails/active_storage/%{path}")
  end
  %w[/sonolus /test/sonolus].each do |prefix|
    scope prefix do
      get "/levels/chcy-sys-like-on-:name", to: "sonolus/like#to_on"
      get "/levels/chcy-sys-like-off-:name", to: "sonolus/like#to_off"
      get "/levels/chcy-:name", to: "sonolus/levels#show"
      post "/authenticate", to: "sonolus#authenticate"

      scope "/assets" do
        get "/generate", to: "sonolus/asset#generate"
        get "/:type/chcy-:name", to: "sonolus/asset#show"
        get "/:type/:name",
            to: "sonolus/asset#show_static",
            constraints: {
              name: %r{[^/]+}
            }
      end

      types = %w[backgrounds effects particles engines skins]
      get "/:type/info",
          to: "sonolus/asset#info",
          constraints: {
            type: Regexp.new(types.join("|"))
          }
      get "/:type/list",
          to: "sonolus/asset#list",
          constraints: {
            type: Regexp.new(types.join("|"))
          }
      get "/:type/chcy-:name",
          to: "sonolus/asset#show",
          constraints: {
            type: Regexp.new(types.join("|"))
          }
    end
  end

  scope "/auth" do
    scope "/sonolus" do
      get "/info", to: "sonolus/auth#sonolus_info"
      get "/levels/list", to: "sonolus/auth#sonolus_levels_list"
      post "/authenticate", to: "sonolus#authenticate"

      get "/levels/chcy-sys-auth-confirm-:code",
          to: "sonolus/auth#sonolus_confirm"
      get "/levels/chcy-sys-:id", to: "sonolus#dummy_level_info"
    end
    get "/assets/:name" => redirect("/assets/%{name}"), :format => false
    get "/assets/:name" => redirect("/assets/%{name}.%{format}")
  end

  get "/tempfile/:id", to: "temporary_file#read"
end
