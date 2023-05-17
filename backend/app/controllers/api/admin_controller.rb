# frozen_string_literal: true
module Api
  class AdminController < FrontendController
    def data
      render json: {
               code: "ok",
               data: {
                 stats: {
                   charts: {
                     public: Chart.where(visibility: :public).count,
                     scheduled: Chart.where(visibility: :scheduled).count,
                     private: Chart.where(visibility: :private).count
                   },
                   users: User.count,
                   files:
                     FileResource.all.group_by(&:kind).transform_values(&:count)
                 }
               }
             }
    end

    def reconvert_sus
      count = 0
      sus_list = FileResource.where(kind: :sus)
      render json: { code: "ok", data: { count: sus_list.count } }

      AllSusConvertJob.perform_later()
    end

    def show_user
      params.require(:handle)
      @user =
        if params[:handle].start_with?("x")
          User
            .where(handle: params[:handle].delete_prefix("x"))
            .where.not(owner_id: nil)
            .first
            .owner
        else
          User.find_by(handle: params[:handle])
        end
      if @user
        user_data = @user.to_frontend
        user_data[:altUsers] = @user.alt_users.map(&:to_frontend)

        render json: { code: "ok", user: user_data }
      else
        render json: { code: "not_found" }, status: :not_found
      end
    end

    around_action do |controller, action|
      if !ENV["ADMIN_HANDLE"] || current_user&.handle != ENV["ADMIN_HANDLE"]
        logger.warn "Unauthorized admin access attempt by #{current_user&.handle} (Admin handle: #{ENV["ADMIN_HANDLE"]})"
        render json: { code: "forbidden" }, status: :forbidden
        next
      end

      action.call
    end
  end
end
