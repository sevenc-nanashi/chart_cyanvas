# frozen_string_literal: true
class AddIndexChartsPublishedAtAndUpdatedAt < ActiveRecord::Migration[8.0]
  def change
    add_index :charts, :published_at, name: "index_charts_on_published_at"
    add_index :charts, :updated_at, name: "index_charts_on_updated_at"
  end
end
