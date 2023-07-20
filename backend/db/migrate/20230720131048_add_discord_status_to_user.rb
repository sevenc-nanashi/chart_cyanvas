class AddDiscordStatusToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :discord_status, :integer
  end
end
