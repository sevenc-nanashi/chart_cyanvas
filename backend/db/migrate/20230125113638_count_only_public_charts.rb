class CountOnlyPublicCharts < ActiveRecord::Migration[7.0]
  def change
    Chart.counter_culture_fix_counts column_name:
                                       proc { |model|
                                         model.is_public ? "charts_count" : nil
                                       },
                                     column_names: {
                                       ["charts.is_public = ?", true] =>
                                         "charts_count"
                                     }
  end
end
