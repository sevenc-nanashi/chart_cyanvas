# frozen_string_literal: true
class AddChartTitleToUserWarnings < ActiveRecord::Migration[8.0]
  def change
    add_column :user_warnings, :chart_title, :string
  end
end
