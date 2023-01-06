# frozen_string_literal: true
require "base64"
require "http"
require "json"

class BgmConvertJob < ApplicationJob
  queue_as :default

  def perform(bgm_resource)
    logger.info "BgmConvertJob: #{bgm_resource.id}"
    response =
      HTTP
        .post(
          "#{ENV.fetch("SUB_AUDIO_HOST", nil)}/convert",
          json: {
            url: bgm_resource.to_frontend
          }
        )
        .then { JSON.parse(_1.body.to_s, symbolize_names: true) }
    raise "Failed to convert bgm file!" if response[:code] != "ok"
    logger.info "BgmConvertJob: #{bgm_resource.id}: downloading: #{response[:id]}"
    bgm_data =
      HTTP.get("#{ENV.fetch("SUB_AUDIO_HOST", nil)}/download/#{response[:id]}:bgm")
    raise "Failed to download bgm file!" if bgm_data.status != 200
    FileResource.upload_from_string(
      bgm_resource.chart,
      :bgm,
      bgm_data.body.to_s
    )
    HTTP.delete("#{ENV.fetch("SUB_AUDIO_HOST", nil)}/download/#{response[:id]}:bgm")

    preview_data =
      HTTP.get("#{ENV.fetch("SUB_AUDIO_HOST", nil)}/download/#{response[:id]}:preview")
    raise "Failed to download preview file!" if preview_data.status != 200
    FileResource.upload_from_string(
      bgm_resource.chart,
      :preview,
      preview_data.body.to_s
    )
    HTTP.delete("#{ENV.fetch("SUB_AUDIO_HOST", nil)}/download/#{response[:id]}:preview")

    ApplicationController.revalidate("/charts/#{bgm_resource.chart.name}")
    bgm_resource.destroy
  end
end
