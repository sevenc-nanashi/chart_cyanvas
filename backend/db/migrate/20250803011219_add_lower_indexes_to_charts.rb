# frozen_string_literal: true

class AddLowerIndexesToCharts < ActiveRecord::Migration[8.0]
  def change
    add_index :charts, "lower(title)", name: "index_charts_on_lower_title"
    add_index :charts, "lower(composer)", name: "index_charts_on_lower_composer"
    add_index :charts, "lower(artist)", name: "index_charts_on_lower_artist"
    add_index :charts, "lower(author_name)", name: "index_charts_on_lower_author_name"
  end
end