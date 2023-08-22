class AddWarnCountToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :warn_count, :integer, default: 0
  end
end
