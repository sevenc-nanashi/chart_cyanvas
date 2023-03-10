# frozen_string_literal: true
module Api
  class AdminController < FrontendController
    def data
      render json: {
               code: "ok",
               data: {
                 stats: {
                   charts: Chart.count,
                   users: User.count,
                   files:
                     FileResource
                       .all
                       .group_by(&:kind)
                       .transform_values(&:count),
                   jobs:
                     $redis.with { |conn|
                       {
                         active: conn.get("job_count").to_i,
                         total: conn.get("total_job_count").to_i,
                         success: conn.get("success_job_count").to_i,
                         error: conn.get("error_job_count").to_i
                       }
                     }
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
      unless current_user&.handle == ENV["ADMIN_HANDLE"]
        render json: { code: "forbidden" }, status: :forbidden
        next
      end
      action.call
    end
  end
end
