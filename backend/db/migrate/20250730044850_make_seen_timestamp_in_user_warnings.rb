class MakeSeenTimestampInUserWarnings < ActiveRecord::Migration[8.0]
  def change
    reversible do |dir|
      dir.up do
        add_column :user_warnings, :seen_at, :datetime, null: true
        # Set seen_at to updated_at for existing warnings where seen is true
        execute <<-SQL.squish
          UPDATE user_warnings
          SET seen_at = updated_at
          WHERE seen = true
        SQL
        # Remove the seen column
        remove_column :user_warnings, :seen
      end

      dir.down do
        add_column :user_warnings, :seen, :boolean, null: false, default: false
        execute <<-SQL.squish
          UPDATE user_warnings
          SET seen = true
          WHERE seen_at IS NOT NULL
        SQL
        remove_column :user_warnings, :seen_at
      end
    end
  end
end
