# frozen_string_literal: true
class AddChartDeletedToUserWarning < ActiveRecord::Migration[8.0]
  def change
    add_column :user_warnings, :chart_deleted, :boolean, null: false, default: true
  end
end
