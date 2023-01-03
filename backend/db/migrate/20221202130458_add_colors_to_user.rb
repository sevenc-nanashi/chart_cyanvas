class AddColorsToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :fg_color, :string
    add_column :users, :bg_color, :string
  end
end
