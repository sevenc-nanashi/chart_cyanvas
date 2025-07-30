# frozen_string_literal: true
class AddColumnToChart < ActiveRecord::Migration[7.0]
  def change
    add_column :charts, :is_public, :boolean # rubocop:disable Rails/ThreeStateBooleanColumn
    add_column :charts, :is_sus_public, :boolean # rubocop:disable Rails/ThreeStateBooleanColumn

    add_column :charts, :description, :text
    add_column :charts, :rating, :integer
    add_reference :charts,
                  :is_variant_of,
                  null: true,
                  foreign_key: {
                    to_table: :charts
                  }
  end
end
