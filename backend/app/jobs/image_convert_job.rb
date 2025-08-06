# frozen_string_literal: true
require "base64"
require "http"
require "json"

class ImageConvertJob < ApplicationJob
  queue_as :default

  def perform(chart_name, image_file_url, type)
    logger.info "ImageConvertJob: #{image_file_url} #{type}"
    response =
      HTTP
        .post(
          "#{
            ENV.fetch("HOSTS_SUB_IMAGE") { raise "HOSTS_SUB_IMAGE not set" }
          }/convert",
          json: {
            url: image_file_url,
            type:
          }
        )
        .then { JSON.parse(it.body.to_s, symbolize_names: true) }
    raise "Failed to convert image file!" if response[:code] != "ok"
    logger.info "ImageConvertJob: downloading image: #{response[:id]}"
    image_data = HTTP.get(response[:url])
    raise "Failed to download image file!" if image_data.status != 200
    resource =
      FileResource.upload_from_string(chart_name, type, image_data.body.to_s)
    if type == :cover
      ImageConvertJob.perform_later(chart_name, resource.url, :background_v3)
      ImageConvertJob.perform_later(chart_name, resource.url, :background_v1)
      ImageConvertJob.perform_later(
        chart_name,
        resource.url,
        :background_tablet_v3
      )
      ImageConvertJob.perform_later(
        chart_name,
        resource.url,
        :background_tablet_v1
      )
    end
  end
end
