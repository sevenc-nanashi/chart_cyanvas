# frozen_string_literal: true
module Sonolus
  class LikeController < SonolusController
    def to_on
      params.require(:name)

      unless current_user
        render json: { error: "Invalid session" }, status: :unauthorized
        return
      end

      chart = Chart.find_by(name: params[:name])
      unless chart
        render json: { error: "Chart not found" }, status: :not_found
        return
      end
      like = Like.find_by(chart:, user: current_user)
      if like
        render json: {
                 item:
                   dummy_level(
                     "like.message.already",
                     "like-#{chart.name}",
                     cover: "error"
                   ),
                 description: "",
                 sections: []
               }
        return
      end

      like = Like.new(chart:, user: current_user)

      like.save!
      render json: {
               item:
                 dummy_level(
                   "like.message.to_on",
                   "like-#{chart.name}",
                   cover: "success"
                 ),
               description: "",
               sections: []
             },
             status: :created
    end

    def to_off
      params.require(:name)

      unless current_user
        render json: { error: "Invalid session" }, status: :unauthorized
        return
      end

      chart = Chart.find_by(name: params[:name])
      unless chart
        render json: { error: "Chart not found" }, status: :not_found
        return
      end
      like = Like.find_by(chart:, user: current_user)
      unless like
        render json: {
                 item:
                   dummy_level(
                     "like.message.not",
                     "like-#{chart.name}",
                     cover: "error"
                   ),
                 description: "",
                 sections: []
               }
        return
      end

      like.destroy!
      render json: {
               item:
                 dummy_level(
                   "like.message.to_off",
                   "like-#{chart.name}",
                   cover: "success"
                 ),
               description: "",
               sections: []
             }
    end
  end
end
