# frozen_string_literal: true
require "sidekiq/api"

class UploadValidator
  include ActiveModel::Validations

  attr_reader :title,
              :description,
              :composer,
              :artist,
              :rating,
              :tags,
              :author_handle,
              :author_name,
              :is_chart_public,
              :visibility,
              :scheduled_at

  PRESENCE = { message: "cannotBeEmpty" }.freeze

  validates :title,
            presence: PRESENCE,
            length: {
              maximum: 50,
              message: "tooLong"
            }
  validates :description, length: { maximum: 500, message: "tooLong" }
  validates :composer,
            presence: PRESENCE,
            length: {
              maximum: 50,
              message: "tooLong"
            }
  validates :artist,
            allow_blank: true,
            length: {
              maximum: 50,
              message: "tooLong"
            }
  validates :rating,
            numericality: {
              only_integer: true,
              greater_than_or_equal_to: 1,
              less_than_or_equal_to: 99,
              message: "invalid"
            }
  validates :tags,
            allow_blank: true,
            length: {
              maximum: 5,
              message: "tooManyTags"
            }
  validates :author_handle,
            presence: PRESENCE,
            length: {
              minimum: 4,
              message: "invalid"
            }
  validates :author_name,
            allow_blank: true,
            length: {
              maximum: 50,
              message: "tooLong"
            }
  validates :is_chart_public,
            inclusion: {
              in: [true, false],
              message: "invalid"
            },
            if: -> { is_chart_public.present? }

  validates :visibility,
            inclusion: {
              in: %w[public scheduled private],
              message: "invalid"
            },
            if: -> { visibility.present? }
  validates :scheduled_at,
            presence: PRESENCE,
            if: -> { scheduled_at.is_a?(Integer) }

  def initialize(params, user_id)
    @title = params[:title]
    @description = params[:description]
    @composer = params[:composer]
    @artist = params[:artist]
    @rating = params[:rating]
    @tags = params[:tags]
    @author_handle = params[:authorHandle]
    @author_name = params[:authorName]
    @is_chart_public = params[:isChartPublic]
    @visibility = params[:visibility]
    @user_id = user_id
    @scheduled_at = params[:scheduledAt]
  end
end

