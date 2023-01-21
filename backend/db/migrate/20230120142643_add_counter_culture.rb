class AddCounterCulture < ActiveRecord::Migration[7.0]
  def change
    add_column :charts, :likes_count, :integer, default: 0, null: false

    Like.counter_culture_fix_counts
  end
end
