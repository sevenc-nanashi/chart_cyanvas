# frozen_string_literal: true
require "counter_culture"

class Chart < ApplicationRecord
  has_many :co_authors, dependent: :destroy
  belongs_to :author, class_name: "User"
  has_many :file_resources, dependent: :destroy
  has_many :variants,
           class_name: "Chart",
           foreign_key: "variant_id",
           dependent: :nullify,
           inverse_of: :variant_of
  belongs_to :variant_of,
             class_name: "Chart",
             optional: true,
             foreign_key: "variant_id",
             inverse_of: :variants
  has_many :likes, dependent: :destroy
  has_many :tags, dependent: :destroy

  def self.include_all
    preload(%i[author co_authors variants tags file_resources]).merge(
      FileResource.with_attached_file
    )
  end

  scope :sonolus_listed, -> { where(variant_id: nil) }
  def resources
    base = file_resources.with_attached_file
    {
      sus: base.find(&:sus?),
      bgm: base.find(&:bgm?),
      cover: base.find(&:cover?),
      preview: base.find(&:preview?),
      data: base.find(&:data?),
      background: base.find(&:background?)
    }
  end

  def to_frontend(user: nil, with_resources: true, with_variants: true)
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
      sus: is_sus_public ? resources[:sus]&.to_frontend : nil,
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
      isPublic: is_public,
      variantOf:
        variant_id && Chart.find(variant_id).to_frontend(with_variants: false)
    }
  end

  def to_sonolus
    resources = self.resources
    {
      name: "chcy-#{name}",
      title:,
      artists: "#{composer} / #{artist.presence || "-"}",
      author: "#{author_name.presence || author.name}##{author.display_handle}",
      cover: resources[:cover]&.to_srl,
      bgm: resources[:bgm]&.to_srl,
      preview: resources[:preview]&.to_srl,
      data: resources[:data]&.to_srl,
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

  def to_sonolus_background(resources)
    config = {
      hash:
        Digest::SHA1.file(
          Rails.root.join("assets/backgrounds/BackgroundConfiguration")
        ).hexdigest,
      url: "/sonolus/assets/backgrounds/BackgroundConfiguration",
      type: "BackgroundConfiguration"
    }
    data = {
      hash:
        Digest::SHA1.file(
          Rails.root.join("assets/backgrounds/BackgroundData")
        ).hexdigest,
      url: "/sonolus/assets/backgrounds/BackgroundData",
      type: "BackgroundData"
    }
    {
      name: "chcy-bg-#{name}",
      version: 2,
      title:,
      subtitle: "#{composer}#{artist.presence ? " / #{artist}" : ""}",
      author: "#{author_name.presence || author.name}##{author.display_handle}",
      thumbnail: resources[:cover]&.to_srl&.merge(type: "BackgroundThumbnail"),
      data:,
      image: resources[:background]&.to_srl,
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
