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
                   users: {
                     original: User.where(owner_id: nil).count,
                     alt: User.where.not(owner_id: nil).count,
                     discord: User.where.not(discord_id: nil).count
                   },
                   files:
                     FileResource.kinds.transform_values do |kind|
                       FileResource.where(kind:).count
                     end,
                   db: ActiveRecord::Base.connection_pool.stat
                 }
               }
             }
    end

    def expire_data
      chart_list = FileResource.where(kind: :data)
      render json: { code: "ok", data: { count: chart_list.count } }

      chart_list.destroy_all
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
        user_data[:discord] = {
          displayName: @user.discord_display_name,
          username: @user.discord_username,
          avatar: @user.discord_avatar
        }
        user_data[:warnCount] = @user.warn_count

        render json: { code: "ok", user: user_data }
      else
        render json: { code: "not_found" }, status: :not_found
      end
    end

    def delete_chart
      params.permit(:name, :warn, :reason)
      chart = Chart.find_by(name: params[:name])
      return render json: { code: "not_found" }, status: :not_found unless chart

      if params["warn"]
        chart.author.increment!(:warn_count)
        unless chart.author.discord_thread_id
          thread =
            $discord.post(
              "/channels/#{ENV.fetch("DISCORD_WARNING_CHANNEL_ID", nil)}/threads",
              json: {
                name: "warn-#{chart.author.handle}",
                type: 12
              }
            )
          chart.author.update!(discord_thread_id: thread["id"])
        end

        $discord.post(
          "/channels/#{chart.author.discord_thread_id}/messages",
          json: {
            content: <<~MSG
              **:wastebasket: #{chart.title} (`#{chart.name}`) - :warning: #{chart.author.warn_count}**

              #{params[:reason].indent(1, "> ")}

              *:mailbox: #{chart.author} / <@#{chart.author.discord_id}>*
            MSG
          }
        )
      end

      chart.destroy!
      render json: { code: "ok" }
    end

    around_action do |_controller, action|
      unless current_user&.admin?
        logger.warn "Unauthorized admin access attempt by #{current_user&.handle} (Admin handle: #{ENV.fetch("ADMIN_HANDLE", nil)})"
        render json: { code: "forbidden" }, status: :forbidden
        next
      end

      action.call
    end
  end
end
