# frozen_string_literal: true

class AddLowerIndexToTagsName < ActiveRecord::Migration[8.0]
  def change
    add_index :tags, "lower(name)", name: "index_tags_on_lower_name"
  end
end