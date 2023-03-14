# frozen_string_literal: true

class AllSusConvertJob < ApplicationJob
  queue_as :default

  def perform()
    sus_list = FileResource.where(kind: :sus)
    logger.info "AllSusConvertJob: #{sus_list.count}"

    sus_list.each { |sus_resource| SusConvertJob.perform_now(sus_resource) }
  end
end
