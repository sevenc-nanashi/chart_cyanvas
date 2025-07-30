# frozen_string_literal: true
class FillAuthorName < ActiveRecord::Migration[7.0]
  class MigrationChart < ActiveRecord::Base
    self.table_name = :charts
    belongs_to :author, class_name: "MigrationAuthor"
  end
  class MigrationAuthor < ActiveRecord::Base
    self.table_name = :users
    has_many :charts, class_name: "MigrationChart"
  end
  def change
    MigrationChart.find_each do |chart|
      next unless chart.author_name.nil? || chart.author_name.strip.empty?
      chart.update!(author_name: chart.author&.name)
    end
    change_column_null :charts, :author_name, false
  end
end
