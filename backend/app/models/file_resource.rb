# frozen_string_literal: true
class FileResource < ApplicationRecord
  has_one_attached :file
  belongs_to :chart

  enum kind: {
         data: 0,
         cover: 1,
         bgm: 2,
         chart: 3,
         preview: 4,
         base_bgm: 5,
         background: 6,
         base_cover: 7
       }

  TYPES = {
    data: "LevelData",
    cover: "LevelCover",
    bgm: "LevelBgm",
    preview: "LevelPreview",
    background: "BackgroundImage"
  }.freeze

  def self.upload(chart, kind, file)
    FileResource.where(chart:, kind:).destroy_all
    uploaded =
      chart.file_resources.create!(
        name: uuid,
        kind:,
        sha1: Digest::SHA1.file(file.tempfile).hexdigest
      )
    uploaded.file.attach(file)
    uploaded
  end

  def self.upload_from_string(chart_name, kind, string)
    file = StringIO.new(string)
    chart = Chart.find_by(name: chart_name)

    FileResource.where(chart:, kind:).destroy_all
    uploaded =
      chart.file_resources.create!(
        name: uuid,
        kind:,
        sha1: Digest::SHA1.hexdigest(string)
      )
    uploaded.file.attach(io: file, filename: uploaded.name)
    uploaded
  end

  def to_frontend
    begin
      if ENV["S3_PUBLIC_HOST"].present?
        "#{ENV["S3_PUBLIC_HOST"]}/#{file.key}"
      elsif ENV["BACKEND_HOST"].blank?
        file.url
      else
        Rails.application.routes.url_helpers.rails_blob_path(
          file,
          host: ENV["BACKEND_HOST"]
        )
      end
    rescue StandardError
      nil
    end
  end

  alias url to_frontend

  def to_srl
    { hash: sha1, type: TYPES[kind.to_sym], url: to_frontend }
  end
end
