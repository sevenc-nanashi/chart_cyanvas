# frozen_string_literal: true
require "base64"
require "http"
require "json"

class BgmConvertJob < ApplicationJob
  queue_as :default

  def perform(chart_name, bgm_file_id)
    bgm_file = TemporaryFile.find(bgm_file_id)
    logger.info "BgmConvertJob: #{bgm_file.id}"
    response =
      HTTP
        .post(
          "#{ENV.fetch("HOSTS_SUB_AUDIO", nil)}/convert",
          json: {
            url: bgm_file.url
          }
        )
        .then { JSON.parse(_1.body.to_s, symbolize_names: true) }
    raise "Failed to convert bgm file!" if response[:code] != "ok"
    logger.info "BgmConvertJob: #{bgm_file.id}: downloading: #{response[:id]}"
    bgm_data =
      HTTP.get(
        "#{ENV.fetch("HOSTS_SUB_AUDIO", nil)}/download/#{response[:id]}:bgm"
      )
    raise "Failed to download bgm file!" if bgm_data.status != 200
    FileResource.upload_from_string(chart_name, :bgm, bgm_data.body.to_s)
    HTTP.delete(
      "#{ENV.fetch("HOSTS_SUB_AUDIO", nil)}/download/#{response[:id]}:bgm"
    )

    preview_data =
      HTTP.get(
        "#{ENV.fetch("HOSTS_SUB_AUDIO", nil)}/download/#{response[:id]}:preview"
      )
    raise "Failed to download preview file!" if preview_data.status != 200
    FileResource.upload_from_string(
      chart_name,
      :preview,
      preview_data.body.to_s
    )
    HTTP.delete(
      "#{ENV.fetch("HOSTS_SUB_AUDIO", nil)}/download/#{response[:id]}:preview"
    )

    bgm_file.delete
  end
end