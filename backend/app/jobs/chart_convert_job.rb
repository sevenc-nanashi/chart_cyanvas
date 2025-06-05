# frozen_string_literal: true
require "base64"
require "http"
require "json"

class ChartConvertJob < ApplicationJob
  queue_as :default

  def perform(chart_resource)
    logger.info "ChartConvertJob: #{chart_resource.id}"
    response =
      HTTP
        .post(
          "#{ENV.fetch("HOSTS_SUB_CHART", nil)}/convert",
          json: {
            url: chart_resource.to_frontend
          }
        )
        .then { JSON.parse(it.body.to_s, symbolize_names: true) }
    logger.info "ChartConvertJob: #{chart_resource.id} done"
    raise "Failed to convert level data!" if response[:code] != "ok"
    chart_data =
      HTTP.get("#{ENV.fetch("HOSTS_SUB_CHART", nil)}/download/#{response[:id]}")
    raise "Failed to download level data!" if chart_data.status != 200
    FileResource.upload_from_string(
      chart_resource.chart.name,
      :data,
      chart_data.body.to_s
    )
    chart_resource.chart.update!(chart_type: response[:type].to_sym)
  end
end