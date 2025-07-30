# frozen_string_literal: true
class ChangeVisibiltyName < ActiveRecord::Migration[7.0]
  def change
    add_column :charts, :visibility, :integer, default: 0
    MigrationChart.find_each do |chart|
      chart.update_attribute(:visibility, chart.is_public ? 1 : 0)
    end
    remove_column :charts, :is_public, :boolean

    add_column :charts, :scheduled_job_id, :string

    rename_column :charts, :is_sus_public, :is_chart_public
  end

  class MigrationChart < ActiveRecord::Base
    self.table_name = :charts
  end
end
