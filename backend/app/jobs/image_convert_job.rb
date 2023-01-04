# frozen_string_literal: true
require "base64"
require "http"
require "json"

class ImageConvertJob < ApplicationJob
  queue_as :default

  def perform(image_resource)
    logger.info "ImageConvertJob: #{image_resource.id}"
    response =
      HTTP
        .post(
          "#{ENV.fetch("SUB_IMAGE_HOST", nil)}/convert",
          json: {
            url: image_resource.to_frontend
          }
        )
        .then { JSON.parse(_1.body.to_s, symbolize_names: true) }
    raise "Failed to convert image file!" if response[:code] != "ok"
    logger.info "ImageConvertJob: #{image_resource.id}: cover: #{response[:cover_id]}, background: #{response[:background_id]}"
    image_data =
      HTTP.get("#{ENV.fetch("SUB_IMAGE_HOST", nil)}/download/#{response[:cover_id]}")
    raise "Failed to download image file!" if image_data.status != 200
    FileResource.upload_from_string(
      image_resource.chart,
      :cover,
      image_data.body.to_s
    )
    HTTP.delete("#{ENV.fetch("SUB_IMAGE_HOST", nil)}/download/#{response[:cover_id]}")

    background_data =
      HTTP.get("#{ENV.fetch("SUB_IMAGE_HOST", nil)}/download/#{response[:background_id]}")
    raise "Failed to download image file!" if background_data.status != 200
    FileResource.upload_from_string(
      image_resource.chart,
      :background,
      background_data.body.to_s
    )
    HTTP.delete("#{ENV.fetch("SUB_IMAGE_HOST", nil)}/download/#{response[:background_id]}")

    image_resource.destroy
  end
end
