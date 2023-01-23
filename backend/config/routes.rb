# frozen_string_literal: true
# rubocop:disable Style/FormatStringToken
Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  get "/", to: "application#index"

  scope "/api" do
    get "/users/:handle", to: "api/users#show"

    get "/charts", to: "api/charts#all"
    get "/charts/:name", to: "api/charts#show"
    put "/charts/:name", to: "api/charts#update"
    delete "/charts/:name", to: "api/charts#delete"
    post "/charts", to: "api/charts#create"

    post "/auth", to: "api/auth#create_code"
    get "/auth", to: "api/auth#check_code"
    get "/auth/session", to: "api/auth#restore_session"
    delete "/auth/session", to: "api/auth#logout"

    get "/my/alt_users", to: "api/my#alt_users"
    post "/my/alt_users", to: "api/my#create_alt_user"
    put "/my/alt_users/:handle", to: "api/my#update_alt_user"
    delete "/my/alt_users/:handle", to: "api/my#delete_alt_user"
  end

  scope "/sonolus" do
    get "/info", to: "sonolus/info#info"
    get "/levels/list", to: "sonolus/levels#list"
    get "/levels/chcy-sys-like-on-:name", to: "sonolus/like#to_on"
    get "/levels/chcy-sys-like-off-:name", to: "sonolus/like#to_off"
    get "/levels/chcy-:name", to: "sonolus/levels#show"
    post "/authenticate", to: "sonolus#authenticate"

    scope "/assets" do
      get "/:type/chcy-:name", to: "sonolus/asset#show"
      get "/:type/:name", to: "sonolus/asset#show_static"
    end

    types = %w[backgrounds effects particles engines skins]
    get "/:type/list", to: "sonolus/asset#list", constraints: { type: Regexp.new(types.join("|")) }
    get "/:type/chcy-:name", to: "sonolus/asset#show", constraints: { type: Regexp.new(types.join("|")) }
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
end
# rubocop:enable Style/FormatStringToken
