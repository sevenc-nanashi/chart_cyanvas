# frozen_string_literal: true
class CreateCharts < ActiveRecord::Migration[7.0]
  def change
    create_table :charts do |t|
      t.string :name, null: false, unique: true, index: true

      t.string :title, null: false
      t.string :artists, null: false
      t.references :author, null: false, foreign_key: { to_table: :users }

      t.references :data, null: true, foreign_key: { to_table: :file_resources }

      t.references :cover, null: false, foreign_key: { to_table: :file_resources }
      t.references :bgm, null: false, foreign_key: { to_table: :file_resources }
      t.references :sus, null: false, foreign_key: { to_table: :file_resources }

      t.timestamps
    end
  end
end
