# frozen_string_literal: true
class AddOwnerToUsers < ActiveRecord::Migration[7.0]
  def change
    add_reference :users, :owner, null: true, foreign_key: { to_table: :users }
    change_column :users, :handle, :string, null: false
  end
end