module Api
  class ChartsController < FrontendController
    def all
      params.permit(:count, :offset, :author, :liked, :include_non_public)
      length = params[:count].to_i

      length = 20 if length <= 0 || length > 20
      cond = { visibility: :public }
      order = { published_at: :desc }

      if params[:liked] == "true"
        unless (user_id = session[:user_id])
          render json: {
                   code: "not_authorized",
                   error: "Not authorized"
                 },
                 status: :unauthorized
          return
        end
        cond[:id] = Like.where(user_id:).pluck(:chart_id)
      end

      if params[:author]
        user = User.find_by(handle: params[:author].delete_prefix("x"))
        unless user
          render json: {
                   code: "not_found",
                   error: "User not found"
                 },
                 status: :not_found
          return
        end
        cond[:author_id] = user.id
      end

      if params[:include_non_public] == "true"
        unless (user_id = session[:user_id])
          render json: {
                   code: "not_authorized",
                   error: "Not authorized"
                 },
                 status: :unauthorized
          return
        end
        cond.delete(:visibility)
        alts = User.where(owner_id: user_id).pluck(:id)
        cond[:author_id] = [user_id, *alts]
        order = { updated_at: :desc }
      else
        cond[:variant_id] = nil
      end

      charts =
        Chart
          .preload(%i[author co_authors variants tags])
          .limit(length)
          .offset(params[:offset].to_i || 0)
          .where(**cond)
          .order(**order)
      chart_ids = charts.map(&:id)
      file_resources =
        FileResource
          .where(chart_id: chart_ids)
          .eager_load(file_attachment: :blob)
          .to_a
      file_resources_by_chart_id = file_resources.group_by(&:chart_id)
      charts =
        charts.map do |chart|
          file_resources = file_resources_by_chart_id[chart.id] || []
          chart.define_singleton_method(:file_resources) { file_resources }
          chart.to_frontend(user: session_data && session_data[:user])
        end
      render json: { code: "ok", charts: }
    end

    def show
      params.permit(:name, :with_resources)
      chart = Chart.include_all.find_by(name: params[:name])
      if chart
        render json: {
                 code: "ok",
                 chart:
                   chart.to_frontend(
                     with_resources: params[:with_resources] != "false"
                   )
               }
      else
        render json: {
                 code: "not_found",
                 error: "Chart not found"
               },
               status: :not_found
      end
    end

    def process_chart_request
      data_parsed = JSON.parse(params[:data], symbolize_names: true)
      validator = UploadValidator.new(data_parsed, session[:user_id])
      unless validator.valid?
        render json: {
                 code: "invalid_request",
                 errors: validator.errors.messages.transform_values { |v| v[0] }
               },
               status: :bad_request
        return
      end

      author =
        User.find_by(handle: data_parsed[:authorHandle].delete_prefix("x"))
      unless author
        render json: {
                 code: "not_found",
                 error: "Author not found"
               },
               status: :not_found
        return
      end

      unless (
               ENV["ADMIN_HANDLE"] && current_user.handle == ENV["ADMIN_HANDLE"]
             ) || author.id == session[:user_id] ||
               author.owner_id == session[:user_id]
        render json: {
                 code: "forbidden",
                 error: "You are not allowed to upload charts as this user"
               },
               status: :forbidden
        return
      end
      variant = nil
      if data_parsed[:variant].present? &&
           !(variant = Chart.find_by(name: data_parsed[:variant]))
        render json: {
                 code: "invalid_request",
                 errors: {
                   variant: "variantNotFound"
                 }
               },
               status: :bad_request
        return
      end
      unless data_parsed[:authorName]&.present?
        data_parsed[:authorName] = author.name
      end
      [
        {
          title: data_parsed[:title],
          composer: data_parsed[:composer],
          artist: data_parsed[:artist],
          description: data_parsed[:description],
          rating: data_parsed[:rating],
          tags: data_parsed[:tags],
          author_name: data_parsed[:authorName],
          author_handle: data_parsed[:authorHandle],
          is_chart_public: data_parsed[:isChartPublic],
          visibility: data_parsed[:visibility],
          scheduled_at: data_parsed[:scheduledAt]
        },
        author,
        variant
      ]
    end

    def create
      params.permit(%i[data chart cover bgm])
      require_login!
      require_discord!
      unless params.to_unsafe_hash.symbolize_keys in {
               data: String,
               chart: ActionDispatch::Http::UploadedFile,
               cover: ActionDispatch::Http::UploadedFile,
               bgm: ActionDispatch::Http::UploadedFile
             }
        render json: {
                 code: "invalid_request",
                 error: "Invalid request"
               },
               status: :bad_request
        return
      end
      data_parsed, author, variant = *process_chart_request
      return if data_parsed.nil?
      chart =
        author.charts.create!(
          name: Chart.uuid,
          title: data_parsed[:title],
          composer: data_parsed[:composer],
          artist: data_parsed[:artist],
          description: data_parsed[:description],
          rating: data_parsed[:rating],
          author_name: data_parsed[:author_name],
          variant_of: variant,
          is_chart_public: data_parsed[:is_chart_public],
          visibility: data_parsed[:visibility].to_sym
        )
      chart.tags.create!(data_parsed[:tags].map { |t| { name: t } })
      ChartConvertJob.perform_later(
        FileResource.upload(chart, :chart, params[:chart])
      )
      BgmConvertJob.perform_later(
        chart.name,
        TemporaryFile.new(params[:bgm]).id
      )
      ImageConvertJob.perform_now(
        chart.name,
        TemporaryFile.new(params[:cover]).id,
        :cover
      )

      render json: { code: "ok", chart: chart.to_frontend }
    end

    def update
      params.permit(%i[data chart cover bgm name])
      require_login!
      hash = params.to_unsafe_hash.symbolize_keys
      if hash[:data].blank? &&
           %i[chart cover bgm].all? { |k|
             hash[k].nil? || hash[k].is_a?(ActionDispatch::Http::UploadedFile)
           }
        render json: {
                 code: "invalid_request",
                 error: "Invalid request"
               },
               status: :bad_request
        return
      end
      data_parsed, author, variant = *process_chart_request
      return if data_parsed.nil?

      logger.info "Updating chart #{params[:name]}: #{data_parsed}"

      chart = Chart.find_by(name: params[:name])
      unless chart
        render json: {
                 code: "not_found",
                 error: "Chart not found"
               },
               status: :not_found
        return
      end

      args = {
        **(
          {
            title: data_parsed[:title],
            composer: data_parsed[:composer],
            artist: data_parsed[:artist],
            description: data_parsed[:description],
            rating: data_parsed[:rating],
            author_name: data_parsed[:author_name],
            author_id: author.id,
            visibility: data_parsed[:visibility].to_sym,
            is_chart_public: data_parsed[:is_chart_public],
            scheduled_at: Time.at(data_parsed[:scheduled_at] / 1000)
          }.compact
        ),
        variant_id: variant&.id
      }
      if args[:visibility] == :scheduled ||
           (args[:visibility] != chart.visibility)
        job = Sidekiq::ScheduledSet.new.find_job(chart.scheduled_job_id)
        if job
          job.delete
          logger.info "Deleted publish job #{chart.scheduled_job_id} for chart #{chart.name}"
        else
          logger.warn "Publish job for chart #{chart.name} not found"
        end
        args[:scheduled_job_id] = nil
      end
      args[:scheduled_job_id] = nil
      if args[:visibility] == :public && !chart.published_at
        args[:published_at] = Time.now
      elsif args[:visibility] == :scheduled
        args[:scheduled_job_id] = PublishChartJob
          .set(wait_until: args[:scheduled_at])
          .perform_later(chart.id)
          .provider_job_id
        logger.info "Scheduled publish job #{args[:scheduled_job_id]} for chart #{chart.name}"
      end
      chart.update!(args)
      logger.debug args

      chart.tags.delete_all
      chart.tags.create!(data_parsed[:tags].map { |t| { name: t } })
      if params[:chart]
        ChartConvertJob.perform_later(
          FileResource.upload(chart, :chart, params[:chart])
        )
      end
      if params[:bgm]
        BgmConvertJob.perform_later(
          chart.name,
          TemporaryFile.new(params[:bgm]).id
        )
      end
      if params[:cover]
        ImageConvertJob.perform_now(
          chart.name,
          TemporaryFile.new(params[:cover]).id,
          :cover
        )
      end
      render json: { code: "ok", chart: chart.to_frontend }
    end

    def delete
      params.require(:name)
      require_login!

      chart = Chart.find_by(name: params[:name])
      unless chart
        render json: {
                 code: "not_found",
                 error: "Chart not found"
               },
               status: :not_found
        return
      end

      user = User.find_by(id: session[:user_id])
      unless (ENV["ADMIN_HANDLE"] && user&.handle == ENV["ADMIN_HANDLE"]) ||
               chart.author_id == session[:user_id] ||
               chart.author.owner_id == session[:user_id]
        render json: {
                 code: "forbidden",
                 error: "User cannot delete this chart"
               },
               status: :forbidden
      end

      chart.destroy!
      render json: { code: "ok" }
    end

    def download_chart
      params.require(:name)

      chart = Chart.find_by(name: params[:name])
      unless chart
        render json: {
                 code: "not_found",
                 error: "Chart not found"
               },
               status: :not_found
        return
      end

      unless chart.is_chart_public?
        render json: {
                 code: "forbidden",
                 error: "Chart is not public"
               },
               status: :forbidden
        return
      end

      url = chart.resources[:chart].file.url
      unless url
        render json: {
                 code: "not_found",
                 error: "Chart not found"
               },
               status: :not_found
        return
      end

      send_data(
        chart.resources[:chart].file.download,
        filename: "#{chart.name}.#{chart.chart_type}",
        type: "plain/text"
      )
    end
  end
end
