class SetPublishedAt < ActiveRecord::Migration[7.0]
  def change
    Chart.find_each do |chart|
      if chart.published_at.nil?
        chart.update(published_at: chart.updated_at)
      end
    end
  end
end
