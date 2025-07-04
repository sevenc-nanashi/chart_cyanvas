# frozen_string_literal: true
# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)
user =
  User.create!(
    handle: "1073",
    name: "Nanashi.",
    about_me: "I'm admin.",
    avatar_type: "default",
    avatar_fg_type: "player",
    avatar_fg_color: "#fff",
    avatar_bg_type: "default",
    avatar_bg_color: "#48b0d5"
  )
user.alt_users.create!(
  handle: "x740",
  name: "Nanatsuki Kuten",
  about_me: "Alt account of Nanashi.",
  avatar_type: "default",
  avatar_fg_type: "player",
  avatar_fg_color: "#48b0d5",
  avatar_bg_type: "default",
  avatar_bg_color: "#fff"
)
