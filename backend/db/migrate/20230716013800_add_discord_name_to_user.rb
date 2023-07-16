class AddDiscordNameToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :discord_display_name, :string
    add_column :users, :discord_username, :string
    add_column :users, :discord_avatar, :string
  end
end
