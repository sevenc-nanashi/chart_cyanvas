class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.integer :handle, null: false, unique: true, index: true
      t.string :name, null: false, unique: true, index: true
      t.text :about_me, null: false

      t.timestamps
    end
  end
end
