# frozen_string_literal: true
module Api
  class UsersController < FrontendController
    def show
      params.require(:handle)
      @user = User.find_by(sonolus_handle: params[:handle])
      @user = User.find_by(handle: params[:handle]) unless @user
      if @user
        render json: { code: "ok", user: @user.to_frontend }
      else
        render json: { code: "not_found" }, status: :not_found
      end
    end
  end
end
