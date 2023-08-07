# frozen_string_literal: true

class AllChartConvertJob < ApplicationJob
  queue_as :default

  def perform()
    chart_list = FileResource.where(kind: :chart)
    logger.info "AllChartConvertJob: #{chart_list.count}"

    chart_list.each { |chart_resource| ChartConvertJob.perform_later(chart_resource) }
  end
end
