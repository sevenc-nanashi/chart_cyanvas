# frozen_string_literal: true
# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

require "color-generator"

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

musics = {
  "menuettm.mp3" => "モーツァルト「メヌエット」",
  "eine.mp3" => "モーツァルト「アイネ・クライネ・ナハトムジーク」",
  "symphony7.mp3" => "ベートーヴェン「交響曲第7番1楽章」",
  "springsonate.mp3" => "ベートーヴェン「ヴァイオリン・ソナタ第5番1楽章　春」",
  "asibue.mp3" => "チャイコフスキー「あし笛の踊り」",
  "hana.mp3" => "チャイコフスキー「花のワルツ」",
  "clapolka.mp3" => "ポーランド民謡「クラリネット・ポルカ」",
  "hakucyou.mp3" => "サンサーンス「白鳥」",
  "harunouta.mp3" => "メンデルスゾーン「春の歌」",
  "intermezzo.mp3" => "ビゼー「インテルメッツオ」",
  "ifudoudou.mp3" => "エルガー「威風堂々」",
  "amairo.mp3" => "ドビュッシー「亜麻色の髪の乙女」",
  "kiniro.mp3" => "ドビュッシー「金色の魚」",
  "peterwolf.mp3" => "プロコフィエフ「凱旋の行進」"
}

user_ids = (1..999).to_a.shuffle

dummy_chart_path = Rails.root.join("db/seed_assets/dummy.usc")

musics.each_with_index do |(file_name, title), index|
  author =
    User.create!(
      handle: user_ids.pop.to_s,
      name: "Dummy User #{index + 1}",
      about_me: "This is a dummy user from seeder.",
      avatar_type: "default",
      avatar_fg_type: "player",
      avatar_fg_color:
        "##{ColorGenerator.new(saturation: 0.5, lightness: 0.5).create_hex}",
      avatar_bg_type: "default",
      avatar_bg_color: "#fff"
    )
  title_parsed = title.match(/^(.*)「(.*)」$/)

  chart =
    author.charts.create!(
      name: Chart.uuid,
      title: title_parsed[2],
      composer: title_parsed[1],
      artist: "Dummy Artist",
      description: "This is a dummy chart. Index: #{index}",
      genre: :others,
      rating: 20 + index,
      author_name: author.name,
      variant_of: nil,
      is_chart_public: true,
      visibility: :public,
      published_at: Time.current + (index * 10).seconds
    )
  ChartConvertJob.perform_later(
    chart.name,
    FileResource.upload_from_string(
      chart.name,
      :chart,
      dummy_chart_path.read(mode: "rb")
    )
  )
  BgmConvertJob.perform_later(
    chart.name,
    TemporaryFile.upload(
      Rails.root.join("db", "seed_assets", "musics", file_name).read(mode: "rb")
    )
  )
  ImageConvertJob.perform_now(
    chart.name,
    TemporaryFile.upload(
      Rails
        .root
        .join("db", "seed_assets", "covers", file_name.sub(/\.mp3$/, ".png"))
        .read(mode: "rb")
    ),
    :cover
  )
end
