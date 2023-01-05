# frozen_string_literal: true
module Sonolus
  class LevelsController < SonolusController
    def self.search_options
      [
        {
          query: :q_title,
          name: I18n.t("sonolus.search.title"),
          type: "text",
          placeholder: I18n.t("sonolus.search.title_placeholder")
        },
        {
          query: :q_author,
          name: I18n.t("sonolus.search.author"),
          type: "text",
          placeholder: I18n.t("sonolus.search.author_placeholder")
        },
        {
          query: :q_target,
          name: I18n.t("sonolus.search.target"),
          type: "select",
          def: 0,
          values: I18n.t("sonolus.search.targets")
        }
      ]
    end
    def list
      params.permit(:page, :q_title, :q_author, :q_target)

      levels =
        Chart
          .order(updated_at: :desc)
          .limit(20)
          .includes(:author)
          .eager_load(file_resources: { file_attachment: :blob })
          .sonolus_listed
          .offset(params[:page].to_i * 20)
      if params[:q_title].present?
        levels = levels.where("name LIKE ?", "%#{params[:q_title]}%")
      end
      if params[:q_author].present?
        authors =
          params[:q_author].split.map do |author|
            user =
              if author.start_with?("x")
                User.find_by(handle: author[1..])
              else
                User.find_by(handle: author)
              end
            user&.id
          end
        if authors.any?(nil)
          render json: {
                   items: [
                     dummy_level(
                       "search.unknown-user",
                       "no-results",
                       cover: "error"
                     )
                   ],
                   search: {
                     options: self.class.search_options
                   },
                   pageCount: 1
                 }
          return
        end
        levels = levels.where(author_id: authors)
      end
      if !params[:q_target] || params[:q_target].to_i.zero?
        levels = levels.where(is_public: true)
      else
        case params[:q_target].to_i
        when 1
          unless current_user
            render json: {
                     code: "not_logged_in",
                     error: "You must be logged in to view your levels."
                   },
                   status: :unauthorized
            return
          end
          levels = levels.where(is_public: false, author_id: current_user.id)
        end
      end

      render json: {
               items: levels.map(&:to_sonolus),
               search: {
                 options: self.class.search_options
               },
               pageCount: (Chart.count / 20.0).ceil
             }
    end
    def show
      params.require(:name)
      level =
        Rails
          .cache
          .fetch("/charts/#{params[:name]}", expires_in: 1.hour) do
            Chart.eager_load(
              file_resources: {
                file_attachment: :blob
              }
            ).find_by(name: params[:name])
          end
      user_faved = level.likes.exists?(user_id: current_user&.id)
      if level
        render json: {
                 item: level.to_sonolus,
                 recommended: [
                   (
                     if user_faved
                       dummy_level(
                         "like.button.to_off",
                         "like-off-#{level.name}",
                         cover: "like_on"
                       )
                     else
                       dummy_level(
                         "like.button.to_on",
                         "like-on-#{level.name}",
                         cover: "like_off"
                       )
                     end
                   )
                 ],
                 description: level.sonolus_description
               }
      else
        render json: {
                 code: "not_found",
                 error: "Level not found"
               },
               status: :not_found
      end
    end
  end
end
