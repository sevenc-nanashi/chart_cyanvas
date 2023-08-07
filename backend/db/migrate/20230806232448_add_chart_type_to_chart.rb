class AddChartTypeToChart < ActiveRecord::Migration[7.0]
  def change
    add_column :charts, :chart_type, :integer, default: 0
  end
end
