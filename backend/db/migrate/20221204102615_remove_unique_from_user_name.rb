# frozen_string_literal: true
class RemoveUniqueFromUserName < ActiveRecord::Migration[7.0]
  def change
    change_column :users, # rubocop:disable Rails/ReversibleMigration
                  :name,
                  :string,
                  null: false,
                  unique: false,
                  index: false
  end
end
