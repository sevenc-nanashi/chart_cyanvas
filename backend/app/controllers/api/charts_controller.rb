# frozen_string_literal: true

class UploadValidator
  include ActiveModel::Validations

  attr_reader :title,
              :description,
              :composer,
              :artist,
              :rating,
              :tags,
              :author_handle,
              :author_name

  PRESENCE = { message: "cannotBeEmpty" }.freeze

  validates :title,
            presence: PRESENCE,
            length: {
              maximum: 50,
              message: "tooLong"
            }
  validates :description,
            presence: PRESENCE,
            length: {
              maximum: 500,
              message: "tooLong"
            }
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
              is: 4,
              message: "invalid"
            }
  validates :author_name,
            allow_blank: true,
            length: {
              maximum: 50,
              message: "tooLong"
            }

  def initialize(params, user_id)
    @title = params[:title]
    @description = params[:description]
    @composer = params[:composer]
    @artist = params[:artist]
    @rating = params[:rating]
    @tags = params[:tags]
    @author_handle = params[:author_handle]
    @author_name = params[:author_name]
    @user_id = user_id
  end
end

module Api
  class ChartsController < FrontendController
    def all
      params.permit(:count, :offset, :author, :liked, :include_non_public)
      length = params[:count].to_i

      length = 20 if length <= 0 || length > 20
      cond = { is_public: true }

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
        cond.delete(:is_public)
        cond[:author_id] = user_id
      end

      charts =
        Chart
          .limit(length)
          .offset(params[:offset].to_i || 0)
          .where(**cond)
          .order(updated_at: :desc)
          .include_all
          .tap { |c| ActiveRecord::Precounter.new(c).precount(:likes) }
          .map do |chart|
            chart.to_frontend(user: session_data && session_data[:user])
          end
      render json: { code: "ok", charts: }
    end

    def show
      params.permit(:name, :with_resources)
      chart =
        Rails
          .cache
          .fetch("/charts/#{params[:name]}", expires_in: 1.day) do
            Chart
              .include_all
              .eager_load(file_resources: { file_attachment: :blob })
              .find_by(name: params[:name])
          end
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
      logger.debug data_parsed
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
        User.find_by(handle: data_parsed[:author_handle].delete_prefix("x"))
      unless author
        render json: {
                 code: "not_found",
                 error: "Author not found"
               },
               status: :not_found
        return
      end

      unless author.id == session[:user_id] ||
               author.owner_id == session[:user_id]
        render json: {
                 code: "not_authorized",
                 error: "Not authorized"
               },
               status: :unauthorized
        return
      end
      variant = nil
      if data_parsed[:variant].present? &&
           !variant =
             Chart.find_by(name: data_parsed[:variant], author_id: author.id)
        render json: {
                 code: "invalid_request",
                 errors: {
                   variant: "variantNotFound"
                 }
               },
               status: :bad_request
        return
      end
      [data_parsed, author, variant]
    end

    def create
      params.permit(%i[data chart cover bgm])
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
          variant_id: variant&.id
        )
      chart.tags.create!(data_parsed[:tags].map { |t| { name: t } })
      SusConvertJob.perform_later(
        FileResource.upload(chart, :sus, params[:chart])
      )
      BgmConvertJob.perform_later(
        FileResource.upload(chart, :base_bgm, params[:bgm])
      )
      ImageConvertJob.perform_now(
        FileResource.upload(chart, :base_cover, params[:cover]),
        :cover
      )

      revalidate("/charts/#{chart.name}")
      render json: { code: "ok", chart: chart.to_frontend }
    end

    def update
      params.permit(%i[data chart cover bgm])
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

      chart = Chart.find_by(name: params[:name])
      unless chart
        render json: {
                 code: "not_found",
                 error: "Chart not found"
               },
               status: :not_found
        return
      end

      unless chart.author_id == author.id || chart.author.owner_id == author.id
        render json: {
                 code: "not_authorized",
                 error: "Not authorized"
               },
               status: :unauthorized
        return
      end

      args = {
        title: data_parsed[:title],
        composer: data_parsed[:composer],
        artist: data_parsed[:artist],
        description: data_parsed[:description],
        rating: data_parsed[:rating],
        author_name: data_parsed[:author_name],
        variant_id: variant&.id,
        is_public: data_parsed[:is_public]
      }.compact
      chart.update!(args)
      chart.tags.delete_all
      chart.tags.create!(data_parsed[:tags].map { |t| { name: t } })
      if params[:chart]
        SusConvertJob.perform_later(
          FileResource.upload(chart, :sus, params[:chart])
        )
      end
      if params[:bgm]
        BgmConvertJob.perform_later(
          FileResource.upload(chart, :base_bgm, params[:bgm])
        )
      end
      if params[:cover]
        ImageConvertJob.perform_now(
          FileResource.upload(chart, :base_cover, params[:cover]),
          :cover
        )
      end
      revalidate("/charts/#{chart.name}")
      render json: { code: "ok", chart: chart.to_frontend }
    end

    def delete
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

      unless chart.author_id == session[:user_id] ||
               chart.author.owner_id == session[:user_id]
        render json: {
                 code: "forbidden",
                 error: "User cannot delete this chart"
               },
               status: :forbidden
      end

      chart.destroy!
      revalidate("/charts/#{chart.name}")
      render json: { code: "ok" }
    end
  end
end
