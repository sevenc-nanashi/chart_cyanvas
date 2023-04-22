# frozen_string_literal: true
module Sonolus
  class AuthController < SonolusController
    DUMMY_SECTION = { items: [], search: { options: [] } }.freeze

    def code_search
      {
        options: [
          {
            name: I18n.t("auth.code_search.option.name"),
            placeholder: I18n.t("auth.code_search.option.placeholder"),
            query: "code",
            type: "text"
          }
        ]
      }
    end

    def sonolus_info
      render json: {
               title: I18n.t("auth.title"),
               banner: banner("banner_login"),
               levels: {
                 items: [
                   dummy_level("auth.welcome", "auth-welcome", cover: "logo")
                 ],
                 search: code_search
               },
               backgrounds: DUMMY_SECTION,
               skins: DUMMY_SECTION,
               effects: DUMMY_SECTION,
               particles: DUMMY_SECTION,
               engines: DUMMY_SECTION
             }
    end

    def sonolus_levels_list
      params.permit(:code)
      params.permit(:page)
      if params[:code].blank?
        item = dummy_level("auth.guide", "auth-guide", cover: "info")
      elsif !params[:code].match?(/^[0-9]{8}$/)
        item = dummy_level("auth.invalid", "auth-invalid", cover: "error")
      elsif session_data.nil?
        render json: {}, status: :unauthorized
        return
      else
        item =
          dummy_level(
            "auth.confirm",
            "auth-confirm-#{params[:code]}",
            cover: "warning",
            code: params[:code]
          )
      end
      render json: { items: [item], search: code_search, pageCount: 1 }
    end

    def sonolus_confirm
      params.permit(:code)
      if params[:code].blank?
        render json: {}
        return
      end
      if session_data.nil?
        render json: {}, status: :unauthorized
        return
      end
      if !(
           auth_data =
             $redis.with do |conn|
               conn
                 .get("auth_code/#{params[:code]}")
                 &.then { |v| JSON.parse(v, symbolize_names: true) }
             end
         ) || auth_data[:authorized]
        render json: {
                 item:
                   dummy_level("auth.expired", "auth-expired", cover: "error"),
                 description: "",
                 recommended: []
               }
        return
      end
      auth_data[:authorized] = true

      token = SecureRandom.urlsafe_base64(32)
      auth_data[:token] = token
      auth_data[:user_handle] = session_data[:user][:handle]

      $redis.with do |conn|
        conn.set(
          "auth_token/#{token}",
          { user: self.current_user }.to_json,
          ex: 1.day
        )

        conn.set(
          "auth_code/#{params[:code]}",
          auth_data.to_json,
          ex: 1.5.minutes.to_i
        )
      end

      render json: {
               item:
                 dummy_level("auth.success", "auth-success", cover: "success"),
               description: "",
               recommended: []
             }
    end
  end
end
