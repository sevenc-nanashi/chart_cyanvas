class FileResource < ApplicationRecord
  has_one_attached :file
  belongs_to :chart

  enum kind: {
         data: 0,
         cover: 1,
         bgm: 2,
         sus: 3,
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
  }

  def self.upload(chart, kind, file)
    FileResource.where(chart: chart, kind: kind).destroy_all
    uploaded =
      chart.file_resources.create!(
        name: self.uuid,
        kind: kind,
        sha1: Digest::SHA1.file(file.tempfile).hexdigest
      )
    uploaded.file.attach(file)
    uploaded
  end

  def self.upload_from_string(chart, kind, string)
    file = StringIO.new(string)

    FileResource.where(chart: chart, kind: kind).destroy_all
    uploaded =
      chart.file_resources.create!(
        name: self.uuid,
        kind: kind,
        sha1: Digest::SHA1.hexdigest(string)
      )
    uploaded.file.attach(io: file, filename: uploaded.name)
    uploaded
  end

  def to_frontend
    Rails.application.routes.url_helpers.rails_blob_path(
      self.file,
      only_path: true
    )
  end

  def to_srl
    { hash: self.sha1, type: TYPES[self.kind.to_sym], url: self.to_frontend }
  end
end
