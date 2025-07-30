# frozen_string_literal: true
class AddNewAvatarPropertiesToUser < ActiveRecord::Migration[8.0]
  def change
    rename_column :users, :fg_color, :avatar_fg_color
    rename_column :users, :bg_color, :avatar_bg_color
    add_column :users, :avatar_type, :string, null: false, default: "default"
    add_column :users, :avatar_fg_type, :string, null: false, default: "player"
    add_column :users, :avatar_bg_type, :string, null: false, default: "default"
  end
end
