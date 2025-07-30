# frozen_string_literal: true
class RebuildChart < ActiveRecord::Migration[7.0]
  def change
    drop_table :charts, force: :cascade # rubocop:disable Rails/ReversibleMigration
    create_table :charts do |t|
      t.string :name, null: false, unique: true, index: true

      t.string :title, null: false
      t.string :artists, null: false
      t.references :author, null: false, foreign_key: { to_table: :users }
      t.text :description, null: false
      t.integer :rating, null: false

      t.boolean :is_public, null: false, default: false
      t.boolean :is_deleted, null: false, default: false
      t.boolean :is_sus_public, null: false, default: false

      t.references :variant_of, null: true, foreign_key: { to_table: :charts }

      t.timestamps
    end

    drop_table :file_resources, force: :cascade # rubocop:disable Rails/ReversibleMigration
    create_table :file_resources do |t|
      t.references :chart, null: false, foreign_key: true
      t.string :name, null: false, unique: true, index: true
      t.integer :kind, null: false
      t.string :sha1, null: false

      t.timestamps
    end
  end
end
