# frozen_string_literal: true
class AddScheduleDateToChart < ActiveRecord::Migration[7.0]
  def change
    add_column :charts, :scheduled_at, :datetime
  end
end
