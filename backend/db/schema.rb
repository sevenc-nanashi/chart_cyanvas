# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2023_08_06_232448) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "charts", force: :cascade do |t|
    t.string "name", null: false
    t.string "title", null: false
    t.string "composer", null: false
    t.bigint "author_id", null: false
    t.text "description", null: false
    t.integer "rating", null: false
    t.boolean "is_deleted", default: false, null: false
    t.boolean "is_chart_public", default: false, null: false
    t.bigint "variant_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "artist"
    t.string "author_name", null: false
    t.datetime "published_at"
    t.integer "likes_count", default: 0, null: false
    t.integer "visibility", default: 0
    t.string "scheduled_job_id"
    t.datetime "scheduled_at"
    t.integer "chart_type", default: 0
    t.index ["author_id"], name: "index_charts_on_author_id"
    t.index ["name"], name: "index_charts_on_name"
    t.index ["variant_id"], name: "index_charts_on_variant_id"
  end

  create_table "co_authors", force: :cascade do |t|
    t.bigint "chart_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chart_id"], name: "index_co_authors_on_chart_id"
    t.index ["user_id"], name: "index_co_authors_on_user_id"
  end

  create_table "file_resources", force: :cascade do |t|
    t.bigint "chart_id", null: false
    t.string "name", null: false
    t.integer "kind", null: false
    t.string "sha1", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chart_id"], name: "index_file_resources_on_chart_id"
    t.index ["name"], name: "index_file_resources_on_name"
  end

  create_table "likes", force: :cascade do |t|
    t.bigint "chart_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chart_id"], name: "index_likes_on_chart_id"
    t.index ["user_id"], name: "index_likes_on_user_id"
  end

  create_table "tags", force: :cascade do |t|
    t.bigint "chart_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chart_id"], name: "index_tags_on_chart_id"
    t.index ["name"], name: "index_tags_on_name"
  end

  create_table "users", force: :cascade do |t|
    t.string "handle", null: false
    t.string "name", null: false
    t.text "about_me", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "fg_color"
    t.string "bg_color"
    t.bigint "owner_id"
    t.integer "charts_count", default: 0, null: false
    t.string "sonolus_handle", null: false
    t.string "discord_id"
    t.string "discord_token"
    t.string "discord_refresh_token"
    t.datetime "discord_expires_at"
    t.string "discord_display_name"
    t.string "discord_username"
    t.string "discord_avatar"
    t.integer "discord_status"
    t.index ["handle"], name: "index_users_on_handle"
    t.index ["name"], name: "index_users_on_name"
    t.index ["owner_id"], name: "index_users_on_owner_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "charts", "charts", column: "variant_id"
  add_foreign_key "charts", "users", column: "author_id"
  add_foreign_key "co_authors", "users"
  add_foreign_key "file_resources", "charts"
  add_foreign_key "likes", "charts"
  add_foreign_key "likes", "users"
  add_foreign_key "tags", "charts"
  add_foreign_key "users", "users", column: "owner_id"
end
