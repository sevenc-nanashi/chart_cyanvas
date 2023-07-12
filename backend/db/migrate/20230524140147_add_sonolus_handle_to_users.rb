class AddSonolusHandleToUsers < ActiveRecord::Migration[7.0]
  def up
    add_column :users, :sonolus_handle, :string, unique: true, index: true
    User.find_each do |user|
      if user.owner_id.present?
        user.update(handle: "x" + user.handle, sonolus_handle: "x" + user.handle)
      else
        user.update(sonolus_handle: user.handle)
      end
    end
    change_column :users, :sonolus_handle, :string, null: false
  end

  def down
    remove_column :users, :sonolus_handle
  end
end
