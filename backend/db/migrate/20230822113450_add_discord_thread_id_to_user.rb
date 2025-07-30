# frozen_string_literal: true
class AddDiscordThreadIdToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :discord_thread_id, :string
  end
end
