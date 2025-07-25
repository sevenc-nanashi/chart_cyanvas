# frozen_string_literal: true
require "color-generator"

module Api
  class MyController < FrontendController
    def alt_users
      render json: {
               users: User.where(owner_id: session[:user_id]).map(&:to_frontend)
             }
    end

    def create_alt_user
      params.require(:name)
      require_login!

      name = params[:name]
      if name.length < 4
        render json: { code: "bad_request", error: "tooShort" }, status: :bad_request
        return
      elsif name.length > 16
        render json: { code: "bad_request", error: "tooLong" }, status: :bad_request
        return
      end
      user =
        User.create!(
          handle: 100 + User.last.id,
          name:,
          owner_id: session[:user_id],
          about_me: "",
          avatar_type: "default",
          avatar_fg_type: "player",
          avatar_fg_color: "#ffffff",
          avatar_bg_type: "default",
          avatar_bg_color:
            "##{ColorGenerator.new(saturation: 0.5, lightness: 0.5).create_hex}"
        )
      render json: { code: "ok", data: user.to_frontend }
    end

    def update_alt_user
      params.require(:handle)
      require_login!

      handle = params[:handle][1..]
      user = User.find_by(handle:)
      if user.nil? || user.owner_id != session[:user_id]
        render json: { code: "not_found" }, status: :not_found
        return
      end

      name = params[:name]
      if name.length < 4
        render json: { code: "bad_request", error: "tooShort" }, status: :bad_request
        return
      elsif name.length > 16
        render json: { code: "bad_request", error: "tooLong" }, status: :bad_request
        return
      end
      user.update!(name:)
      render json: { code: "ok", data: user.to_frontend }
    end

    def delete_alt_user
      params.require(:handle)
      require_login!

      handle = params[:handle][1..]
      user = User.find_by(handle:)
      if user.nil? || user.owner_id != session[:user_id]
        render json: { code: "not_found" }, status: :not_found
        return
      end

      session_user = User.find(session[:user_id])

      user.charts.update_all(
        author_id: session[:user_id],
        author_name: session_user.name
      )
      user.destroy!
      render json: { code: "ok" }
    end
  end
end
