# frozen_string_literal: true
module Api
  class UsersController < FrontendController
  def show
    params.require(:handle)
    params.permit(:with_chart_count)
    @user = User.find_by(handle: params[:handle])
    if @user
      render json: { code: "ok", user: @user.to_frontend(with_chart_count: params[:with_chart_count]) }
    else
      render json: { code: "not_found" }, status: :not_found
    end
  end
  end
end
