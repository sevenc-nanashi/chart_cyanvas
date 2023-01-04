# frozen_string_literal: true
class CreateCoAuthors < ActiveRecord::Migration[7.0]
  def change
    create_table :co_authors do |t|
      t.references :chart, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
