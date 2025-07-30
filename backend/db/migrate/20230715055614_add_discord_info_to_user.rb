# frozen_string_literal: true
class AddDiscordInfoToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :discord_id, :string
    add_column :users, :discord_token, :string
    add_column :users, :discord_refresh_token, :string
    add_column :users, :discord_expires_at, :datetime
  end
end
