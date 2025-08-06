# frozen_string_literal: true
require "base64"
require "http"
require "json"

class BgmConvertJob < ApplicationJob
  queue_as :default

  def perform(chart_name, bgm_file)
    logger.info "BgmConvertJob: #{bgm_file}"
    response =
      HTTP
        .post(
          "#{ENV.fetch("HOSTS_SUB_AUDIO", nil)}/convert",
          json: {
            url: bgm_file
          }
        )
        .then { JSON.parse(it.body.to_s, symbolize_names: true) }
    raise "Failed to convert bgm file!" if response[:code] != "ok"
    logger.info "BgmConvertJob: downloading: bgm=#{response[:bgm_url]}, preview=#{response[:preview_url]}"
    bgm_data = HTTP.get(response[:bgm_url])
    raise "Failed to download bgm file!" if bgm_data.status != 200
    FileResource.upload_from_string(chart_name, :bgm, bgm_data.body.to_s)

    preview_data = HTTP.get(response[:preview_url])
    raise "Failed to download preview file!" if preview_data.status != 200
    FileResource.upload_from_string(
      chart_name,
      :preview,
      preview_data.body.to_s
    )
  end
end

