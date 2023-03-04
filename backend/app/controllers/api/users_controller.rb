# frozen_string_literal: true
module Api
  class UsersController < FrontendController
    def show
      params.require(:handle)
      @user =
        if params[:handle].start_with?("x")
          User
            .where(handle: params[:handle].delete_prefix("x"))
            .where.not(owner_id: nil)
            .first
        else
          User.find_by(handle: params[:handle])
        end
      if @user
        render json: { code: "ok", user: @user.to_frontend }
      else
        render json: { code: "not_found" }, status: :not_found
      end
    end
  end
end
