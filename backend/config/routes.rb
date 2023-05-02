# frozen_string_literal: true
# rubocop:disable Style/FormatStringToken
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

    post "/auth", to: "api/auth#create_code"
    get "/auth", to: "api/auth#check_code"
    get "/auth/session", to: "api/auth#restore_session"
    delete "/auth/session", to: "api/auth#logout"

    get "/my/alt_users", to: "api/my#alt_users"
    post "/my/alt_users", to: "api/my#create_alt_user"
    put "/my/alt_users/:handle", to: "api/my#update_alt_user"
    delete "/my/alt_users/:handle", to: "api/my#delete_alt_user"

    get "/admin", to: "api/admin#data"
    post "/admin/reconvert_sus", to: "api/admin#reconvert_sus"
  end

  scope "/sonolus" do
    get "/info", to: "sonolus/info#info"
    get "/levels/list", to: "sonolus/levels#list"
  end
  scope "/test" do
    scope "sonolus" do
      get "/info", to: "sonolus/info#test_info"
      get "/levels/list", to: "sonolus/levels#test_list"
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
        get "/:type/chcy-:name", to: "sonolus/asset#show"
        get "/:type/:name", to: "sonolus/asset#show_static"
      end

      types = %w[backgrounds effects particles engines skins]
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
# rubocop:enable Style/FormatStringToken
