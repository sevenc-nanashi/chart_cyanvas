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
          query: :q_author_name,
          name: I18n.t("sonolus.search.author_name"),
          type: "text",
          placeholder: I18n.t("sonolus.search.author_name_placeholder")
        },
        {
          query: :q_id,
          name: I18n.t("sonolus.search.id"),
          type: "text",
          placeholder: I18n.t("sonolus.search.id_placeholder")
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
          query: :q_sort,
          name: I18n.t("sonolus.search.sort"),
          type: "select",
          def: 0,
          values: I18n.t("sonolus.search.sorts")
        }
      ]
    end

    def searches
      [
        current_user &&
          [
            {
              type: "testing",
              title: I18n.t("sonolus.targets.testing"),
              options: []
            },
            {
              type: "liked",
              title: I18n.t("sonolus.targets.liked"),
              options: []
            }
          ],
        {
          type: "advanced",
          title: "#ADVANCED",
          options: self.class.search_options
        }
      ].compact.flatten
    end

    def info
      private_section =
        if current_user
          alt_users = User.where(owner_id: current_user.id)
          {
            title: "#PRIVATE",
            items:
              Chart
                .order(updated_at: :desc)
                .limit(5)
                .eager_load(
                  :tags,
                  :_variants,
                  file_resources: {
                    file_attachment: :blob
                  }
                )
                .where(
                  visibility: :private,
                  author_id: [current_user.id] + alt_users.map(&:id)
                )
                .sonolus_listed
                .map(&:to_sonolus)
          }
        end

      popular_ids =
        Rails
          .cache
          .fetch("sonolus:popular", expires_in: 1.hour) do
            Rails.logger.info("Calculating popular charts")
            likes = Like.where("created_at > ?", 1.week.ago)
            charts = Chart.where(id: likes.select(:chart_id), variant_id: nil)

            ranks =
              charts.map do |chart|
                [
                  chart.id,
                  likes.count { |like| like.chart_id == chart.id } /
                    (
                      [
                        (
                          (Time.now.to_i - chart.published_at.to_i) / 1.day.to_f
                        ) - 3,
                        0
                      ].max.to_f + 1
                    )
                ]
              end

            ranks.sort_by { |rank| -rank[1] }.first(5).map(&:first)
          end

      popular_section = {
        title: "#POPULAR",
        items:
          Chart
            .where(id: popular_ids)
            .includes(:author)
            .eager_load(:tags, file_resources: { file_attachment: :blob })
            .where(visibility: :public)
            .sonolus_listed
            .map(&:to_sonolus)
      }

      newest_section = {
        title: "#NEWEST",
        items:
          Chart
            .order(published_at: :desc)
            .limit(5)
            .includes(:author)
            .eager_load(:tags, file_resources: { file_attachment: :blob })
            .where(visibility: :public)
            .sonolus_listed
            .map(&:to_sonolus)
      }
      random_section = {
        title: "#RANDOM",
        items:
          Chart
            .order(Arel.sql("RANDOM()"))
            .limit(5)
            .includes(:author)
            .eager_load(:tags, file_resources: { file_attachment: :blob })
            .where(visibility: :public)
            .sonolus_listed
            .map(&:to_sonolus)
      }
      render json: {
               searches:,
               sections: [
                 private_section,
                 popular_section,
                 newest_section,
                 random_section
               ].compact
             }
    end

    def list
      params.permit(
        :page,
        :type,
        :keywords,
        *self.class.search_options.pluck(:query)
      )

      charts =
        Chart
          .includes(:author)
          .eager_load(
            :tags,
            :_variants,
            file_resources: {
              file_attachment: :blob
            }
          )
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
        charts = charts.order(published_at: :desc)
      when 1
        charts = charts.order(updated_at: :desc)
      when 2
        charts = charts.order(likes_count: :desc)
      end
      if params[:q_title].present?
        charts =
          charts.where(
            "LOWER(charts.title) LIKE ?",
            "%#{params[:q_title].downcase}%"
          )
      end
      if params[:type] == "quick" && params[:keywords].present?
        charts =
          charts.where(
            "LOWER(charts.title) LIKE ?",
            "%#{params[:keywords].downcase}%"
          )
      end
      if params[:q_composer].present?
        charts =
          charts.where(
            "LOWER(charts.composer) LIKE ?",
            "%#{params[:q_composer].downcase}%"
          )
      end
      if params[:q_artist].present?
        charts =
          charts.where(
            "LOWER(charts.artist) LIKE ?",
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
                   searches: [
                     {
                       type: "advanced",
                       title: "#ADVANCED",
                       options: self.class.search_options
                     }
                   ],
                   pageCount: 1
                 }
          return
        end
        charts = charts.where(author_id: authors)
      end
      if params[:q_author_name].present?
        charts =
          charts.where(
            "LOWER(charts.author_name) LIKE ?",
            "%#{params[:q_author_name].downcase}%"
          )
      end
      case params[:type]
      when "testing"
        require_login!
        alt_users = User.where(owner_id: current_user.id)
        charts =
          charts
            .where(author_id: [current_user.id] + alt_users.map(&:id))
            .where.not(visibility: :public)
            .order(updated_at: :desc)
      when "liked"
        require_login!
        likes =
          Like
            .where(user_id: current_user.id)
            .select(:chart_id)
            .order(created_at: :desc)
        charts = charts.where(id: likes.map(&:chart_id))
      else
        charts = charts.where(visibility: :public)
      end
      if params[:q_id].present?
        charts =
          charts.where(
            "LOWER(charts.name) LIKE ?",
            "%#{params[:q_id].downcase}%"
          )
      end

      page_count = (charts.count / 20.0).ceil

      charts = charts.offset([params[:page].to_i * 20, 0].max).limit(20)

      render json: {
               items: charts.map(&:to_sonolus),
               searches:,
               pageCount: page_count
             }
    end

    def show
      params.require(:name)
      chart =
        Chart.eager_load(file_resources: { file_attachment: :blob }).find_by(
          name: params[:name]
        )
      if chart
        user_faved = chart.likes.exists?(user_id: current_user&.id)
        render json: {
                 item: chart.to_sonolus,
                 sections:
                   [
                     {
                       title: I18n.t("sonolus.levels.sections.actions"),
                       items: [
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
                         )
                       ]
                     },
                     {
                       title: I18n.t("sonolus.levels.sections.variant_of"),
                       items: [chart.variant_of&.to_sonolus]
                     },
                     {
                       title: I18n.t("sonolus.levels.sections.variants"),
                       items: chart.variants.map(&:to_sonolus)
                     }
                   ].filter { |section| section[:items].any? },
                 description: chart.description
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
