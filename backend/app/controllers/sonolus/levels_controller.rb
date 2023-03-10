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
          query: :q_composer,
          name: I18n.t("sonolus.search.composer"),
          type: "text",
          placeholder: I18n.t("sonolus.search.composer_placeholder")
        },
        {
          query: :q_artist,
          name: I18n.t("sonolus.search.artist"),
          type: "text",
          placeholder: I18n.t("sonolus.search.artist_placeholder")
        },
        {
          query: :q_author,
          name: I18n.t("sonolus.search.author"),
          type: "text",
          placeholder: I18n.t("sonolus.search.author_placeholder")
        },
        {
          query: :q_rating_min,
          name: I18n.t("sonolus.search.rating_min"),
          type: "slider",
          def: 1,
          min: 1,
          max: 99,
          step: 1
        },
        {
          query: :q_rating_max,
          name: I18n.t("sonolus.search.rating_max"),
          type: "slider",
          def: 99,
          min: 1,
          max: 99,
          step: 1
        },
        {
          query: :q_target,
          name: I18n.t("sonolus.search.target"),
          type: "select",
          def: 0,
          values: I18n.t("sonolus.search.targets")
        },
        {
          query: :q_sort,
          name: I18n.t("sonolus.search.sort"),
          type: "select",
          def: 0,
          values: I18n.t("sonolus.search.sorts")
        }
      ]
    end
    def list
      params.permit(:page, *(self.class.search_options.map { |o| o[:query] }))

      charts =
        Chart
          .includes(:author)
          .eager_load(file_resources: { file_attachment: :blob })
          .sonolus_listed

      charts =
        charts.where("charts.rating >= ?", params[:q_rating_min]) if params[
        :q_rating_min
      ].present?
      charts =
        charts.where("charts.rating <= ?", params[:q_rating_max]) if params[
        :q_rating_max
      ].present?
      case params[:q_sort].to_i
      when 0
        charts = charts.order(updated_at: :desc)
      when 1
        charts = charts.order(published_at: :desc)
      when 2
        charts = charts.order(likes_count: :desc)
      end
      if params[:q_title].present?
        charts =
          charts.where("LOWER(title) LIKE ?", "%#{params[:q_title].downcase}%")
      end
      if params[:q_composer].present?
        charts =
          charts.where(
            "LOWER(composer) LIKE ?",
            "%#{params[:q_composer].downcase}%"
          )
      end
      if params[:q_artist].present?
        charts =
          charts.where(
            "LOWER(artist) LIKE ?",
            "%#{params[:q_artist].downcase}%"
          )
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
        charts = charts.where(author_id: authors)
      end
      if !params[:q_target] || params[:q_target].to_i.zero?
        charts = charts.where(is_public: true)
      else
        case params[:q_target].to_i
        when 1
          unless current_user
            render json: {
                     code: "not_logged_in",
                     error: "You must be logged in to view your charts."
                   },
                   status: :unauthorized
            return
          end
          alt_users = User.where(owner_id: current_user.id)
          charts =
            charts.where(
              is_public: false,
              author_id: [current_user.id] + alt_users.map(&:id)
            )
        end
      end
      page_count = (charts.count / 20.0).ceil

      charts = charts.offset((params[:page].to_i) * 20).limit(20)

      render json: {
               items: charts.map(&:to_sonolus),
               search: {
                 options: self.class.search_options
               },
               pageCount: page_count
             }
    end
    def show
      params.require(:name)
      chart =
        Rails
          .cache
          .fetch("/charts/#{params[:name]}", expires_in: 1.hour) do
            Chart.eager_load(
              file_resources: {
                file_attachment: :blob
              }
            ).find_by(name: params[:name])
          end
      user_faved = chart.likes.exists?(user_id: current_user&.id)
      if chart
        render json: {
                 item: chart.to_sonolus,
                 recommended: [
                   (
                     if user_faved
                       dummy_level(
                         "like.button.to_off",
                         "like-off-#{chart.name}",
                         cover: "like_on"
                       )
                     else
                       dummy_level(
                         "like.button.to_on",
                         "like-on-#{chart.name}",
                         cover: "like_off"
                       )
                     end
                   ),
                   chart.variant_of&.to_sonolus,
                   chart.variants.map(&:to_sonolus)
                 ].flatten.compact,
                 description: chart.sonolus_description
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
