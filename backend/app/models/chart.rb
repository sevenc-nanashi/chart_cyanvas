# frozen_string_literal: true
require "counter_culture"

class Chart < ApplicationRecord
  has_many :co_authors, dependent: :destroy
  belongs_to :author, class_name: "User"
  counter_culture :author,
                  column_name:
                    proc { |model|
                      model.visibility_public? ? "charts_count" : nil
                    },
                  column_names: {
                    ["charts.visibility = ?", 1] => "charts_count"
                  }

  has_many :file_resources, dependent: :destroy
  has_many :_variants,
           class_name: "Chart",
           foreign_key: "variant_id",
           dependent: :nullify,
           inverse_of: :variant_of
  belongs_to :variant_of,
             class_name: "Chart",
             optional: true,
             foreign_key: "variant_id",
             inverse_of: :_variants
  has_many :likes, dependent: :destroy
  has_many :tags, dependent: :destroy
  enum chart_type: { sus: 0, mmws: 1, chs: 2, vusc: 3, ccmmws: 4 }

  VISIBILITY = { private: 0, public: 1, scheduled: 2 }.freeze
  enum :visibility, VISIBILITY, prefix: "visibility"

  def self.include_all
    preload(%i[author co_authors _variants tags file_resources]).merge(
      FileResource.with_attached_file
    )
  end

  scope :sonolus_listed, -> { where(variant_id: nil) }
  def resources
    base = file_resources
    {
      chart: base.find(&:chart?),
      bgm: base.find(&:bgm?),
      cover: base.find(&:cover?),
      preview: base.find(&:preview?),
      data: base.find(&:data?),
      background_v3: base.find(&:background_v3?),
      background_v1: base.find(&:background_v1?)
    }
  end

  def variants(include_private: false)
    include_private ? _variants : _variants.where(visibility: :public)
  end

  def to_frontend(user: nil, with_resources: true, with_variants: false)
    resources = with_resources ? self.resources : {}
    likes = likes_count
    {
      name:,
      title:,
      composer:,
      artist:,
      author: author.to_frontend,
      authorName: author_name,
      coAuthors: co_authors.map(&:to_frontend),
      cover: resources[:cover]&.to_frontend,
      bgm: resources[:bgm]&.to_frontend,
      chart: is_chart_public? ? resources[:chart]&.to_frontend : nil,
      data: resources[:data]&.to_frontend,
      variants:
        (
          if with_variants
            variants.map { |v| v.to_frontend(with_variants: false) }
          else
            []
          end
        ),
      tags: tags.map(&:name),
      publishedAt: published_at&.iso8601,
      updatedAt: updated_at.iso8601,
      rating:,
      likes:,
      liked: user ? likes.exists?(user:) : false,
      description:,
      visibility:,
      scheduledAt: scheduled_at&.iso8601,
      variantOf:
        with_variants && variant_id &&
          Chart.find(variant_id).to_frontend(with_variants: false)
    }
  end

  def to_sonolus
    resources = self.resources
    {
      name: "chcy-#{name}",
      title:,
      artists: "#{composer} / #{artist.presence || "-"}",
      author: "#{author_name.presence || author.name}##{author.display_handle}",
      source: ENV.fetch("HOST", nil),
      tags: [],
      cover: resources[:cover]&.to_srl || { hash: "", url: "" },
      bgm: resources[:bgm]&.to_srl || { hash: "", url: "" },
      preview: resources[:preview]&.to_srl || { hash: "", url: "" },
      data:
        resources[:data]&.to_srl ||
          { hash: "", url: "/sonolus/assets/generate?chart=#{name}&type=data" },
      rating:,
      version: 1,
      useSkin: {
        useDefault: true
      },
      useBackground: {
        useDefault: false,
        item: to_sonolus_background(resources)
      },
      useEffect: {
        useDefault: true
      },
      useParticle: {
        useDefault: true
      },
      engine: Sonolus::AssetController.asset_get("engine", "pjsekai-extended")
    }
  end

  def to_sonolus_background(resources, version: 3)
    config = {
      hash:
        Digest::SHA1.file(
          Rails.root.join("assets/backgrounds/configuration.json.gz")
        ).hexdigest,
      url: "/sonolus/assets/backgrounds/configuration.json.gz"
    }
    data = {
      hash:
        Digest::SHA1.file(
          Rails.root.join("assets/backgrounds/v#{version}_data.json.gz")
        ).hexdigest,
      url: "/sonolus/assets/backgrounds/v#{version}_data.json.gz"
    }
    {
      name: "chcy-bg-#{name}-v#{version}",
      version: 2,
      tags: [],
      source: ENV.fetch("HOST", nil),
      title:,
      subtitle: "#{composer}#{artist.presence ? " / #{artist}" : ""}",
      author: "#{author_name.presence || author.name}##{author.display_handle}",
      thumbnail:
        resources[:cover]&.to_srl ||
          {
            hash: "",
            url: ""
          },
      data:,
      image:
        resources[:"background_v#{version}"]&.to_srl ||
          {
            hash: "",
            url:
              "/sonolus/assets/generate?chart=#{name}&type=background_v#{version}"
          },
      configuration: config
    }
  end

  def sonolus_description
    I18n.t(
      "sonolus.levels.description",
      tags:
        tags.map(&:name).join(I18n.t("sonolus.tag_separator")).presence || "-",
      likes: likes_count,
      description:
    )
  end
end
