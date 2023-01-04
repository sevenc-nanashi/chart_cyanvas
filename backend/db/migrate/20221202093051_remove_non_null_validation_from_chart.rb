# frozen_string_literal: true
class RemoveNonNullValidationFromChart < ActiveRecord::Migration[7.0]
  def change
    change_column_null :charts, :data_id, true
    change_column_null :charts, :cover_id, true
    change_column_null :charts, :bgm_id, true
    change_column_null :charts, :sus_id, true
  end
end
