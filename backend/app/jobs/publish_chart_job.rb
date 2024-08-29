# frozen_string_literal: true
class PublishChartJob < ApplicationJob
  queue_as :default

  def perform(chart_id)
    chart = Chart.find(chart_id)
    unless chart
      Rails.logger.error("Chart with id #{chart_id} not found")
      return
    end

    args = { visibility: :public, scheduled_job_id: nil }
    args[:published_at] = Time.zone.now unless chart.published_at

    chart.update!(**args)

    if (webhook = ENV.fetch("DISCORD_WEBHOOK", nil))
      $discord.post(
        webhook,
        json: {
          content: "#{ENV.fetch("FINAL_HOST")}/charts/#{chart.name}"
        }
      )
    end

    Rails.logger.info("Chart ##{chart.name} published")
  end
end
