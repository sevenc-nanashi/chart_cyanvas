class AddCounterCultureToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :charts_count, :integer, default: 0, null: false

    # Chart.counter_culture_fix_counts
  end
end
