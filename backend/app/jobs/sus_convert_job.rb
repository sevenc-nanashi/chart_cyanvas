# frozen_string_literal: true
require "base64"
require "http"
require "json"

class SusConvertJob < ApplicationJob
  queue_as :default

  def perform(sus_resource)
    logger.info "SusConvertJob: #{sus_resource.id}"
    response =
      HTTP
        .post(
          "#{ENV.fetch("SUB_SUS_HOST", nil)}/convert",
          json: {
            url: sus_resource.to_frontend
          }
        )
        .then { JSON.parse(_1.body.to_s, symbolize_names: true) }
    logger.info "SusConvertJob: #{sus_resource.id} done"
    raise "Failed to convert level data!" if response[:code] != "ok"
    sus_data =
      HTTP.get("#{ENV.fetch("SUB_SUS_HOST", nil)}/download/#{response[:id]}")
    raise "Failed to download level data!" if sus_data.status != 200
    FileResource.upload_from_string(
      sus_resource.chart.name,
      :data,
      sus_data.body.to_s
    )

    ApplicationController.revalidate("/charts/#{sus_resource.chart.name}")
  end
end
