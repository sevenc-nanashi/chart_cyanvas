class CreateFileResources < ActiveRecord::Migration[7.0]
  def change
    create_table :file_resources do |t|
      t.string :name
      t.string :sha1
      t.string :kind

      t.timestamps
    end
  end
end
