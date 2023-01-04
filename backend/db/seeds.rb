# frozen_string_literal: true
# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)
user = User.create!(
  handle: 1073,
  name: "Nanashi.",
  about_me: "I'm a admin.",
  fg_color: "#fff",
  bg_color: "#48b0d5"
)
user.create_user!(
  handle: 740,
  name: "Nanatsuki Kuten",
  about_me: "Alt account of Nanashi.",
  fg_color: "#48b0d5",
  bg_color: "#fff"
)
