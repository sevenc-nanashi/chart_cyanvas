# frozen_string_literal: true
class AddChartToFileResource < ActiveRecord::Migration[7.0]
  def change
    add_reference :file_resources, :chart, null: false, foreign_key: true # rubocop:disable Rails/NotNullColumn
  end
end
