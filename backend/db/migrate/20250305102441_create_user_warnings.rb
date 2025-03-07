# frozen_string_literal: true

class CreateUserWarnings < ActiveRecord::Migration[8.0]
  class MigrationUser < ApplicationRecord
    self.table_name = :users
  end
  class MigrationUserWarning < ApplicationRecord
    self.table_name = :user_warnings

    belongs_to :user, class_name: "MigrationUser"
    belongs_to :moderator, class_name: "MigrationUser", optional: true

    enum :level, { hard: 1, soft: 0 }
  end

  def up
    create_table :user_warnings do |t|
      t.timestamps

      t.belongs_to :user, null: false, foreign_key: true
      t.belongs_to :moderator, null: true, foreign_key: { to_table: :users }
      t.text :reason, null: true
      t.integer :level, null: false
      t.boolean :seen, null: false, default: false
    end

    MigrationUser.find_each do |user|
      warn_count = user.warn_count
      next if warn_count.zero?

      warn_count.times do
        MigrationUserWarning.create!(user: user, level: 1, seen: false)
      end
    end

    remove_column :users, :warn_count
  end

  def down
    add_column :users, :warn_count, :integer, default: 0, null: false

    MigrationUserWarning.find_each do |warning|
      user = warning.user
      user.increment!(:warn_count)
    end

    drop_table :user_warnings
  end
end
