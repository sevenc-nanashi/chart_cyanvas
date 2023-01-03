class Api::MyController < FrontendController
  def alt_users
    render json: {
      users: User.where(owner_id: session[:user_id]).map(&:to_frontend)
    }
  end
end
