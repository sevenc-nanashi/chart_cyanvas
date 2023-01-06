# frozen_string_literal: true
require "base64"
require "http"
require "json"

class ImageConvertJob < ApplicationJob
  queue_as :default

  def perform(image_resource, type)
    logger.info "ImageConvertJob: #{image_resource.id}, #{type}"
    response =
      HTTP
        .post(
          "#{ENV.fetch("SUB_IMAGE_HOST", nil)}/convert",
          json: {
            url: image_resource.to_frontend,
            type:
          }
        )
        .then { JSON.parse(_1.body.to_s, symbolize_names: true) }
    raise "Failed to convert image file!" if response[:code] != "ok"
    logger.info "ImageConvertJob: #{image_resource.id}: downloading image: #{response[:id]}"
    image_data =
      HTTP.get("#{ENV.fetch("SUB_IMAGE_HOST", nil)}/download/#{response[:id]}")
    raise "Failed to download image file!" if image_data.status != 200
    resource =
      FileResource.upload_from_string(
        image_resource.chart,
        type,
        image_data.body.to_s
      )
    HTTP.delete("#{ENV.fetch("SUB_IMAGE_HOST", nil)}/download/#{response[:id]}")
    if type == :cover
      ImageConvertJob.perform_later(resource, :background)
      image_resource.destroy
    end
    ApplicationController.revalidate("/charts/#{image_resource.chart.name}")
  end
end
