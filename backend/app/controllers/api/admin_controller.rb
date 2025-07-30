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
      user =
        if params[:handle].start_with?("x")
          User
            .where(handle: params[:handle].delete_prefix("x"))
            .where.not(owner_id: nil)
            .first
            .owner
        else
          User.find_by(handle: params[:handle])
        end
      if user
        render json: {
                 code: "ok",
                 user: {
                   altUsers: user.alt_users.map(&:to_frontend),
                   discord: {
                     displayName: user.discord_display_name,
                     username: user.discord_username,
                     avatar: user.discord_avatar
                   },
                   warnings:
                     user.warnings.map { |warning|
                       warning.to_frontend(include_moderator: true)
                     },
                   owner: (user.to_frontend if params[:handle].start_with?("x"))
                 }
               }
      else
        render json: { code: "not_found" }, status: :not_found
      end
    end

    class WarnValidator
      include ActiveModel::Validations

      attr_accessor :name, :reason, :level, :target_type, :target, :delete_chart

      validates :reason, presence: true
      validates :level, inclusion: { in: %w[low medium high ban] }
      validates :target_type, inclusion: { in: %w[chart user] }
      validates :delete_chart, inclusion: { in: [true, false] }
      validate :validate_target

      def validate_target
        if target_type == "user"
          unless User.exists?(handle: target)
            errors.add(:target, "must be a valid user handle")
          end
        elsif target_type == "chart"
          unless Chart.exists?(name: target)
            errors.add(:target, "must be a valid chart name")
          end
        else
          errors.add(:target_type, "must be either 'user' or 'chart'")
        end
      end
    end

    def create_warn
      params.permit(:reason, :level, :targetType, :target, :deleteChart)
      validator = WarnValidator.new
      validator.reason = params[:reason]
      validator.level = params[:level]
      validator.target_type = params[:targetType]
      validator.target = params[:target]
      validator.delete_chart = params[:deleteChart]

      unless validator.valid?
        render json: {
                 code: "bad_request",
                 error: validator.errors
               },
               status: :bad_request
        return
      end

      case validator.target_type
      when "user"
        user = User.find_by(handle: validator.target)
        unless user
          return render json: { code: "not_found" }, status: :not_found
        end

        user.charts.each(&:destroy!) if validator.delete_chart

        UserWarning.create!(
          user:,
          moderator: current_user,
          reason: params[:reason],
          level: params[:level],
          target_type: "user",
          chart_deleted: validator.delete_chart
        )
      when "chart"
        chart = Chart.find_by(name: validator.target)
        unless chart
          return render json: { code: "not_found" }, status: :not_found
        end

        chart.destroy! if validator.delete_chart

        UserWarning.create!(
          user: chart.author,
          moderator: current_user,
          reason: params[:reason],
          level: params[:level],
          target_name: chart.title,
          target_type: "chart",
          chart_deleted: validator.delete_chart
        )
      end

      if $discord.nil?
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
              **:warning: #{chart.title} (`#{chart.name}`)**

              #{params[:reason].indent(1, "> ")}

              *:mailbox: #{chart.author} / <@#{chart.author.discord_id}>*
            MSG
          }
        )
      end
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
