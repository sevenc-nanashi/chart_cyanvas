# frozen_string_literal: true
require "uri"

module Sonolus
  class LevelsController < SonolusController
    def self.search_options
      [
        {
          query: :q_title,
          name: I18n.t("sonolus.search.title"),
          type: "text",
          placeholder: I18n.t("sonolus.search.title_placeholder"),
          required: false,
          limit: 0,
          def: "",
          shortcuts: []
        },
        {
          query: :q_composer,
          name: I18n.t("sonolus.search.composer"),
          type: "text",
          placeholder: I18n.t("sonolus.search.composer_placeholder"),
          required: false,
          limit: 0,
          def: "",
          shortcuts: []
        },
        {
          query: :q_artist,
          name: I18n.t("sonolus.search.artist"),
          type: "text",
          placeholder: I18n.t("sonolus.search.artist_placeholder"),
          required: false,
          limit: 0,
          def: "",
          shortcuts: []
        },
        {
          query: :q_author,
          name: I18n.t("sonolus.search.author"),
          type: "text",
          placeholder: I18n.t("sonolus.search.author_placeholder"),
          required: false,
          limit: 0,
          def: "",
          shortcuts: []
        },
        {
          query: :q_author_name,
          name: I18n.t("sonolus.search.author_name"),
          type: "text",
          placeholder: I18n.t("sonolus.search.author_name_placeholder"),
          required: false,
          limit: 0,
          def: "",
          shortcuts: []
        },
        {
          query: :q_id,
          name: I18n.t("sonolus.search.id"),
          type: "text",
          placeholder: I18n.t("sonolus.search.id_placeholder"),
          required: false,
          limit: 0,
          def: "",
          shortcuts: []
        },
        {
          query: :q_rating_min,
          name: I18n.t("sonolus.search.rating_min"),
          type: "slider",
          def: 1,
          min: 1,
          max: 99,
          step: 1,
          required: false
        },
        {
          query: :q_rating_max,
          name: I18n.t("sonolus.search.rating_max"),
          type: "slider",
          def: 99,
          min: 1,
          max: 99,
          step: 1,
          required: false
        },
        {
          query: :q_sort,
          name: I18n.t("sonolus.search.sort"),
          type: "select",
          def: 0,
          values: I18n.t("sonolus.search.sorts"),
          required: false
        }
      ]
    end

    def searches
      [
        {
          type: "advanced",
          title: "#ADVANCED",
          requireConfirmation: false,
          options: self.class.search_options
        }
      ]
    end

    def info
      private_section =
        if current_user
          alt_users = User.where(owner_id: current_user.id)
          {
            title: "#PRIVATE",
            itemType: "level",
            searchValues: "type=testing",
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

      popular_section = {
        title: "#POPULAR",
        itemType: "level",
        items: self.popular_charts.map(&:to_sonolus)
      }

      newest_section = {
        title: "#NEWEST",
        itemType: "level",
        searchValues: "type=newest",
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
        itemType: "level",
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

    def popular_charts
      popular_ids =
        Rails
          .cache
          .fetch("sonolus:popular", expires_in: 1.hour) do
            Rails.logger.info("Calculating popular charts")
            likes = Like.where("created_at > ?", 3.days.ago)
            charts =
              Chart.where(
                id: likes.select(:chart_id),
                visibility: :public
              ).sonolus_listed

            ranks =
              charts.map do |chart|
                [
                  chart.id,
                  likes.count { |like| like.chart_id == chart.id } *
                    (
                      0.9**
                        [
                          (
                            (Time.now.to_i - chart.published_at.to_i) /
                              1.day.to_f
                          ) - 1,
                          0
                        ].max.to_f
                    )
                ]
              end

            ranks.sort_by { |rank| -rank[1] }.first(5).map(&:first)
          end

      maybe_popular_charts =
        Chart
          .where(id: popular_ids)
          .includes(:author)
          .eager_load(:tags, file_resources: { file_attachment: :blob })
          .where(visibility: :public)
          .sonolus_listed

      if maybe_popular_charts.to_set(&:id) == popular_ids.to_set
        maybe_popular_charts
      else
        Rails.logger.info(
          "Missing levels in popular cache, clearing cache and recalculating"
        )
        Rails.cache.delete("sonolus:popular")
        self.popular_charts
      end
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
        charts.where(charts: { rating: (params[:q_rating_min]).. }) if params[
        :q_rating_min
      ].present?
      charts =
        charts.where(charts: { rating: ..(params[:q_rating_max]) }) if params[
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
        user_faved =
          current_user &&
            Like.find_by(user_id: current_user.id, chart_id: chart.id)

        render json: {
                 item: chart.to_sonolus,
                 hasCommunity: false,
                 actions: [
                   (
                     if user_faved
                       {
                         type: "unlike",
                         title: I18n.t("sonolus.levels.unlike"),
                         icon: "heart",
                         requireConfirmation: false,
                         options: []
                       }
                     else
                       {
                         type: "like",
                         title: I18n.t("sonolus.levels.like"),
                         icon: "heartHollow",
                         requireConfirmation: false,
                         options: []
                       }
                     end
                   )
                 ],
                 leaderboards: [],
                 sections:
                   [
                     {
                       title: I18n.t("sonolus.levels.sections.variant_of"),
                       itemType: "level",
                       items: [chart.variant_of&.to_sonolus]
                     },
                     {
                       title: I18n.t("sonolus.levels.sections.variants"),
                       itemType: "level",
                       items: chart.variants.map(&:to_sonolus)
                     },
                     {
                       title: I18n.t("sonolus.levels.sections.backgrounds"),
                       itemType: "background",
                       items:
                         [1, 3].map do |version|
                           chart.to_sonolus_background(
                             chart.resources,
                             version:
                           )
                         end
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

    def submit
      params.require(:name)
      require_login!

      chart = Chart.find_by(name: params[:name])
      unless chart
        render json: {
                 code: "not_found",
                 error: "Level not found"
               },
               status: :not_found
        return
      end

      values = URI.decode_www_form(params[:values]).to_h

      case values["type"]
      when "like"
        like = Like.find_by(user_id: current_user.id, chart_id: chart.id)
        Like.create(user_id: current_user.id, chart_id: chart.id) unless like
        render json: { shouldUpdate: true, key: "", hashes: [] }
      when "unlike"
        like = Like.find_by(user_id: current_user.id, chart_id: chart.id)
        like&.destroy
        render json: { shouldUpdate: true, key: "", hashes: [] }
      else
        render json: {
                 code: "bad_request",
                 error: "Invalid type"
               },
               status: :bad_request
      end
    end

    def background
      params.permit(:name)
      name, version = params[:name].split("-")
      unless version.match?(/v[13]/)
        render json: {
                 code: "bad_request",
                 error: "Invalid background name"
               },
               status: :bad_request
        return
      end

      chart = Chart.find_by(name:)
      unless chart
        render json: {
                 code: "not_found",
                 error: "Background not found"
               },
               status: :not_found
        return
      end

      version_num = version.delete_prefix("v").to_i

      render json: {
               item:
                 chart.to_sonolus_background(
                   chart.resources,
                   version: version_num
                 ),
               hasCommunity: false,
               actions: [],
               leaderboards: [],
               description: "",
               sections: [
                 {
                   title: I18n.t("sonolus.backgrounds.sections.versions"),
                   itemType: "background",
                   items: [
                     chart.to_sonolus_background(
                       chart.resources,
                       version: version_num == 1 ? 3 : 1
                     )
                   ]
                 }
               ]
             }
    end
  end
end
