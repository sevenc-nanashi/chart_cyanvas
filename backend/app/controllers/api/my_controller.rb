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
      unless session[:user_id]
        return render json: { code: "unauthorized" }, status: 401
      end

      name = params[:name]
      if name.length < 4
        render json: { code: "bad_request", error: "tooShort" }, status: 400
        return
      elsif name.length > 16
        render json: { code: "bad_request", error: "tooLong" }, status: 400
        return
      end
      user =
        User.create!(
          handle: 100 + User.last.id,
          name:,
          owner_id: session[:user_id],
          about_me: "",
          fg_color: "#ffffff",
          bg_color:
            "#" + ColorGenerator.new(saturation: 0.5, lightness: 0.5).create_hex
        )
      render json: { code: "ok", data: user.to_frontend }
    end

    def update_alt_user
      params.require(:handle)

      unless session[:user_id]
        return render json: { code: "unauthorized" }, status: 401
      end

      handle = params[:handle][1..].to_i
      user = User.find_by(handle:)
      if user.nil? || user.owner_id != session[:user_id]
        render json: { code: "not_found" }, status: 404
        return
      end

      name = params[:name]
      if name.length < 4
        render json: { code: "bad_request", error: "tooShort" }, status: 400
        return
      elsif name.length > 16
        render json: { code: "bad_request", error: "tooLong" }, status: 400
        return
      end
      user.update!(name:)
      render json: { code: "ok", data: user.to_frontend }
    end

    def delete_alt_user
      params.require(:handle)

      unless session[:user_id]
        return render json: { code: "unauthorized" }, status: 401
      end

      handle = params[:handle][1..].to_i
      user = User.find_by(handle:)
      if user.nil? || user.owner_id != session[:user_id]
        render json: { code: "not_found" }, status: 404
        return
      end

      user.charts.update_all(
        author_id: session[:user_id],
        author_name: nil
      )
      user.destroy!
      render json: { code: "ok" }
    end
  end
end
