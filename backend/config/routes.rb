# frozen_string_literal: true
require "sidekiq/web"

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  get "/", to: "application#index"

  mount Sidekiq::Web => "/admin/sidekiq",
        :constraints => ->(req) do
          User.find_by(id: req.session[:user_id])&.admin?
        end
  get "/admin/sidekiq" => redirect("/")
  get "/admin/sidekiq/*path" => redirect("/")

  # Internal
  get "/meta", to: "frontend#meta"

  scope "/api" do
    get "/users/:handle", to: "api/users#show"

    get "/charts", to: "api/charts#all"
    get "/charts/:name", to: "api/charts#show"
    put "/charts/:name", to: "api/charts#update"
    delete "/charts/:name", to: "api/charts#delete"
    get "/charts/:name/download-chart", to: "api/charts#download_chart"
    post "/charts", to: "api/charts#create"

    post "/login/start", to: "api/auth#start"
    get "/login/status", to: "api/auth#status"
    post "/login/callback", to: "api/auth#callback"
    get "/login/session", to: "api/auth#restore_session"
    delete "/login/session", to: "api/auth#logout"

    get "/my/alt-users", to: "api/my#alt_users"
    post "/my/alt-users", to: "api/my#create_alt_user"
    put "/my/alt-users/:handle", to: "api/my#update_alt_user"
    delete "/my/alt-users/:handle", to: "api/my#delete_alt_user"
    get "/my/warnings", to: "api/my#warnings"
    put "/my/warnings/seen", to: "api/my#acknowledge_warnings"

    get "/admin/db-stat", to: "api/admin#db_stat"
    get "/admin/item-stat", to: "api/admin#item_stat"
    get "/admin/users/:handle", to: "api/admin#show_user"
    post "/admin/expire-data", to: "api/admin#expire_data"
    post "/admin/warn", to: "api/admin#create_warn"

    get "/my/discord", to: "api/discord#my_discord"
    get "/discord/link", to: "api/discord#link"
    get "/discord/callback", to: "api/discord#callback"
  end

  scope "/sonolus" do
    get "/info", to: "sonolus/info#info"
    get "/levels/info", to: "sonolus/levels#info"
    get "/levels/list", to: "sonolus/levels#list"

    get "/backgrounds/chcy-bg-:name", to: "sonolus/levels#background"
  end
  scope "/sonolus" do
    get "/levels/chcy-:name", to: "sonolus/levels#show"
    post "/levels/chcy-:name/submit", to: "sonolus/levels#submit"
    get "/levels/result/info", to: "sonolus/levels#result_info"
    post "/authenticate", to: "sonolus#authenticate"

    get "/generate-asset", to: "sonolus/asset#generate"
    scope "/assets" do
      # NOTE: This route will be replaced with nginx on production, DO NOT PUT API HERE
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
