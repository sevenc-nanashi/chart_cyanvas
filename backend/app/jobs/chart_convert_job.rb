# frozen_string_literal: true
require "base64"
require "http"
require "json"

class ChartConvertJob < ApplicationJob
  queue_as :default

  def perform(chart_name, chart_resource)
    logger.info "ChartConvertJob: #{chart_resource}"
    response =
      HTTP
        .post(
          "#{ENV.fetch("HOSTS_SUB_CHART", nil)}/convert",
          json: {
            url: chart_resource
          }
        )
        .then { JSON.parse(it.body.to_s, symbolize_names: true) }
    logger.info "ChartConvertJob: #{chart_resource} done"
    raise "Failed to convert level data!" if response[:code] != "ok"
    chart_data = HTTP.get(response[:url])
    raise "Failed to download level data!" if chart_data.status != 200

    chart = Chart.find_by(name: chart_name)
    FileResource.upload_from_string(chart_name, :data, chart_data.body.to_s)
    chart.update!(chart_type: response[:type].to_sym)
  end
end
