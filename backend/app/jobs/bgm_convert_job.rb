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
          "#{ENV["SUB_AUDIO_HOST"]}/convert",
          json: {
            url: bgm_resource.to_frontend
          }
        )
        .then { JSON.parse(_1.body.to_s, symbolize_names: true) }
    raise "Failed to convert bgm file!" if response[:code] != "ok"
    logger.info "BgmConvertJob: #{bgm_resource.id}: downloading bgm: #{response[:bgm_id]}"
    bgm_data =
      HTTP.get("#{ENV["SUB_AUDIO_HOST"]}/download/#{response[:bgm_id]}")
    raise "Failed to download bgm file!" if bgm_data.status != 200
    FileResource.upload_from_string(
      bgm_resource.chart,
      :bgm,
      bgm_data.body.to_s
    )
    HTTP.delete("#{ENV["SUB_AUDIO_HOST"]}/download/#{response[:bgm_id]}")

    logger.info "BgmConvertJob: #{bgm_resource.id}: downloading preview: #{response[:preview_id]}"
    preview_data =
      HTTP.get("#{ENV["SUB_AUDIO_HOST"]}/download/#{response[:preview_id]}")
    raise "Failed to download preview file!" if preview_data.status != 200
    FileResource.upload_from_string(
      bgm_resource.chart,
      :preview,
      preview_data.body.to_s
    )
    HTTP.delete("#{ENV["SUB_AUDIO_HOST"]}/download/#{response[:preview_id]}")

    bgm_resource.destroy
  end
end
