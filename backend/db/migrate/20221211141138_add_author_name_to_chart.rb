class AddAuthorNameToChart < ActiveRecord::Migration[7.0]
  def change
    add_column :charts, :author_name, :string, null: true
  end
end
