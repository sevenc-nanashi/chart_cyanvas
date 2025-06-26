class AddCounterCulture < ActiveRecord::Migration[7.0]
  class MigrationLike < ActiveRecord::Base
    self.table_name = 'likes'

    belongs_to :chart, class_name: 'MigrationChart', foreign_key: 'chart_id'
    counter_culture :chart, column_name: 'likes_count'
  end

  class MigrationChart < ActiveRecord::Base
    self.table_name = 'charts'

    has_many :likes, class_name: 'MigrationLike', foreign_key: 'chart_id'
  end

  def change
    add_column :charts, :likes_count, :integer, default: 0, null: false

    MigrationLike.counter_culture_fix_counts
  end
end
