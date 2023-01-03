class AddComposerFieldToChart < ActiveRecord::Migration[7.0]
  def change
    rename_column :charts, :artists, :composer
    add_column :charts, :artist, :string, null: true
  end
end
