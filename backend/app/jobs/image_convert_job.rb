# frozen_string_literal: true
require "base64"
require "http"
require "json"

class ImageConvertJob < ApplicationJob
  queue_as :default

  def perform(chart_name, image_file_id, type)
    image_file =
      (
        if image_file_id.is_a?(String)
          TemporaryFile.find(image_file_id)
        else
          image_file_id
        end
      )

    logger.info "ImageConvertJob: #{image_file.id}, #{type}"
    response =
      HTTP
        .post(
          "#{ENV.fetch("SUB_IMAGE_HOST", nil)}/convert",
          json: {
            url: image_file.url,
            type:
          }
        )
        .then { JSON.parse(_1.body.to_s, symbolize_names: true) }
    raise "Failed to convert image file!" if response[:code] != "ok"
    logger.info "ImageConvertJob: #{image_file.id}: downloading image: #{response[:id]}"
    image_data =
      HTTP.get("#{ENV.fetch("SUB_IMAGE_HOST", nil)}/download/#{response[:id]}")
    raise "Failed to download image file!" if image_data.status != 200
    resource =
      FileResource.upload_from_string(chart_name, type, image_data.body.to_s)
    HTTP.delete("#{ENV.fetch("SUB_IMAGE_HOST", nil)}/download/#{response[:id]}")
    case type
    when :cover
      ImageConvertJob.perform_later(chart_name, resource, :background_v3)
      image_file.delete
    when :background_v3
      ImageConvertJob.perform_later(chart_name, resource, :background_v1)
    end
  end
end
