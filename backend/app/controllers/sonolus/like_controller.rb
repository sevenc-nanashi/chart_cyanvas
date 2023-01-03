class Sonolus::LikeController < SonolusController
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
    like = Like.find_by(chart: chart, user: current_user)
    if like
      render json: {
               item:
                 dummy_level(
                   "like.message.already",
                   "like-#{chart.name}",
                   cover: "error"
                 ),
               description: "",
               recommended: []
             }
      return
    end

    like = Like.new(chart: chart, user: current_user)

    like.save!
    revalidate("/charts/#{chart.name}")
    render json: {
             item:
               dummy_level(
                 "like.message.to_on",
                 "like-#{chart.name}",
                 cover: "success"
               ),
             description: "",
             recommended: []
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
    like = Like.find_by(chart: chart, user: current_user)
    unless like
      render json: {
               item:
                 dummy_level(
                   "like.message.not",
                   "like-#{chart.name}",
                   cover: "error"
                 ),
               description: "",
               recommended: []
             }
      return
    end

    like.destroy!
    revalidate("/charts/#{chart.name}")
    render json: {
             item:
               dummy_level(
                 "like.message.to_off",
                 "like-#{chart.name}",
                 cover: "success"
               ),
             description: "",
             recommended: []
           }
  end
end
