# frozen_string_literal: true
class SetPublishedAt < ActiveRecord::Migration[7.0]
  class MigrationChart < ActiveRecord::Base
    self.table_name = "charts"
  end
  def change
    MigrationChart.find_each do |chart|
      if chart.published_at.nil?
        chart.update(published_at: chart.updated_at)
      end
    end
  end
end
