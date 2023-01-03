# frozen_string_literal: true
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
  end

  scope "/sonolus" do
    get "/info", to: "sonolus/info#info"
    get "/levels/list", to: "sonolus/levels#list"
    get "/levels/chcys-like-on-:name", to: "sonolus/like#to_on"
    get "/levels/chcys-like-off-:name", to: "sonolus/like#to_off"
    get "/levels/chcy-:name", to: "sonolus/levels#show"
    post "/authenticate", to: "sonolus#authenticate"

    scope "/assets" do
      get "/:type/chcy-:name", to: "sonolus/asset#show"
      get "/:type/:name", to: "sonolus/asset#show_static"
    end
  end

  scope "/auth" do
    scope "/sonolus" do
      get "/info", to: "sonolus/auth#sonolus_info"
      get "/levels/list", to: "sonolus/auth#sonolus_levels_list"
      post "/authenticate", to: "sonolus#authenticate"

      get "/levels/chcys-auth-confirm-:code", to: "sonolus/auth#sonolus_confirm"
      get "/levels/chcys-:id", to: "sonolus#dummy_level_info"
    end
    get "/covers/:name" => redirect("/covers/%{name}"), :format => false
    get "/covers/:name" => redirect("/covers/%{name}.%{format}")
  end
end
