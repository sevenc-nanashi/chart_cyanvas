class RemoveUniqueFromUserName < ActiveRecord::Migration[7.0]
  def change
    change_column :users, :name, :string, null: false, unique: false, index: false
  end
end
