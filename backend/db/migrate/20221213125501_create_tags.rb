class CreateTags < ActiveRecord::Migration[7.0]
  def change
    create_table :tags do |t|
      t.references :chart, null: false, foreign_key: true
      t.string :name, null: false, index: true

      t.timestamps
    end
  end
end
