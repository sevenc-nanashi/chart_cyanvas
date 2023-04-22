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
                     private: Chart.where(visibility: :private).count,
                   },
                   users: User.count,
                   files:
                     FileResource
                       .all
                       .group_by(&:kind)
                       .transform_values(&:count),
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
