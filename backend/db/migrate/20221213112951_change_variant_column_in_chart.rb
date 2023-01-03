class ChangeVariantColumnInChart < ActiveRecord::Migration[7.0]
  def change
    rename_column :charts, :variant_of_id, :variant_id
  end
end
