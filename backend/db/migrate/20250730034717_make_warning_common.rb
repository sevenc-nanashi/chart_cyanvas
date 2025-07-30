class MakeWarningCommon < ActiveRecord::Migration[8.0]
  def change
    add_column :user_warnings, :target_type, :integer, null: false, default: 0
    rename_column :user_warnings, :chart_title, :target_name
    change_column_null :user_warnings, :target_name, true
  end
end
