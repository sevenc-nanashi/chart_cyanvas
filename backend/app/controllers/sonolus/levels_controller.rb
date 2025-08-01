# frozen_string_literal: true
require "uri"

module Sonolus
  class LevelsController < SonolusController
    SORTS = %i[published_at updated_at likes_count random].freeze

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
          query: :q_genres,
          name: I18n.t("sonolus.search.genres"),
          description: I18n.t("sonolus.search.genres_description"),
          type: "multi",
          required: false,
          def: Chart::GENRES.map { false },
          values:
            Chart::GENRES.keys.map do |genre|
              { name: genre, title: I18n.t("sonolus.levels.genres.#{genre}") }
            end
        },
        {
          query: :q_tags,
          name: I18n.t("sonolus.search.tags"),
          type: "text",
          placeholder: I18n.t("sonolus.search.tags_placeholder"),
          required: false,
          limit: 0,
          def: "",
          shortcuts: %w[Append Master Expert].map { |tag| " #{tag}" }
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
          def: :published_at,
          values:
            SORTS.map do |sort|
              { name: sort, title: I18n.t("sonolus.search.sorts.#{sort}") }
            end,
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
        },
        current_user &&
          {
            type: "liked",
            title: I18n.t("sonolus.targets.liked"),
            requireConfirmation: false,
            options: []
          }
      ].compact
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
                .map { it.to_sonolus(background_version:) }
          }
        end

      popular_section = {
        title: "#POPULAR",
        itemType: "post",
        items: [
          {
            name: "chcy-post-popular-is-maintenanced",
            title: I18n.t("sonolus.popular_maintenance.title"),
            tags: [],
            version: 1,
            time: 1_727_787_903_000,
            author: "",
            thumbnail: {
              url: "/assets/warning.png"
            }
          }
        ]
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
            .where(visibility: :public, genre: user_genres)
            .sonolus_listed
            .map { it.to_sonolus(background_version:) }
      }
      random_charts =
        begin
          chart_ids = get_random_chart_ids(5, genres: user_genres)
          Chart
            .includes(:author)
            .eager_load(:tags, file_resources: { file_attachment: :blob })
            .where(id: chart_ids)
            .in_order_of(:id, chart_ids)
        end
      random_section = {
        title: "#RANDOM",
        itemType: "level",
        searchValues: "q_sort=random",
        items:
          random_charts.map { |chart| chart.to_sonolus(background_version:) }
      }
      render json: {
               searches:,
               sections: [
                 private_section,
                 newest_section,
                 random_section,
                 popular_section
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
      if params[:type] == "quick" && params[:keywords].present?
        charts =
          charts.where(
            "LOWER(charts.title) LIKE ? OR LOWER(charts.composer) LIKE ? OR LOWER(charts.artist) LIKE ?",
            "%#{Chart.sanitize_sql_like(params[:keywords].downcase)}%",
            "%#{Chart.sanitize_sql_like(params[:keywords].downcase)}%",
            "%#{Chart.sanitize_sql_like(params[:keywords].downcase)}%"
          )
      end
      if params[:q_title].present?
        charts =
          charts.where(
            "LOWER(charts.title) LIKE ?",
            "%#{Chart.sanitize_sql_like(params[:q_title].downcase)}%"
          )
      end
      if params[:q_composer].present?
        charts =
          charts.where(
            "LOWER(charts.composer) LIKE ?",
            "%#{Chart.sanitize_sql_like(params[:q_composer].downcase)}%"
          )
      end
      if params[:q_artist].present?
        charts =
          charts.where(
            "LOWER(charts.artist) LIKE ?",
            "%#{Chart.sanitize_sql_like(params[:q_artist].downcase)}%"
          )
      end
      if params[:q_tags].present?
        tags =
          params[:q_tags]
            .split(",")
            .map(&:strip)
            .map(&:downcase)
            .compact_blank
            .uniq

        charts =
          Chart
            .joins(:tags)
            .where("LOWER(tags.name) IN (?)", tags)
            .group("charts.id")
            .having("COUNT(DISTINCT LOWER(tags.name)) = ?", tags.size)
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
                   message: I18n.t("sonolus.search.unknown_author")
                 },
                 status: :bad_request
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
      genres =
        (params[:q_genres] || "")
          .split(",")
          .map do |genre|
            genre = genre.strip.downcase.to_sym
            if Chart::GENRES.key?(genre)
              genre
            else
              logger.warn "Invalid genre: #{genre}"
              nil
            end
          end
          .compact
      charts =
        if genres.empty?
          charts.where(genre: user_genres)
        else
          charts.where(genre: genres)
        end

      charts =
        case params[:q_sort]&.to_sym
        when :updated_at
          charts.order(updated_at: :desc)
        when :likes_count
          charts.order(likes_count: :desc)
        when :random
          # TODO(maybe): use more low-cost and low-randomness method for anonymous users
          cacheable =
            self.class.search_options.all? do |option|
              %i[q_sort q_genres].include?(option[:query]) ||
                params[option[:query]].blank?
            end
          random_ids =
            if cacheable
              Rails.logger.debug "Fetching random charts from cache"
              get_random_chart_ids(
                20,
                genres: genres.empty? ? user_genres : genres
              )
            else
              charts.pluck(:id).sample(20)
            end
          charts.where(id: random_ids).in_order_of(:id, random_ids)
        else
          charts.order(published_at: :desc)
        end

      if params[:q_sort] == "random"
        render json: {
                 items: charts.map { it.to_sonolus(background_version:) },
                 searches:,
                 pageCount: -1,
                 cursor: ""
               }
      else
        page_count = (charts.unscope(:group, :having).count / 20.0).ceil

        charts = charts.offset([params[:page].to_i * 20, 0].max).limit(20)

        render json: {
                 items: charts.map { it.to_sonolus(background_version:) },
                 searches:,
                 pageCount: page_count
               }
      end
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
                 item: chart.to_sonolus(background_version:),
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
                       items: [
                         chart.variant_of&.to_sonolus(background_version:)
                       ].compact
                     },
                     {
                       title: I18n.t("sonolus.levels.sections.variants"),
                       itemType: "level",
                       items:
                         chart.variants.map do |level|
                           level.to_sonolus(background_version:)
                         end
                     },
                     {
                       title: I18n.t("sonolus.levels.sections.backgrounds"),
                       itemType: "background",
                       items:
                         BACKGROUND_VERSIONS.map do |version|
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
        render json: { shouldUpdateItem: true, key: "", hashes: [] }
      when "unlike"
        like = Like.find_by(user_id: current_user.id, chart_id: chart.id)
        like&.destroy
        render json: { shouldUpdateItem: true, key: "", hashes: [] }
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
      unless BACKGROUND_VERSIONS.include?(version.to_sym)
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

      render json: {
               item: chart.to_sonolus_background(chart.resources, version:),
               hasCommunity: false,
               actions: [],
               leaderboards: [],
               description: "",
               sections: [
                 {
                   title: I18n.t("sonolus.backgrounds.sections.versions"),
                   itemType: "background",
                   items: [
                     chart.to_sonolus_background(chart.resources, version:)
                   ]
                 }
               ]
             }
    end

    def result_info
      render json: { submits: [] }
    end

    RANDOM_CHARTS_CACHE_COUNT = 100
    def get_random_chart_ids(count, genres: Chart::GENRES.keys)
      randoms = []
      genres.each do |genre|
        chart_ids =
          Rails
            .cache
            .fetch("sonolus:random_charts:#{genre}", expires_in: 1.hour) do
              chart_ids =
                Chart
                  .where(genre:)
                  .where(visibility: :public)
                  .sonolus_listed
                  .pluck(:id)
              chart_ids.sample(RANDOM_CHARTS_CACHE_COUNT)
            end
        randoms += chart_ids
      end
      randoms.sample(count)
    end
  end
end
