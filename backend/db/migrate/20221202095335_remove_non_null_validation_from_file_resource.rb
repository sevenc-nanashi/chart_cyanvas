# frozen_string_literal: true
class RemoveNonNullValidationFromFileResource < ActiveRecord::Migration[7.0]
  def change
    change_column_null :file_resources, :chart_id, true
  end
end
