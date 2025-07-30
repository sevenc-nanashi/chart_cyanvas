# frozen_string_literal: true
class AddPublishedAtToChart < ActiveRecord::Migration[7.0]
  def change
    add_column :charts, :published_at, :datetime, null: true
  end
end
